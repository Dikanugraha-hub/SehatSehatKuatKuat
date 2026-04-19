# API Contract — DOM CSS Traversal (IF2211 Tugas Besar 2)

**Base URL:** `http://localhost:8080`
**Content-Type:** `application/json`
**CORS:** sudah di-handle backend (`Access-Control-Allow-Origin: *`)

---

## GET /health

**Response 200:**
```json
{ "status": "ok" }
```

---

## POST /search

Scraping (opsional) + parsing HTML + traversal BFS/DFS dalam satu call.

**Request Body:**
```json
{
  "url": "https://example.com",
  "html": "",
  "algorithm": "bfs",
  "selector": "p.info",
  "limit": 0
}
```
> Isi **salah satu** antara `url` atau `html`. Jika keduanya diisi → error 400.

**Response 200:**
```json
{
  "matches": [
    {
      "uid": "root.1.0.2",
      "node_index": 8,
      "tag": "p",
      "id": "",
      "class": "info",
      "content": "You may use this domain.",
      "depth": 3,
      "path": "html > body > div.container > p.info",
      "attributes": { "class": "info" }
    }
  ],
  "tree": [
    {
      "uid": "root",
      "node_index": 0,
      "parent_uid": "",
      "tag": "html",
      "id": "",
      "class": "",
      "depth": 0,
      "children": [1, 2]
    }
  ],
  "match_count": 1,
  "visited_count": 13,
  "duration_ms": 4,
  "max_depth": 5,
  "traversal_log": ["html", "head", "body", "div.container", "p.info"],
  "traversal_sequence": ["root", "root.0", "root.1", "root.1.0", "root.1.0.2"]
}
```

**Field penting:**
- `tree[]` = flat adjacency list. `children` berisi array `node_index`.
- `uid` = path-based: `"root"`, `"root.0"`, `"root.0.1"`, dst.
- `traversal_log[i]` dan `traversal_sequence[i]` berkorespondensi (index sama).
- `traversal_log` = label readable (`"div.container"`), `traversal_sequence` = uid.

---

## POST /lca

Mencari Lowest Common Ancestor dari dua CSS selector.

**Request Body:**
```json
{
  "url": "https://example.com",
  "html": "",
  "selector_a": "h1",
  "selector_b": "p.info"
}
```

**Response 200:**
```json
{
  "node_a":   { "uid": "root.1.0.0", "tag": "h1", ... },
  "node_b":   { "uid": "root.1.0.2", "tag": "p",  ... },
  "lca_node": { "uid": "root.1.0",   "tag": "div", ... }
}
```
