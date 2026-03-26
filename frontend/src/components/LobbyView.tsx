import { useState } from "react";
import type { LobbyState } from "../types/game";
import { useAuth } from "../context/AuthContext";

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-ludo-red",
  blue: "bg-ludo-blue",
  yellow: "bg-ludo-yellow",
  green: "bg-ludo-green",
};

interface LobbyViewProps {
  lobby: LobbyState;
  myPlayerId: string;
  onReady: () => void;
  hasClickedReady: boolean;
  onNewGame: (playerCount: 2 | 4) => void;
  newGameLoading?: boolean;
  isHost: boolean;
  onSignIn: () => void;
}

export default function LobbyView({
  lobby,
  myPlayerId,
  onReady,
  hasClickedReady,
  onNewGame,
  newGameLoading,
  isHost,
  onSignIn,
}: LobbyViewProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  void myPlayerId;

  const shareUrl = window.location.href;

  const handleCopy = () => {
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filledSlots = lobby.players.length;
  const waitingSlots = lobby.player_count - filledSlots;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-6 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-5 shadow-xl sm:p-8">
        <h1 className="text-2xl font-bold text-white">Ludo Lobby</h1>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          {lobby.player_count}-player game &middot; {filledSlots}/{lobby.player_count} joined
        </p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Share link</p>
          <div className="mt-1 flex flex-col gap-2 rounded-xl bg-slate-700 px-3 py-3 sm:flex-row sm:items-center">
            <span className="min-w-0 flex-1 break-all text-sm text-slate-200 sm:truncate">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className="w-full shrink-0 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 sm:w-auto sm:py-1"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Players</p>
          {lobby.players.map((p) => (
            <div
              key={p.player_index}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-700 px-4 py-3"
            >
              <span
                className={`h-4 w-4 shrink-0 rounded-full ${COLOR_CLASSES[p.color] ?? "bg-slate-500"}`}
              />
              <span className="flex-1 text-sm font-medium text-slate-200">
                {p.display_name}
                {p.player_index === 0 && (
                  <span className="ml-2 text-xs text-slate-400">(Host)</span>
                )}
              </span>
              {p.ready ? (
                <span className="text-xs font-semibold text-emerald-400">Ready</span>
              ) : (
                <span className="text-xs text-slate-500">Waiting...</span>
              )}
            </div>
          ))}
          {Array.from({ length: waitingSlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-slate-600 px-4 py-3"
            >
              <span className="h-4 w-4 shrink-0 rounded-full bg-slate-600" />
              <span className="text-sm text-slate-500">Waiting for player...</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {hasClickedReady ? (
            <div className="rounded-xl bg-slate-700 px-4 py-3 text-center text-sm text-slate-400">
              Waiting for other players to click Start...
            </div>
          ) : (
            <button
              onClick={onReady}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Start Game
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-slate-700 pt-5">
          {isHost ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Start a different game instead
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => onNewGame(2)}
                  disabled={newGameLoading}
                  className="flex-1 rounded-xl bg-slate-600 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
                >
                  New 2-Player
                </button>
                <button
                  onClick={() => onNewGame(4)}
                  disabled={newGameLoading}
                  className="flex-1 rounded-xl bg-slate-600 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
                >
                  New 4-Player
                </button>
              </div>
            </>
          ) : !user ? (
            <div className="text-center">
              <p className="text-xs leading-5 text-slate-500">Sign in to save your game history &amp; stats.</p>
              <button
                onClick={onSignIn}
                className="mt-3 rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                type="button"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
