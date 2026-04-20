"use client";
// components/LCAResult.tsx
// Visualisasi LCA dengan animasi step-by-step

import { useState } from "react";
import { LCAResponse } from "@/types";
import { useLCAAnimation } from "@/hooks/useLCAAnimation";

interface LCAResultProps {
  result: LCAResponse;
}

function parsePath(path: string): string[] {
  return path.split(" > ").map((s) => s.trim()).filter(Boolean);
}

function tagOnly(segment: string): string {
  return segment.replace(/[#.].*/g, "");
}

// ── Speed options ─────────────────────────────────────────────────────────────
const SPEED_OPTIONS = [
  { label: "0.5×", ms: 800 },
  { label: "1×",   ms: 400 },
  { label: "2×",   ms: 200 },
  { label: "5×",   ms: 80  },
];

// ── AnimatedPathTree ──────────────────────────────────────────────────────────
interface AnimatedPathTreeProps {
  commonPath: string[];
  tailA: string[];
  tailB: string[];
  // step terakhir yang sudah di-highlight per bagian (-1 = belum)
  commonStep: number;
  tailAStep: number;
  tailBStep: number;
  currentSegment: string | null;
}

function AnimatedPathTree({
  commonPath, tailA, tailB,
  commonStep, tailAStep, tailBStep,
  currentSegment,
}: AnimatedPathTreeProps) {
  const lcaIndex = commonPath.length - 1;

  return (
    <div className="font-mono text-xs select-none overflow-auto">
      {/* Common path: root → LCA */}
      {commonPath.map((segment, i) => {
        const isLCA       = i === lcaIndex;
        const isRoot      = i === 0;
        const isVisited   = i <= commonStep;
        const isCurrent   = isVisited && currentSegment === segment && i === commonStep;

        return (
          <div
            key={i}
            style={{ paddingLeft: `${i * 22}px` }}
            className="flex items-center gap-2 py-0.5 transition-all duration-200"
          >
            {!isRoot && (
              <span className={isVisited ? "text-zinc-400" : "text-zinc-700"}>└─</span>
            )}
            <span
              className={[
                "px-2 py-0.5 rounded border transition-all duration-300",
                isCurrent
                  ? "bg-white/20 border-white text-white ring-1 ring-white animate-pulse"
                  : isLCA && isVisited
                  ? "bg-violet-500/40 border-violet-400 text-violet-100 font-bold"
                  : isVisited
                  ? "bg-zinc-700 border-zinc-600 text-zinc-200"
                  : "bg-zinc-900 border-zinc-800 text-zinc-600",
              ].join(" ")}
            >
              &lt;{segment}&gt;
              {isLCA && isVisited && !isCurrent && (
                <span className="ml-2 text-[10px] bg-violet-500/50 text-violet-200 px-1.5 py-0.5 rounded">
                  LCA
                </span>
              )}
              {isCurrent && (
                <span className="ml-2 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">
                  →
                </span>
              )}
            </span>
          </div>
        );
      })}

      {/* Percabangan: tailA dan tailB */}
      <div
        style={{ paddingLeft: `${commonPath.length * 22}px` }}
        className="flex gap-8 mt-0.5"
      >
        {/* Cabang A */}
        {tailA.length > 0 && (
          <div className="flex flex-col">
            {tailA.map((segment, i) => {
              const isNodeA   = i === tailA.length - 1;
              const isVisited = i <= tailAStep;
              const isCurrent = isVisited && currentSegment === segment && i === tailAStep;

              return (
                <div
                  key={i}
                  style={{ paddingLeft: `${i * 22}px` }}
                  className="flex items-center gap-2 py-0.5"
                >
                  <span className={isVisited ? "text-blue-500" : "text-zinc-700"}>└─</span>
                  <span
                    className={[
                      "px-2 py-0.5 rounded border transition-all duration-300",
                      isCurrent
                        ? "bg-white/20 border-white text-white ring-1 ring-white animate-pulse"
                        : isNodeA && isVisited
                        ? "bg-blue-500/40 border-blue-400 text-blue-100 font-bold"
                        : isVisited
                        ? "bg-blue-900/40 border-blue-800 text-blue-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-600",
                    ].join(" ")}
                  >
                    &lt;{segment}&gt;
                    {isNodeA && isVisited && !isCurrent && (
                      <span className="ml-2 text-[10px] bg-blue-500/50 text-blue-200 px-1.5 py-0.5 rounded">A</span>
                    )}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">→</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Cabang B */}
        {tailB.length > 0 && (
          <div className="flex flex-col">
            {tailB.map((segment, i) => {
              const isNodeB   = i === tailB.length - 1;
              const isVisited = i <= tailBStep;
              const isCurrent = isVisited && currentSegment === segment && i === tailBStep;

              return (
                <div
                  key={i}
                  style={{ paddingLeft: `${i * 22}px` }}
                  className="flex items-center gap-2 py-0.5"
                >
                  <span className={isVisited ? "text-emerald-500" : "text-zinc-700"}>└─</span>
                  <span
                    className={[
                      "px-2 py-0.5 rounded border transition-all duration-300",
                      isCurrent
                        ? "bg-white/20 border-white text-white ring-1 ring-white animate-pulse"
                        : isNodeB && isVisited
                        ? "bg-emerald-500/40 border-emerald-400 text-emerald-100 font-bold"
                        : isVisited
                        ? "bg-emerald-900/40 border-emerald-800 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-600",
                    ].join(" ")}
                  >
                    &lt;{segment}&gt;
                    {isNodeB && isVisited && !isCurrent && (
                      <span className="ml-2 text-[10px] bg-emerald-500/50 text-emerald-200 px-1.5 py-0.5 rounded">B</span>
                    )}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">→</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NodeCard ──────────────────────────────────────────────────────────────────
interface NodeCardProps {
  label: string; labelColor: string;
  uid: string; tag: string; id: string; cls: string;
  content: string; depth: number; path: string;
}

function NodeCard({ label, labelColor, uid, tag, id, cls, content, depth, path }: NodeCardProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${labelColor}`}>{label}</span>
        <span className="text-zinc-600 text-[10px]">{uid}</span>
        <span className="ml-auto text-zinc-600">depth: {depth}</span>
      </div>
      <div className="text-sm mb-1">
        <span className="text-zinc-300">&lt;{tag}</span>
        {id  && <span className="text-sky-400"> id=&quot;{id}&quot;</span>}
        {cls && <span className="text-emerald-400"> class=&quot;{cls}&quot;</span>}
        <span className="text-zinc-300">&gt;</span>
        {content && <span className="text-zinc-400"> {content.slice(0, 60)}{content.length > 60 ? "…" : ""}</span>}
        <span className="text-zinc-300">&lt;/{tag}&gt;</span>
      </div>
      <div className="text-[10px] text-zinc-600">📍 {path}</div>
    </div>
  );
}

// ── LCAResult (main) ──────────────────────────────────────────────────────────
export default function LCAResult({ result }: LCAResultProps) {
  const { node_a, node_b, lca_node } = result;
  const [speed, setSpeed] = useState(400);

  const pathA       = parsePath(node_a.path);
  const pathB       = parsePath(node_b.path);
  const lcaSegments = parsePath(lca_node.path);

  const tailA = pathA.slice(lcaSegments.length);
  const tailB = pathB.slice(lcaSegments.length);

  const anim = useLCAAnimation({
    commonPath: lcaSegments,
    tailA,
    tailB,
    speedMs: speed,
  });

  function handleSpeedChange(ms: number) {
    setSpeed(ms);
    anim.reset();
  }

  // Label fase animasi
  const phaseLabel: Record<string, string> = {
    idle:    "Siap",
    common:  "Menelusuri jalur bersama (root → LCA)...",
    branchA: "Menelusuri cabang A...",
    branchB: "Menelusuri cabang B...",
    done:    "Selesai",
  };

  return (
    <div className="space-y-5">
      {/* ── Visualisasi + kontrol animasi ── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Visualisasi Pencarian LCA
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-violet-500/40 border border-violet-400 inline-block" />
            <span className="text-zinc-400">LCA node</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/40 border border-blue-400 inline-block" />
            <span className="text-zinc-400">Node A</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
            <span className="text-zinc-400">Node B</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/20 border border-white inline-block" />
            <span className="text-zinc-400">Sedang dikunjungi</span>
          </span>
        </div>

        {/* Pohon animasi */}
        <div className="bg-zinc-900 rounded-lg p-4 overflow-auto min-h-[120px]">
          <AnimatedPathTree
            commonPath={lcaSegments}
            tailA={tailA}
            tailB={tailB}
            commonStep={anim.commonStep}
            tailAStep={anim.tailAStep}
            tailBStep={anim.tailBStep}
            currentSegment={anim.currentSegment}
          />
        </div>

        {/* Status fase */}
        <p className="text-xs font-mono text-zinc-500 italic">
          {phaseLabel[anim.phase] ?? ""}
        </p>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-violet-500 transition-all duration-300 rounded-full"
            style={{
              width: anim.totalSteps > 0
                ? `${(anim.currentStep / anim.totalSteps) * 100}%`
                : "0%",
            }}
          />
        </div>

        {/* Kontrol */}
        <div className="space-y-2">
          {/* Speed */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500">Kecepatan</span>
            <div className="flex gap-1">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s.ms}
                  onClick={() => handleSpeedChange(s.ms)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                    speed === s.ms
                      ? "bg-violet-500 text-white font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Play / Pause / Reset / Skip */}
          <div className="flex items-center gap-2">
            <button
              onClick={anim.reset}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors text-sm"
              title="Reset"
            >
              ↩
            </button>

            {anim.animState === "playing" ? (
              <button
                onClick={anim.pause}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-sm rounded-lg transition-colors"
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                onClick={anim.play}
                disabled={anim.animState === "done"}
                className="flex-1 py-2 bg-violet-500 hover:bg-violet-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-mono font-bold text-sm rounded-lg transition-colors"
              >
                {anim.animState === "idle"   ? "▶ Mulai Animasi" :
                 anim.animState === "paused" ? "▶ Lanjutkan"     : "✓ Selesai"}
              </button>
            )}

            <button
              onClick={anim.skipToEnd}
              disabled={anim.animState === "done"}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-30 transition-colors text-sm"
              title="Skip ke akhir"
            >
              ⏭
            </button>
          </div>

          {/* Step counter */}
          <div className="text-center text-xs font-mono text-zinc-500">
            {anim.animState === "idle" ? (
              `${anim.totalSteps} langkah total`
            ) : (
              <>
                Langkah{" "}
                <span className="text-violet-400 font-bold">{anim.currentStep}</span>
                {" "}/ {anim.totalSteps}
                {anim.animState === "done" && (
                  <span className="text-yellow-400 ml-2 font-bold">✓ LCA ditemukan</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards detail ── */}
      <div className="grid gap-3">
        <NodeCard
          label="LCA Node" labelColor="bg-violet-500/20 text-violet-300 border-violet-500/30"
          uid={lca_node.uid} tag={lca_node.tag} id={lca_node.id} cls={lca_node.class}
          content={lca_node.content} depth={lca_node.depth} path={lca_node.path}
        />
        <NodeCard
          label="Node A" labelColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
          uid={node_a.uid} tag={node_a.tag} id={node_a.id} cls={node_a.class}
          content={node_a.content} depth={node_a.depth} path={node_a.path}
        />
        <NodeCard
          label="Node B" labelColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          uid={node_b.uid} tag={node_b.tag} id={node_b.id} cls={node_b.class}
          content={node_b.content} depth={node_b.depth} path={node_b.path}
        />
      </div>
    </div>
  );
}
