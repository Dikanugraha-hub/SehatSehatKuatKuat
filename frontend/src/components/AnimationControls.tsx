"use client";

// Kontrol animasi traversal: play, pause, reset, skip, speed slider
import { AnimationState } from "@/types";

interface AnimationControlsProps {
  state: AnimationState;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkipToEnd: () => void;
  onSpeedChange: (ms: number) => void;
}

const SPEED_OPTIONS = [
  { label: "0.5×", ms: 600 },
  { label: "1×", ms: 300 },
  { label: "2×", ms: 150 },
  { label: "5×", ms: 60 },
];

export default function AnimationControls({
  state,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onReset,
  onSkipToEnd,
  onSpeedChange,
}: AnimationControlsProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Animasi Traversal
        </span>
        {/* Speed selector */}
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s.ms}
              onClick={() => onSpeedChange(s.ms)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                speed === s.ms
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-200 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset"
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors font-mono text-sm"
        >
          ↩
        </button>

        {/* Play / Pause */}
        {state === "playing" ? (
          <button
            onClick={onPause}
            className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-sm rounded-lg transition-colors"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={state === "done" && currentStep === totalSteps - 1}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-mono font-bold text-sm rounded-lg transition-colors"
          >
            {state === "idle" ? "▶ Mulai Animasi" : state === "paused" ? "▶ Lanjutkan" : "▶ Ulang"}
          </button>
        )}

        {/* Skip to end */}
        <button
          onClick={onSkipToEnd}
          title="Skip ke akhir"
          disabled={state === "done"}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-30 transition-colors font-mono text-sm"
        >
          ⏭
        </button>
      </div>

      {/* Step counter */}
      <div className="text-center text-xs font-mono text-zinc-500">
        {state === "idle" ? (
          `${totalSteps} langkah total`
        ) : (
          <>
            Langkah{" "}
            <span className="text-emerald-400 font-bold">
              {Math.max(0, currentStep + 1)}
            </span>{" "}
            / {totalSteps}
            {state === "done" && (
              <span className="text-yellow-400 ml-2 font-bold">✓ Selesai</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
