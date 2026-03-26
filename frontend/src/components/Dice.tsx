import { useRef, type ReactNode } from "react";

interface DiceProps {
  value: number | null;
  onRollPressStart: () => void;
  onRollPressEnd: () => void;
  onChance: () => void;
  controls?: ReactNode;
  showChance?: boolean;
  rolling?: boolean;
  disabled?: boolean;
  chanceDisabled?: boolean;
  /** Show "Move a token" when roll done and valid moves exist */
  mustMove?: boolean;
  currentPlayer?: string | null;
  isMyTurn?: boolean;
}

export default function Dice({
  value,
  onRollPressStart,
  onRollPressEnd,
  onChance,
  controls,
  showChance = true,
  rolling,
  disabled,
  chanceDisabled,
  mustMove,
  currentPlayer,
  isMyTurn,
}: DiceProps) {
  const pressedRef = useRef(false);

  return (
    <section className="rounded-2xl bg-slate-800 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Dice
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Turn: <span className="font-semibold capitalize">{currentPlayer ?? "-"}</span>
          </p>
        </div>
        {controls && (
          <div className="flex min-w-[9.5rem] flex-col items-stretch gap-2 self-start">
            {controls}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-700 text-2xl font-bold transition-transform ${
            rolling ? "scale-105" : ""
          }`}
        >
          {rolling ? "-" : (value ?? "-")}
        </div>
        <div className="flex w-full flex-col gap-2">
          <button
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              isMyTurn && !disabled
                ? "bg-indigo-500 text-white ring-2 ring-indigo-300/80 shadow-[0_0_0_1px_rgba(165,180,252,0.45),0_0_28px_rgba(99,102,241,0.35)] hover:bg-indigo-400"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            onPointerDown={(event) => {
              if (disabled || pressedRef.current || event.button !== 0) return;
              pressedRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              onRollPressStart();
            }}
            onPointerUp={(event) => {
              if (!pressedRef.current) return;
              pressedRef.current = false;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              onRollPressEnd();
            }}
            onPointerCancel={() => {
              if (!pressedRef.current) return;
              pressedRef.current = false;
              onRollPressEnd();
            }}
            onKeyDown={(event) => {
              if (disabled || pressedRef.current) return;
              if (event.key !== " " && event.key !== "Enter") return;
              event.preventDefault();
              pressedRef.current = true;
              onRollPressStart();
            }}
            onKeyUp={(event) => {
              if (!pressedRef.current) return;
              if (event.key !== " " && event.key !== "Enter") return;
              event.preventDefault();
              pressedRef.current = false;
              onRollPressEnd();
            }}
            onBlur={() => {
              if (!pressedRef.current) return;
              pressedRef.current = false;
              onRollPressEnd();
            }}
            type="button"
            disabled={disabled}
          >
            {rolling ? "Release to roll" : isMyTurn === false ? "Waiting..." : "Hold to roll"}
          </button>
          {showChance && (
            <button
              className="rounded-xl bg-emerald-700/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onChance}
              type="button"
              disabled={chanceDisabled}
            >
              Chance
            </button>
          )}
          {mustMove && (
            <span className="text-xs text-slate-400">Click a token to move</span>
          )}
        </div>
      </div>
    </section>
  );
}

