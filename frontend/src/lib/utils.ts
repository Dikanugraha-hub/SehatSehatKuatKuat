import { TreeNode, MatchedNode } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format durasi dari ms integer
export function formatTime(ms: number): string {
  if (ms === 0) return "< 1 ms";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// Buat map uid -> TreeNode untuk lookup O(1)
export function buildUidMap(tree: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();
  for (const node of tree) {
    map.set(node.uid, node);
  }
  return map;
}

// Buat map uid -> MatchedNode untuk lookup
export function buildMatchedUidMap(matches: MatchedNode[]): Map<string, MatchedNode> {
  const map = new Map<string, MatchedNode>();
  for (const m of matches) {
    map.set(m.uid, m);
  }
  return map;
}

// Ambil node root dari flat tree (parent_uid kosong atau index 0)
export function getRootNode(tree: TreeNode[]): TreeNode | null {
  if (tree.length === 0) return null;
  return tree.find((n) => !n.parent_uid) ?? tree[0];
}

// Download string sebagai file .txt
export function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Format traversal log untuk di-download
export function formatLogForDownload(
  log: string[],
  sequence: string[],
  algorithm: string,
  selector: string
): string {
  const lines = [
    `=== Traversal Log ===`,
    `Algoritma : ${algorithm.toUpperCase()}`,
    `Selector  : ${selector}`,
    `Tanggal   : ${new Date().toLocaleString("id-ID")}`,
    ``,
    `Step | UID                  | Label`,
    `-`.repeat(55),
    ...log.map((label, i) => {
      const uid = sequence[i] ?? "-";
      return `${String(i + 1).padStart(4)} | ${uid.padEnd(20)} | ${label}`;
    }),
  ];
  return lines.join("\n");
}

// Validasi URL sederhana
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const HTML_TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g;

function normalizeHtml(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, "").trim();
}

export function validateHtmlInput(html: string): ValidationResult {
  const normalized = normalizeHtml(html);
  if (!normalized) {
    return { isValid: false, error: "HTML tidak boleh kosong." };
  }

  if (!/<html\b/i.test(normalized)) {
    return { isValid: false, error: "Dokumen harus memiliki tag <html>." };
  }

  if (!/<body\b/i.test(normalized)) {
    return { isValid: false, error: "Dokumen harus memiliki tag <body>." };
  }

  const stack: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = HTML_TAG_REGEX.exec(normalized)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosingTag = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>");

    if (isClosingTag) {
      const expectedTag = stack.pop();
      if (!expectedTag) {
        return {
          isValid: false,
          error: `Tag penutup </${tagName}> tidak memiliki pasangan pembuka.`,
        };
      }
      if (expectedTag !== tagName) {
        return {
          isValid: false,
          error: `Struktur tag tidak valid: menutup </${tagName}> tetapi yang diharapkan </${expectedTag}>.`,
        };
      }
      continue;
    }

    if (!isSelfClosing && !VOID_HTML_TAGS.has(tagName)) {
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return {
      isValid: false,
      error: `Tag <${stack[stack.length - 1]}> belum ditutup.`,
    };
  }

  return { isValid: true };
}

export function validateCssSelectorInput(selector: string): ValidationResult {
  const normalized = selector.trim();
  if (!normalized) {
    return { isValid: false, error: "CSS Selector tidak boleh kosong." };
  }

  try {
    document.createDocumentFragment().querySelector(normalized);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Sintaks CSS Selector tidak valid." };
  }
}

// Buat label pendek untuk node (tag + id/class jika ada)
export function nodeLabel(node: TreeNode): string {
  let label = `<${node.tag}`;
  if (node.id) label += `#${node.id}`;
  else if (node.class) label += `.${node.class.split(" ")[0]}`;
  label += ">";
  return label;
}
