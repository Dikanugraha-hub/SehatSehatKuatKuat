"use client";

// traversal_log dari backend = string[] (label per node)
// traversal_sequence = string[] (uid per node, urutan sama)
import { Algorithm } from "@/types";
import { downloadAsFile, formatLogForDownload } from "@/lib/utils";

interface TraversalLogProps {
  log: string[];              // traversal_log: ["html", "head", "body", ...]
  sequence: string[];         // traversal_sequence: ["root", "root.0", ...]
  matchedUids: Set<string>;   // untuk highlight baris yang match
  currentStep: number;        // -1 = tampilkan semua
  algorithm: Algorithm;
  selector: string;
}

export default function TraversalLog({
  log,
  sequence,
  matchedUids,
  currentStep,
  algorithm,
  selector,
}: TraversalLogProps) {
  // Kalau animasi aktif, slice sampai currentStep
  const displayCount = currentStep >= 0 ? currentStep + 1 : log.length;
  const displayLog   = log.slice(0, displayCount);
  const displaySeq   = sequence.slice(0, displayCount);

  const matchedCount = displayLog.filter((_, i) => matchedUids.has(sequence[i])).length;

  function handleDownload() {
    const content = formatLogForDownload(log, sequence, algorithm, selector);
    const ts = new Date().toISOString().slice(0, 10);
    downloadAsFile(content, `traversal_log_${algorithm}_${ts}.txt`);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-zinc-400">
          <span className="text-zinc-300 font-bold">{displayLog.length}</span> langkah
          {matchedCount > 0 && (
            <> · <span className="text-yellow-400 font-bold">{matchedCount}</span> match</>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
        >
          ↓ Download Log
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-64">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="text-left px-3 py-2 text-zinc-500 font-normal w-12">#</th>
                <th className="text-left px-3 py-2 text-zinc-500 font-normal w-40">UID</th>
                <th className="text-left px-3 py-2 text-zinc-500 font-normal">Label</th>
                <th className="text-left px-3 py-2 text-zinc-500 font-normal w-16">Match</th>
              </tr>
            </thead>
            <tbody>
              {displayLog.map((label, i) => {
                const uid      = displaySeq[i] ?? "-";
                const isMatch  = matchedUids.has(uid);
                const isCurrent = i === displayLog.length - 1 && currentStep >= 0;

                return (
                  <tr
                    key={i}
                    className={[
                      "border-t border-zinc-900 transition-colors",
                      isMatch   ? "bg-yellow-400/5 hover:bg-yellow-400/10" : "hover:bg-zinc-900/50",
                      isCurrent ? "bg-white/5" : "",
                    ].join(" ")}
                  >
                    <td className="px-3 py-1.5 text-zinc-600">{i + 1}</td>
                    <td className="px-3 py-1.5 text-zinc-500 text-[10px]">{uid}</td>
                    <td className="px-3 py-1.5 text-blue-400">&lt;{label}&gt;</td>
                    <td className="px-3 py-1.5">
                      {isMatch
                        ? <span className="text-yellow-400 font-bold">✓</span>
                        : <span className="text-zinc-700">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
