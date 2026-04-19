"use client";

// Form untuk input URL/HTML, pilihan algoritma, CSS selector, dan limit
import { useState } from "react";
import { Algorithm, InputMode } from "@/types";
import { isValidUrl } from "@/lib/utils";

interface InputFormProps {
  onSubmit: (params: {
    html?: string;
    url?: string;
    algorithm: Algorithm;
    selector: string;
    limit: number;
    inputMode: InputMode;
  }) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [selector, setSelector] = useState("");
  const [limitMode, setLimitMode] = useState<"all" | "top">("all");
  const [limitN, setLimitN] = useState(10);
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");

    if (inputMode === "url") {
      if (!url.trim()) return setError("URL tidak boleh kosong.");
      if (!isValidUrl(url)) return setError("Format URL tidak valid.");
    } else {
      if (!html.trim()) return setError("HTML tidak boleh kosong.");
    }

    if (!selector.trim()) return setError("CSS Selector tidak boleh kosong.");

    onSubmit({
      url: inputMode === "url" ? url : undefined,
      html: inputMode === "html" ? html : undefined,
      algorithm,
      selector,
      limit: limitMode === "all" ? 0 : limitN,
      inputMode,
    });
  }

  return (
    <div className="space-y-6">
      {/* Input Mode Toggle */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          Sumber HTML
        </label>
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          {(["url", "html"] as InputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`flex-1 py-2 text-sm font-mono transition-colors ${
                inputMode === mode
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {mode === "url" ? "🌐 URL Website" : "📄 Raw HTML"}
            </button>
          ))}
        </div>
      </div>

      {/* URL / HTML Input */}
      {inputMode === "url" ? (
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            HTML
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<html>...</html>"
            rows={8}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
          />
        </div>
      )}

      {/* CSS Selector */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          CSS Selector
        </label>
        <input
          type="text"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
          placeholder="div.container > p, #header, .nav-link"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <p className="mt-1 text-xs text-zinc-500 font-mono">
          Contoh: <span className="text-zinc-400">p</span>,{" "}
          <span className="text-zinc-400">.class</span>,{" "}
          <span className="text-zinc-400">#id</span>,{" "}
          <span className="text-zinc-400">div &gt; span</span>
        </p>
      </div>

      {/* Algorithm */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          Algoritma Traversal
        </label>
        <div className="flex gap-3">
          {(["bfs", "dfs"] as Algorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`flex-1 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider transition-all ${
                algorithm === algo
                  ? algo === "bfs"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {algo}
              <span className="block text-xs font-normal opacity-70 mt-0.5">
                {algo === "bfs" ? "Breadth First" : "Depth First"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Jumlah Hasil */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          Jumlah Hasil
        </label>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setLimitMode("all")}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
              limitMode === "all"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setLimitMode("top")}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
              limitMode === "top"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Top N
          </button>
          {limitMode === "top" && (
            <input
              type="number"
              min={1}
              value={limitN}
              onChange={(e) => setLimitN(Number(e.target.value))}
              className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          ⚠ {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-mono font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            Memproses...
          </span>
        ) : (
          "▶  Jalankan Traversal"
        )}
      </button>
    </div>
  );
}
