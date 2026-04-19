"use client";

// Satu call ke POST /search — backend handle URL scraping + traversal sekaligus
import { useState, useMemo } from "react";
import InputForm from "@/components/InputForm";
import DOMTreeViewer from "@/components/DOMTreeViewer";
import StatsPanel from "@/components/StatsPanel";
import AnimationControls from "@/components/AnimationControls";
import TraversalLog from "@/components/TraversalLog";
import MatchedResults from "@/components/MatchedResults";
import { useTraversalAnimation } from "@/hooks/useTraversalAnimation";
import { searchDOM } from "@/lib/api";
import { MOCK_BFS_RESPONSE, MOCK_DFS_RESPONSE } from "@/lib/mockData";
import { SearchResponse, Algorithm, InputMode } from "@/types";

type TabKey = "tree" | "results" | "log";

export default function Home() {
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [result, setResult]             = useState<SearchResponse | null>(null);
  const [activeAlgorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [activeSelector, setSelector]   = useState("");
  const [activeTab, setActiveTab]       = useState<TabKey>("tree");
  const [animSpeed, setAnimSpeed]       = useState(300);
  const [isDemoMode, setIsDemoMode]     = useState(false);

  // Set uid node yang match — untuk highlight dan animasi
  const matchedUids = useMemo(
    () => new Set((result?.matches ?? []).map((m) => m.uid)),
    [result]
  );

  const anim = useTraversalAnimation({
    traversalSequence: result?.traversal_sequence ?? [],
    matchedUids: Array.from(matchedUids),
    speedMs: animSpeed,
  });

  function handleSpeedChange(ms: number) {
    setAnimSpeed(ms);
    anim.reset();
  }

  function handleDemoMode(algo: Algorithm = "bfs") {
    anim.reset();
    setError(null);
    setIsDemoMode(true);
    setAlgorithm(algo);
    setSelector("p");
    setActiveTab("tree");
    setResult(algo === "bfs" ? MOCK_BFS_RESPONSE : MOCK_DFS_RESPONSE);
  }

  async function handleSubmit(params: {
    html?: string;
    url?: string;
    algorithm: Algorithm;
    selector: string;
    limit: number;
    inputMode: InputMode;
  }) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsDemoMode(false);
    anim.reset();

    try {
      // Satu call ke POST /search — backend handle scraping & traversal
      const res = await searchDOM({
        url:       params.inputMode === "url"  ? params.url  : undefined,
        html:      params.inputMode === "html" ? params.html : undefined,
        algorithm: params.algorithm,
        selector:  params.selector,
        limit:     params.limit,
      });

      setResult(res);
      setAlgorithm(params.algorithm);
      setSelector(params.selector);
      setActiveTab("tree");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // State yang ditampilkan di tree — idle = semua visited (hasil final), playing = animasi
  const displayVisited = anim.state === "idle"
    ? new Set(result?.traversal_sequence ?? [])
    : anim.visitedUids;
  const displayMatched = anim.state === "idle" ? matchedUids : anim.matchedSoFar;
  const displayCurrent = anim.state === "playing" ? anim.currentUid : null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tree",    label: "🌳 Pohon DOM" },
    { key: "results", label: `✓ Hasil (${result?.match_count ?? 0})` },
    { key: "log",     label: "📋 Log" },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-mono font-bold tracking-tight">
              <span className="text-emerald-400">DOM</span>
              <span className="text-zinc-400">.</span>
              <span className="text-blue-400">traverse</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              IF2211 Strategi Algoritma · BFS &amp; DFS CSS Selector
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-600">ITB · 2025/2026</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* ── Left: Input ── */}
        <aside className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
              Konfigurasi
            </h2>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Demo Mode */}
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-4">
            <p className="text-xs font-mono text-zinc-500 mb-3">
              🧪 <span className="text-zinc-300 font-bold">Demo Mode</span> — test tanpa backend
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDemoMode("bfs")}
                className="flex-1 py-2 text-xs font-mono font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
              >
                Demo BFS
              </button>
              <button
                onClick={() => handleDemoMode("dfs")}
                className="flex-1 py-2 text-xs font-mono font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
              >
                Demo DFS
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 font-mono text-sm text-red-400">
              <p className="font-bold mb-1">⚠ Error:</p>
              <p className="text-xs">{error}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Backend belum jalan? Coba{" "}
                <button onClick={() => handleDemoMode()} className="underline text-blue-400">
                  Demo Mode
                </button>
              </p>
            </div>
          )}
        </aside>

        {/* ── Right: Output ── */}
        <section className="space-y-4">
          {!result ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">🌐</div>
              <p className="font-mono text-zinc-500 text-sm mb-4">
                Masukkan URL atau HTML dan jalankan traversal untuk melihat visualisasi pohon DOM.
              </p>
              <p className="font-mono text-zinc-600 text-xs">
                Belum punya backend?{" "}
                <button
                  onClick={() => handleDemoMode()}
                  className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                >
                  Coba Demo Mode
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* Demo banner */}
              {isDemoMode && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 font-mono text-xs text-yellow-400 flex items-center justify-between">
                  <span>🧪 Demo Mode — data dummy, bukan dari backend</span>
                  <button onClick={() => setResult(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
                </div>
              )}

              {/* Stats */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">Statistik</h2>
                <StatsPanel
                  durationMs={result.duration_ms}
                  visitedCount={result.visited_count}
                  totalNodes={result.tree.length}
                  maxDepth={result.max_depth}
                  matchCount={result.match_count}
                  algorithm={activeAlgorithm}
                  selector={activeSelector}
                />
              </div>

              {/* Animasi */}
              <AnimationControls
                state={anim.state}
                currentStep={anim.currentStep}
                totalSteps={anim.totalSteps}
                speed={animSpeed}
                onPlay={anim.play}
                onPause={anim.pause}
                onReset={anim.reset}
                onSkipToEnd={anim.skipToEnd}
                onSpeedChange={handleSpeedChange}
              />

              {/* Tabs */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex border-b border-zinc-800">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-3 text-xs font-mono transition-colors ${
                        activeTab === tab.key
                          ? "bg-zinc-800 text-zinc-100 border-b-2 border-emerald-500"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "tree" && (
                    <DOMTreeViewer
                      tree={result.tree}
                      visitedUids={displayVisited}
                      currentUid={displayCurrent}
                      matchedUids={displayMatched}
                      algorithm={activeAlgorithm}
                    />
                  )}
                  {activeTab === "results" && (
                    <MatchedResults matches={result.matches} />
                  )}
                  {activeTab === "log" && (
                    <TraversalLog
                      log={result.traversal_log}
                      sequence={result.traversal_sequence}
                      matchedUids={matchedUids}
                      currentStep={anim.state !== "idle" ? anim.currentStep : -1}
                      algorithm={activeAlgorithm}
                      selector={activeSelector}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
