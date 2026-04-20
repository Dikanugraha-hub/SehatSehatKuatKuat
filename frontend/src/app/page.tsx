"use client";
// app/page.tsx

import { useState, useMemo } from "react";
import InputForm from "@/components/InputForm";
import LCAForm from "@/components/LCAForm";
import DOMTreeViewer from "@/components/DOMTreeViewer";
import StatsPanel from "@/components/StatsPanel";
import AnimationControls from "@/components/AnimationControls";
import TraversalLog from "@/components/TraversalLog";
import MatchedResults from "@/components/MatchedResults";
import LCAResult from "@/components/LCAResult";
import { useTraversalAnimation } from "@/hooks/useTraversalAnimation";
import { searchDOM, findLCA } from "@/lib/api";
import { MOCK_BFS_RESPONSE, MOCK_DFS_RESPONSE } from "@/lib/mockData";
import { SearchResponse, LCAResponse, Algorithm, InputMode } from "@/types";

// Mode halaman utama: traversal BFS/DFS atau LCA
type PageMode = "traversal" | "lca";
type TabKey   = "tree" | "results" | "log";

export default function Home() {
  const [pageMode, setPageMode]         = useState<PageMode>("traversal");

  // ── State traversal ──────────────────────────────────────────────────────
  const [isLoadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError]       = useState<string | null>(null);
  const [searchResult, setSearchResult]     = useState<SearchResponse | null>(null);
  const [activeAlgorithm, setAlgorithm]     = useState<Algorithm>("bfs");
  const [activeSelector, setSelector]       = useState("");
  const [activeTab, setActiveTab]           = useState<TabKey>("tree");
  const [animSpeed, setAnimSpeed]           = useState(300);
  const [isDemoMode, setIsDemoMode]         = useState(false);

  // ── State LCA ────────────────────────────────────────────────────────────
  const [isLoadingLCA, setLoadingLCA] = useState(false);
  const [lcaError, setLcaError]       = useState<string | null>(null);
  const [lcaResult, setLcaResult]     = useState<LCAResponse | null>(null);

  // ── Traversal animation ───────────────────────────────────────────────────
  const matchedUids = useMemo(
    () => new Set((searchResult?.matches ?? []).map((m) => m.uid)),
    [searchResult]
  );

  const anim = useTraversalAnimation({
    traversalSequence: searchResult?.traversal_sequence ?? [],
    matchedUids: Array.from(matchedUids),
    speedMs: animSpeed,
  });

  function handleSpeedChange(ms: number) {
    setAnimSpeed(ms);
    anim.reset();
  }

  // Switch mode — reset state lain
  function switchMode(mode: PageMode) {
    setPageMode(mode);
    setSearchError(null);
    setLcaError(null);
  }

  // ── Demo Mode ─────────────────────────────────────────────────────────────
  function handleDemoMode(algo: Algorithm = "bfs") {
    anim.reset();
    setSearchError(null);
    setIsDemoMode(true);
    setAlgorithm(algo);
    setSelector("p");
    setActiveTab("tree");
    setSearchResult(algo === "bfs" ? MOCK_BFS_RESPONSE : MOCK_DFS_RESPONSE);
  }

  // ── Submit traversal ──────────────────────────────────────────────────────
  async function handleTraversalSubmit(params: {
    html?: string; url?: string;
    algorithm: Algorithm; selector: string;
    limit: number; inputMode: InputMode;
  }) {
    setLoadingSearch(true);
    setSearchError(null);
    setSearchResult(null);
    setIsDemoMode(false);
    anim.reset();

    try {
      const res = await searchDOM({
        url:       params.inputMode === "url"  ? params.url  : undefined,
        html:      params.inputMode === "html" ? params.html : undefined,
        algorithm: params.algorithm,
        selector:  params.selector,
        limit:     params.limit,
      });
      setSearchResult(res);
      setAlgorithm(params.algorithm);
      setSelector(params.selector);
      setActiveTab("tree");
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoadingSearch(false);
    }
  }

  // ── Submit LCA ────────────────────────────────────────────────────────────
  async function handleLCASubmit(params: {
    url?: string; html?: string;
    inputMode: InputMode;
    selector_a: string; selector_b: string;
  }) {
    setLoadingLCA(true);
    setLcaError(null);
    setLcaResult(null);

    try {
      const res = await findLCA({
        url:        params.inputMode === "url"  ? params.url  : undefined,
        html:       params.inputMode === "html" ? params.html : undefined,
        selector_a: params.selector_a,
        selector_b: params.selector_b,
      });
      setLcaResult(res);
    } catch (err: unknown) {
      setLcaError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoadingLCA(false);
    }
  }

  // ── Display state untuk animasi ───────────────────────────────────────────
  const displayVisited = anim.state === "idle"
    ? new Set(searchResult?.traversal_sequence ?? []) : anim.visitedUids;
  const displayMatched = anim.state === "idle" ? matchedUids : anim.matchedSoFar;
  const displayCurrent = anim.state === "playing" ? anim.currentUid : null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tree",    label: "🌳 Pohon DOM" },
    { key: "results", label: `✓ Hasil (${searchResult?.match_count ?? 0})` },
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
              IF2211 Strategi Algoritma · BFS &amp; DFS &amp; LCA
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-600">ITB · 2025/2026</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* ── Left: Input ── */}
        <aside className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-xl overflow-hidden border border-zinc-700">
            <button
              onClick={() => switchMode("traversal")}
              className={`flex-1 py-2.5 text-xs font-mono font-bold transition-colors ${
                pageMode === "traversal"
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              BFS / DFS
            </button>
            <button
              onClick={() => switchMode("lca")}
              className={`flex-1 py-2.5 text-xs font-mono font-bold transition-colors ${
                pageMode === "lca"
                  ? "bg-violet-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              📐 LCA
            </button>
          </div>

          {/* Form sesuai mode */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
              {pageMode === "traversal" ? "Konfigurasi Traversal" : "Konfigurasi LCA"}
            </h2>
            {pageMode === "traversal" ? (
              <InputForm onSubmit={handleTraversalSubmit} isLoading={isLoadingSearch} />
            ) : (
              <LCAForm onSubmit={handleLCASubmit} isLoading={isLoadingLCA} />
            )}
          </div>

          {/* Demo Mode (hanya untuk traversal) */}
          {pageMode === "traversal" && (
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
          )}

          {/* Error traversal */}
          {pageMode === "traversal" && searchError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 font-mono text-sm text-red-400">
              <p className="font-bold mb-1">⚠ Error:</p>
              <p className="text-xs">{searchError}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Backend belum jalan? Coba{" "}
                <button onClick={() => handleDemoMode()} className="underline text-blue-400">
                  Demo Mode
                </button>
              </p>
            </div>
          )}

          {/* Error LCA */}
          {pageMode === "lca" && lcaError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 font-mono text-sm text-red-400">
              <p className="font-bold mb-1">⚠ Error:</p>
              <p className="text-xs">{lcaError}</p>
            </div>
          )}
        </aside>

        {/* ── Right: Output ── */}
        <section className="space-y-4">

          {/* ── OUTPUT: TRAVERSAL ── */}
          {pageMode === "traversal" && (
            !searchResult ? (
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
                {isDemoMode && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 font-mono text-xs text-yellow-400 flex items-center justify-between">
                    <span>🧪 Demo Mode — data dummy, bukan dari backend</span>
                    <button onClick={() => setSearchResult(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
                  </div>
                )}

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">Statistik</h2>
                  <StatsPanel
                    durationMs={searchResult.duration_ms}
                    visitedCount={searchResult.visited_count}
                    totalNodes={searchResult.tree.length}
                    maxDepth={searchResult.max_depth}
                    matchCount={searchResult.match_count}
                    algorithm={activeAlgorithm}
                    selector={activeSelector}
                  />
                </div>

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
                        tree={searchResult.tree}
                        visitedUids={displayVisited}
                        currentUid={displayCurrent}
                        matchedUids={displayMatched}
                        algorithm={activeAlgorithm}
                      />
                    )}
                    {activeTab === "results" && (
                      <MatchedResults matches={searchResult.matches} />
                    )}
                    {activeTab === "log" && (
                      <TraversalLog
                        log={searchResult.traversal_log}
                        sequence={searchResult.traversal_sequence}
                        matchedUids={matchedUids}
                        currentStep={anim.state !== "idle" ? anim.currentStep : -1}
                        algorithm={activeAlgorithm}
                        selector={activeSelector}
                      />
                    )}
                  </div>
                </div>
              </>
            )
          )}

          {/* ── OUTPUT: LCA ── */}
          {pageMode === "lca" && (
            !lcaResult ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">📐</div>
                <p className="font-mono text-zinc-500 text-sm">
                  Masukkan dua CSS selector untuk mencari Lowest Common Ancestor pada pohon DOM.
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
                  Hasil LCA
                </h2>
                <LCAResult result={lcaResult} />
              </div>
            )
          )}

        </section>
      </div>
    </main>
  );
}
