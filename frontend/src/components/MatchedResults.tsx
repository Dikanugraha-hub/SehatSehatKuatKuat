"use client";

// Menampilkan matches[] dari searchResponse backend
import { MatchedNode } from "@/types";

interface MatchedResultsProps {
  matches: MatchedNode[];
}

export default function MatchedResults({ matches }: MatchedResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-8 text-center">
        <p className="text-zinc-500 font-mono text-sm">
          Tidak ada elemen yang cocok dengan selector ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((node, idx) => (
        <div
          key={node.uid}
          className="bg-zinc-950 border border-yellow-400/20 rounded-lg px-4 py-3 font-mono text-xs hover:border-yellow-400/40 transition-colors"
        >
          {/* badge + uid + depth */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-yellow-400 font-bold text-[10px] bg-yellow-400/20 px-1.5 py-0.5 rounded">
              #{idx + 1}
            </span>
            <span className="text-zinc-600 text-[10px]">{node.uid}</span>
            <span className="text-zinc-600 ml-auto">depth: {node.depth}</span>
          </div>

          {/* tag HTML */}
          <div className="text-sm mb-1">
            <span className="text-yellow-300">&lt;{node.tag}</span>
            {node.id    && <span className="text-sky-400">  id=&quot;{node.id}&quot;</span>}
            {node.class && <span className="text-emerald-400">  class=&quot;{node.class}&quot;</span>}
            <span className="text-yellow-300">&gt;</span>
            {node.content && (
              <span className="text-zinc-300"> {node.content.slice(0, 80)}{node.content.length > 80 ? "…" : ""}</span>
            )}
            <span className="text-yellow-300">&lt;/{node.tag}&gt;</span>
          </div>

          {/* path */}
          <div className="text-[10px] text-zinc-600 mt-1">
            📍 {node.path}
          </div>
        </div>
      ))}
    </div>
  );
}
