"use client";

// Render pohon DOM dari flat adjacency list backend (tree: TreeNode[])
import { TreeNode } from "@/types";
import { cn, nodeLabel } from "@/lib/utils";

// Warna per tag
const TAG_COLORS: Record<string, string> = {
  html: "text-orange-400", head: "text-yellow-400", body: "text-green-400",
  div: "text-blue-400", p: "text-purple-400", span: "text-pink-400",
  a: "text-cyan-400", ul: "text-lime-400", ol: "text-lime-400", li: "text-lime-300",
  h1: "text-red-400", h2: "text-red-400", h3: "text-red-300",
  h4: "text-red-300", h5: "text-red-200", h6: "text-red-200",
  table: "text-amber-400", tr: "text-amber-300", td: "text-amber-200", th: "text-amber-200",
  form: "text-teal-400", input: "text-teal-300", button: "text-teal-300",
  img: "text-indigo-400", nav: "text-sky-400", header: "text-sky-400",
  footer: "text-sky-300", main: "text-sky-300", section: "text-violet-400",
  article: "text-violet-300", "#text": "text-zinc-500",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag.toLowerCase()] ?? "text-zinc-300";
}

interface DOMTreeViewerProps {
  tree: TreeNode[];             // flat adjacency list dari backend
  visitedUids: Set<string>;     // uid yang sudah dikunjungi
  currentUid: string | null;    // uid yang sedang dikunjungi sekarang
  matchedUids: Set<string>;     // uid yang match CSS selector
  algorithm: "bfs" | "dfs";
}

interface NodeItemProps {
  node: TreeNode;
  tree: TreeNode[];            // seluruh flat tree untuk lookup children
  visitedUids: Set<string>;
  currentUid: string | null;
  matchedUids: Set<string>;
  isRoot?: boolean;
}

function NodeItem({ node, tree, visitedUids, currentUid, matchedUids, isRoot = false }: NodeItemProps) {
  const isVisited  = visitedUids.has(node.uid);
  const isCurrent  = currentUid === node.uid;
  const isMatched  = matchedUids.has(node.uid);

  // Ambil children dari flat tree berdasarkan node_index
  const children = node.children
    .map((idx) => tree.find((n) => n.node_index === idx))
    .filter((n): n is TreeNode => n !== undefined);

  // Label: <tag#id.class>
  let label = `<${node.tag}`;
  if (node.id)    label += `#${node.id}`;
  if (node.class) label += ` class="${node.class}"`;
  label += ">";

  return (
    <div className={cn("relative", !isRoot && "ml-5 border-l border-zinc-800 pl-3")}>
      <div
        className={cn(
          "flex items-center gap-1.5 py-0.5 px-2 rounded-md my-0.5 text-xs font-mono transition-all duration-150",
          isCurrent && "ring-1 ring-white bg-white/10",
          isMatched && !isCurrent && "bg-yellow-400/10 ring-1 ring-yellow-400/40",
          isVisited && !isMatched && !isCurrent && "opacity-100",
          !isVisited && "opacity-25",
        )}
      >
        <span className={cn("font-bold shrink-0", getTagColor(node.tag))}>
          {label}
        </span>

        {isMatched && (
          <span className="ml-auto shrink-0 text-yellow-400 font-bold text-[10px] bg-yellow-400/20 px-1.5 rounded">
            MATCH
          </span>
        )}
        {isCurrent && (
          <span className="ml-auto shrink-0 text-white font-bold text-[10px] bg-white/20 px-1.5 rounded animate-pulse">
            →
          </span>
        )}
      </div>

      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <NodeItem
              key={child.uid}
              node={child}
              tree={tree}
              visitedUids={visitedUids}
              currentUid={currentUid}
              matchedUids={matchedUids}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DOMTreeViewer({
  tree,
  visitedUids,
  currentUid,
  matchedUids,
  algorithm,
}: DOMTreeViewerProps) {
  // Root = node tanpa parent_uid atau index 0
  const root = tree.find((n) => !n.parent_uid) ?? tree[0];

  if (!root) {
    return (
      <p className="text-zinc-500 font-mono text-xs text-center py-8">
        Tidak ada data pohon DOM.
      </p>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/20 ring-1 ring-white inline-block" />
          <span className="text-zinc-400">Sedang dikunjungi</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-400/20 ring-1 ring-yellow-400/50 inline-block" />
          <span className="text-zinc-400">Match selector</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded opacity-25 bg-zinc-500 inline-block" />
          <span className="text-zinc-400">Belum dikunjungi</span>
        </span>
        <span className="ml-auto text-zinc-600">
          algo:{" "}
          <span className={algorithm === "bfs" ? "text-blue-400" : "text-purple-400"}>
            {algorithm.toUpperCase()}
          </span>
        </span>
      </div>

      {/* Tree */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-auto max-h-[500px]">
        <NodeItem
          node={root}
          tree={tree}
          visitedUids={visitedUids}
          currentUid={currentUid}
          matchedUids={matchedUids}
          isRoot={true}
        />
      </div>

      <p className="mt-2 text-xs text-zinc-600 font-mono text-right">
        {tree.length} node total · kedalaman maks {Math.max(...tree.map((n) => n.depth))}
      </p>
    </div>
  );
}
