// Request
export type Algorithm = "bfs" | "dfs";
export type InputMode = "url" | "html";
export type AnimationState = "idle" | "playing" | "paused" | "done";

export interface SearchRequest {
  url?: string;    // salah satu diisi
  html?: string;   // salah satu diisi
  algorithm: Algorithm;
  selector: string;
  limit: number;   // 0 = semua
}

export interface LCARequest {
  url?: string;
  html?: string;
  selector_a: string;
  selector_b: string;
}

// Response: /search
// Node hasil match selector
export interface MatchedNode {
  uid: string;                      // path-based: "root", "root.0", "root.0.1"
  node_index: number;               // index dalam BFS flat tree
  tag: string;
  id: string;
  class: string;
  content: string;
  depth: number;
  path: string;                     // "html > body > div > p"
  attributes: Record<string, string>;
}

// Node dalam adjacency-list tree (flat, bukan nested)
export interface TreeNode {
  uid: string;
  node_index: number;
  parent_uid: string;
  tag: string;
  id: string;
  class: string;
  depth: number;
  children: number[];               // array of node_index (bukan uid)
}

export interface SearchResponse {
  matches: MatchedNode[];
  tree: TreeNode[];                 // flat adjacency list, index 0 = root
  match_count: number;
  visited_count: number;
  duration_ms: number;
  max_depth: number;
  traversal_log: string[];          // label per node: ["html", "head", "body#main"]
  traversal_sequence: string[];     // uid per node dalam urutan kunjungan
}

// Response: /lca
export interface LCAResponse {
  node_a: MatchedNode;
  node_b: MatchedNode;
  lca_node: MatchedNode;
}

// Error
export interface ApiError {
  error: string;
}
