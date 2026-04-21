// lib/mockData.ts
// Data dummy format NYATA sesuai backend Go (main.go searchResponse)

import { SearchResponse, LCAResponse, MatchedNode, TreeNode } from "@/types";

// Flat adjacency list tree
const MOCK_TREE: TreeNode[] = [
  { uid: "root",        node_index: 0,  parent_uid: "",           tag: "html",  id: "", class: "",          depth: 0, children: [1, 2] },
  { uid: "root.0",      node_index: 1,  parent_uid: "root",       tag: "head",  id: "", class: "",          depth: 1, children: [3, 4] },
  { uid: "root.1",      node_index: 2,  parent_uid: "root",       tag: "body",  id: "", class: "",          depth: 1, children: [5] },
  { uid: "root.0.0",    node_index: 3,  parent_uid: "root.0",     tag: "title", id: "", class: "",          depth: 2, children: [] },
  { uid: "root.0.1",    node_index: 4,  parent_uid: "root.0",     tag: "meta",  id: "", class: "",          depth: 2, children: [] },
  { uid: "root.1.0",    node_index: 5,  parent_uid: "root.1",     tag: "div",   id: "", class: "container", depth: 2, children: [6, 7, 8, 9] },
  { uid: "root.1.0.0",  node_index: 6,  parent_uid: "root.1.0",   tag: "h1",   id: "", class: "",          depth: 3, children: [] },
  { uid: "root.1.0.1",  node_index: 7,  parent_uid: "root.1.0",   tag: "p",    id: "", class: "",          depth: 3, children: [10] },
  { uid: "root.1.0.2",  node_index: 8,  parent_uid: "root.1.0",   tag: "p",    id: "", class: "info",      depth: 3, children: [] },
  { uid: "root.1.0.3",  node_index: 9,  parent_uid: "root.1.0",   tag: "nav",  id: "", class: "",          depth: 3, children: [11, 12] },
  { uid: "root.1.0.1.0",node_index: 10, parent_uid: "root.1.0.1", tag: "span", id: "", class: "highlight", depth: 4, children: [] },
  { uid: "root.1.0.3.0",node_index: 11, parent_uid: "root.1.0.3", tag: "a",    id: "", class: "",          depth: 4, children: [] },
  { uid: "root.1.0.3.1",node_index: 12, parent_uid: "root.1.0.3", tag: "a",    id: "", class: "info",      depth: 4, children: [] },
];

// Eksplisit tipe MatchedNode[] supaya TS tidak infer attributes sebagai { class?: undefined }
const MOCK_MATCHES: MatchedNode[] = [
  {
    uid: "root.1.0.1",
    node_index: 7,
    tag: "p",
    id: "",
    class: "",
    content: "This domain is for illustrative examples.",
    depth: 3,
    path: "html > body > div.container > p",
    attributes: {},
  },
  {
    uid: "root.1.0.2",
    node_index: 8,
    tag: "p",
    id: "",
    class: "info",
    content: "You may use this domain in examples.",
    depth: 3,
    path: "html > body > div.container > p.info",
    attributes: { class: "info" },
  },
];

// BFS: level by level
export const MOCK_BFS_RESPONSE: SearchResponse = {
  matches: MOCK_MATCHES,
  tree: MOCK_TREE,
  match_count: 2,
  visited_count: 13,
  duration_ms: 4,
  max_depth: 5,
  traversal_log: [
    "html", "head", "body",
    "title", "meta", "div.container",
    "h1", "p", "p.info", "nav",
    "span.highlight", "a", "a.info",
  ],
  traversal_sequence: [
    "root", "root.0", "root.1",
    "root.0.0", "root.0.1", "root.1.0",
    "root.1.0.0", "root.1.0.1", "root.1.0.2", "root.1.0.3",
    "root.1.0.1.0", "root.1.0.3.0", "root.1.0.3.1",
  ],
};

// DFS: masuk sedalam mungkin dulu
export const MOCK_DFS_RESPONSE: SearchResponse = {
  matches: MOCK_MATCHES,
  tree: MOCK_TREE,
  match_count: 2,
  visited_count: 13,
  duration_ms: 2,
  max_depth: 5,
  traversal_log: [
    "html",
    "head", "title", "meta",
    "body", "div.container",
    "h1",
    "p", "span.highlight",
    "p.info",
    "nav", "a", "a.info",
  ],
  traversal_sequence: [
    "root",
    "root.0", "root.0.0", "root.0.1",
    "root.1", "root.1.0",
    "root.1.0.0",
    "root.1.0.1", "root.1.0.1.0",
    "root.1.0.2",
    "root.1.0.3", "root.1.0.3.0", "root.1.0.3.1",
  ],
};

// ── Mock LCA ──────────────────────────────────────────────────────────────────
// Skenario: cari LCA dari <h1> (selector "h1") dan <span.highlight> (selector "span.highlight")
// LCA-nya adalah <div.container>
export const MOCK_LCA_RESPONSE: LCAResponse = {
  node_a: {
    uid: "root.1.0.0",
    node_index: 6,
    tag: "h1",
    id: "",
    class: "",
    content: "Example Domain",
    depth: 3,
    path: "html > body > div.container > h1",
    attributes: {},
  },
  node_b: {
    uid: "root.1.0.1.0",
    node_index: 10,
    tag: "span",
    id: "",
    class: "highlight",
    content: "illustrative",
    depth: 4,
    path: "html > body > div.container > p > span.highlight",
    attributes: { class: "highlight" },
  },
  lca_node: {
    uid: "root.1.0",
    node_index: 5,
    tag: "div",
    id: "",
    class: "container",
    content: "Example Domain This domain is for illustrative examples.",
    depth: 2,
    path: "html > body > div.container",
    attributes: { class: "container" },
  },
};
