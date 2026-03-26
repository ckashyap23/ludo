import { useEffect, useRef, useState, useCallback } from "react";
import { getWsUrl } from "../api/client";
import type { GameState, LobbyState, WsMessage } from "../types/game";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface GameSocketState {
  lobbyState: LobbyState | null;
  gameState: GameState | null;
  lastEvent: string | null;
  connectionStatus: ConnectionStatus;
  opponentRolling: boolean;
  resumeReadyCount: number;
  resumeNeeded: number;
  sendMessage: (msg: object) => void;
}

export function useGameSocket(
  gameId: string,
  playerId: string | null,
  onGameState?: (gs: GameState) => void,
  onGameReset?: (lobby: LobbyState) => void
): GameSocketState {
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [opponentRolling, setOpponentRolling] = useState(false);
  const [resumeReadyCount, setResumeReadyCount] = useState(0);
  const [resumeNeeded, setResumeNeeded] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const maxAttempts = 5;
  const unmountedRef = useRef(false);

  const applyGameState = useCallback(
    (gs: GameState) => {
      setGameState(gs);
      onGameState?.(gs);
    },
    [onGameState]
  );

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    if (!playerId || unmountedRef.current) return;

    setConnectionStatus("connecting");
    const url = getWsUrl(gameId, playerId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptsRef.current = 0;
      setConnectionStatus("connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string) as WsMessage;
      } catch {
        return;
      }

      if (msg.lobby) setLobbyState(msg.lobby);

      switch (msg.type) {
        case "sync":
          if (msg.game) applyGameState(msg.game);
          break;
        case "player_joined":
        case "player_ready":
        case "player_disconnected":
          break;
        case "game_started":
          if (msg.game) applyGameState(msg.game);
          break;
        case "resume_ready":
          setResumeReadyCount(msg.resume_count ?? 0);
          setResumeNeeded(msg.resume_needed ?? 0);
          break;
        case "game_state_updated":
        case "game_finished":
        case "game_paused":
          setOpponentRolling(false);
          if (msg.game) applyGameState(msg.game);
          if (msg.event) setLastEvent(msg.event);
          break;
        case "game_resumed":
          setOpponentRolling(false);
          setResumeReadyCount(0);
          setResumeNeeded(0);
          if (msg.game) applyGameState(msg.game);
          if (msg.event) setLastEvent(msg.event);
          break;
        case "game_reset":
          if (msg.lobby) {
            setLobbyState(msg.lobby);
            onGameReset?.(msg.lobby);
          }
          setGameState(null);
          break;
        case "opponent_rolling":
          setOpponentRolling(true);
          break;
        case "opponent_rolling_stop":
          setOpponentRolling(false);
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setConnectionStatus("disconnected");
      attemptsRef.current += 1;
      if (attemptsRef.current < maxAttempts) {
        const delay = Math.min(1000 * 2 ** attemptsRef.current, 16000);
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [gameId, playerId, applyGameState, onGameReset]);

  useEffect(() => {
    unmountedRef.current = false;
    if (playerId) connect();
    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, [gameId, playerId, connect]);

  return { lobbyState, gameState, lastEvent, connectionStatus, opponentRolling, resumeReadyCount, resumeNeeded, sendMessage };
}
