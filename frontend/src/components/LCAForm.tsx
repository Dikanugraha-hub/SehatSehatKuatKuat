"use client";

// Form input untuk fitur LCA (Lowest Common Ancestor)
import { useState } from "react";
import { InputMode } from "@/types";
import { isValidUrl } from "@/lib/utils";

interface LCAFormProps {
  onSubmit: (params: {
    url?: string;
    html?: string;
    inputMode: InputMode;
    selector_a: string;
    selector_b: string;
  }) => void;
  isLoading: boolean;
}

export default function LCAForm({ onSubmit, isLoading }: LCAFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl]             = useState("");
  const [html, setHtml]           = useState("");
  const [selectorA, setSelectorA] = useState("");
  const [selectorB, setSelectorB] = useState("");
  const [error, setError]         = useState("");

  function handleSubmit() {
    setError("");

    if (inputMode === "url") {
      if (!url.trim())        return setError("URL tidak boleh kosong.");
      if (!isValidUrl(url))   return setError("Format URL tidak valid.");
    } else {
      if (!html.trim())       return setError("HTML tidak boleh kosong.");
    }

    if (!selectorA.trim())    return setError("Selector A tidak boleh kosong.");
    if (!selectorB.trim())    return setError("Selector B tidak boleh kosong.");
    if (selectorA === selectorB) return setError("Selector A dan B harus berbeda.");

    onSubmit({
      url:       inputMode === "url"  ? url  : undefined,
      html:      inputMode === "html" ? html : undefined,
      inputMode,
      selector_a: selectorA,
      selector_b: selectorB,
    });
  }

  return (
    <div className="space-y-6">
      {/* Info LCA */}
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg px-4 py-3 text-xs font-mono text-violet-300">
        <p className="font-bold mb-1">Lowest Common Ancestor (LCA)</p>
        <p className="text-violet-400">
          Mencari node leluhur terdekat yang sama dari dua elemen HTML yang dipilih via CSS selector.
        </p>
      </div>

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
                  ? "bg-violet-500 text-white font-bold"
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
          <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">HTML</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<html>...</html>"
            rows={6}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-y"
          />
        </div>
      )}

      {/* Selector A */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          <span className="text-blue-400">Node A</span> — CSS Selector
        </label>
        <input
          type="text"
          value={selectorA}
          onChange={(e) => setSelectorA(e.target.value)}
          placeholder="h1, .title, #header"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Selector B */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
          <span className="text-emerald-400">Node B</span> — CSS Selector
        </label>
        <input
          type="text"
          value={selectorB}
          onChange={(e) => setSelectorB(e.target.value)}
          placeholder="p, .content, #footer"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
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
        className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Mencari LCA...
          </span>
        ) : (
          "Cari LCA"
        )}
      </button>
    </div>
  );
}
