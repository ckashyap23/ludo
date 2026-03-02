import { useState, useCallback, useEffect } from "react";
import Board from "./components/Board";
import Dice from "./components/Dice";
import PlayerPanel from "./components/PlayerPanel";
import type { GameState } from "./types/game";
import * as api from "./api/client";

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<{ color: string; tokenIndex: number } | null>(
    null
  );

  const handleNewGame = useCallback(async (playerCount: number) => {
    setLoading(true);
    setError(null);
    try {
      const state = await api.createGame(playerCount);
      setGame(state);
      setDisplayRoll(null);
      setStatusMessage(null);
      setSelectedMove(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoll = useCallback(async () => {
    if (!game?.id || game.status === "finished") return;
    setLoading(true);
    setError(null);
    try {
      const rollingColor = game.active_colors[game.current_player_index] ?? "unknown";
      const rollResult = await api.rollDice(game.id);
      setDisplayRoll(rollResult.roll);
      if (rollResult.valid_moves.length === 0) {
        setStatusMessage(`Player ${rollingColor} has no moves.`);
        const passedState = await api.passTurn(game.id);
        setGame(passedState);
      } else {
        const rolledState = await api.getGame(game.id);
        setStatusMessage(null);
        setGame(rolledState);
      }
      setSelectedMove(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Roll failed");
    } finally {
      setLoading(false);
    }
  }, [game?.active_colors, game?.current_player_index, game?.id, game?.status]);

  const handleChance = useCallback(async () => {
    if (!game?.id || game.status === "finished") return;
    setLoading(true);
    setError(null);
    try {
      const state = await api.chanceTurn(game.id);
      setGame(state);
      setStatusMessage(state.message || null);
      setSelectedMove(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chance failed");
    } finally {
      setLoading(false);
    }
  }, [game?.id, game?.status]);

  const handleTokenSelect = useCallback(
    (color: string, tokenIndex: number) => {
      if (!game?.id || game.status === "finished") return;
      setSelectedMove((prev) =>
        prev && prev.color === color && prev.tokenIndex === tokenIndex ? null : { color, tokenIndex }
      );
    },
    [game?.id, game?.status]
  );

  const handleTileClick = useCallback(
    async (tile: {
      target_kind: "path" | "home";
      path_index: number | null;
      home_index: number | null;
      home_color?: "red" | "blue" | "yellow" | "green";
    }) => {
      if (!game?.id || game.status === "finished" || !selectedMove) return;

      const selectedToken = game.tokens.find(
        (t) => t.color === selectedMove.color && t.token_index === selectedMove.tokenIndex
      );
      if (!selectedToken) return;

      const expectedMove = game.valid_moves.find(
        (m) => m.color === selectedMove.color && m.token_index === selectedMove.tokenIndex
      );
      if (!expectedMove) {
        setError("Selected token is not movable");
        return;
      }

      if (
        tile.target_kind !== expectedMove.target_kind ||
        tile.path_index !== expectedMove.path_index ||
        tile.home_index !== expectedMove.home_index
      ) {
        if (expectedMove.target_kind === "path" && expectedMove.path_index != null) {
          setError(`Must place on tile ${expectedMove.path_index}`);
        } else {
          setError("Must place on the highlighted home tile");
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const state = await api.moveToken(game.id, selectedMove.color, selectedMove.tokenIndex, {
          target_kind: tile.target_kind,
          path_index: tile.path_index,
          home_index: tile.home_index,
        });
        setGame(state);
        setStatusMessage(null);
        setSelectedMove(null);
      } catch (e) {
        // Keep selection on invalid placement so player can try another tile.
        setError(e instanceof Error ? e.message : "Move failed");
      } finally {
        setLoading(false);
      }
    },
    [game?.id, game?.status, game?.last_roll, game?.tokens, selectedMove]
  );

  useEffect(() => {
    setSelectedMove(null);
  }, [game?.id, game?.current_player_index, game?.last_roll]);
  const currentPlayer =
    game && game.active_colors.length > 0
      ? game.active_colors[game.current_player_index] ?? null
      : null;
  const nextPlayerToRoll =
    game && game.active_colors.length > 0
      ? game.has_rolled && game.valid_moves.length > 0
        ? game.last_roll === 6
          ? currentPlayer
          : game.active_colors[(game.current_player_index + 1) % game.active_colors.length] ?? null
        : currentPlayer
      : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ludo</h1>
          <p className="text-sm text-slate-400">
            Roll the dice, move a token. Roll 6 to leave the yard; exact roll to reach home.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleNewGame(2)}
            disabled={loading}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            New 2-Player Game
          </button>
          <button
            type="button"
            onClick={() => handleNewGame(4)}
            disabled={loading}
            className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
          >
            New 4-Player Game
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6 lg:flex-row lg:items-start">
        <Board
          game={game}
          onTokenClick={handleTokenSelect}
          onTileClick={handleTileClick}
          selectedMove={selectedMove}
        />
        <aside className="flex shrink-0 flex-col gap-6 lg:w-80">
          <Dice
            value={displayRoll}
            onRoll={handleRoll}
            onChance={handleChance}
            currentPlayer={currentPlayer}
            nextPlayer={nextPlayerToRoll}
            statusMessage={statusMessage}
            disabled={
              loading ||
              !game?.id ||
              game.status !== "active" ||
              (game.has_rolled && game.valid_moves.length > 0)
            }
            chanceDisabled={loading || !game?.id || game.status !== "active" || game.has_rolled}
            mustMove={game?.has_rolled === true && game.valid_moves.length > 0}
          />
          <PlayerPanel game={game} />
        </aside>
      </main>
    </div>
  );
}
