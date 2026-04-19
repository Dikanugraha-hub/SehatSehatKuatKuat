"use client";

// Field disesuaikan dengan searchResponse backend: duration_ms, visited_count, max_depth
import { formatTime } from "@/lib/utils";

interface StatsPanelProps {
  durationMs: number;
  visitedCount: number;
  totalNodes: number;
  maxDepth: number;
  matchCount: number;
  algorithm: string;
  selector: string;
}

export default function StatsPanel({
  durationMs,
  visitedCount,
  totalNodes,
  maxDepth,
  matchCount,
  algorithm,
  selector,
}: StatsPanelProps) {
  const items = [
    { label: "Waktu Pencarian", value: formatTime(durationMs), color: "text-emerald-400", icon: "⏱" },
    { label: "Node Dikunjungi", value: visitedCount.toLocaleString(), color: "text-blue-400", icon: "👁" },
    { label: "Total Node",      value: totalNodes.toLocaleString(),   color: "text-zinc-300", icon: "🌳" },
    { label: "Kedalaman Maks",  value: maxDepth,                      color: "text-purple-400", icon: "📏" },
    { label: "Hasil Ditemukan", value: matchCount,                    color: "text-yellow-400", icon: "✓"  },
  ];

  return (
    <div className="space-y-3">
      {/* info query */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 font-mono text-xs">
        <span className="text-zinc-500">algo: </span>
        <span className={algorithm === "bfs" ? "text-blue-400 font-bold" : "text-purple-400 font-bold"}>
          {algorithm.toUpperCase()}
        </span>
        <span className="text-zinc-500 ml-3">selector: </span>
        <span className="text-emerald-400">{selector || "—"}</span>
      </div>

      {/* grid stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-3">
            <div className="text-lg mb-0.5">{item.icon}</div>
            <div className={`text-xl font-mono font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-zinc-500 font-mono">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
