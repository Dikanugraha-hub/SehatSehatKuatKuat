# SehatSehatKuatKuat — DOM CSS Traversal

> Tugas Besar 2 IF2211 Strategi Algoritma · Semester II 2025/2026  
> Institut Teknologi Bandung · Program Studi Teknik Informatika

Aplikasi web untuk menelusuri dan mencari elemen HTML berdasarkan **CSS Selector** pada struktur pohon **Document Object Model (DOM)** menggunakan algoritma **Breadth-First Search (BFS)** dan **Depth-First Search (DFS)**.

---

## 🗂️ Struktur Repository

```
SehatSehatKuatKuat/
├── backend/                  # Server Go
│   ├── cmd/server/
│   │   └── main.go           # Entry point, HTTP routes
│   ├── internal/
│   │   ├── dom/              # Struktur data Node
│   │   ├── parser/           # HTML parser → DOM tree
│   │   ├── scraper/          # HTTP scraping URL
│   │   ├── selector/         # CSS selector matcher
│   │   ├── traversal/        # BFS & DFS implementation
│   │   ├── service/          # Business logic (Search)
│   │   └── lca/              # Lowest Common Ancestor (bonus)
│   ├── go.mod
│   └── Dockerfile
│
├── frontend/                 # Aplikasi Next.js
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client & utilities
│   │   └── types/            # TypeScript type definitions
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

## ⚙️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Go 1.24 |
| Container | Docker, Docker Compose |

---

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) >= 20
- [Go](https://go.dev/) >= 1.24
- [Docker](https://www.docker.com/) (opsional, untuk bonus Docker)

---

### Opsi A — Tanpa Docker (Development)

**1. Jalankan Backend**

```bash
cd backend
go run ./cmd/server/main.go
```

Backend berjalan di `http://localhost:8080`. Verifikasi:
```bash
curl http://localhost:8080/health
# → {"status":"ok"}
```

**2. Jalankan Frontend**

Buka terminal baru:
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Buka browser di `http://localhost:3000`.

---

### Opsi B — Dengan Docker Compose

```bash
cd frontend
docker compose up --build
```

Perintah ini akan build dan menjalankan **frontend + backend** sekaligus.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8080 |

Untuk menghentikan:
```bash
docker compose down
```

---

### Opsi C — Docker per Service

**Backend:**
```bash
cd backend
docker build -t dom-backend .
docker run -p 8080:8080 dom-backend
```

**Frontend:**
```bash
cd frontend
docker build -t frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 frontend
```

---

## ✅ Checklist Fitur

| No | Fitur | Status |
|----|-------|--------|
| 1 | Aplikasi berhasil dikompilasi tanpa kesalahan | ✅ |
| 2 | Aplikasi berhasil dijalankan | ✅ |
| 3 | Input URL web, pilihan algoritma, CSS selector, dan jumlah hasil | ✅ |
| 4 | Scraping terhadap web pada input URL | ✅ |
| 5 | Visualisasi pohon DOM | ✅ |
| 6 | Penelusuran pohon DOM dan menampilkan hasil | ✅ |
| 7 | Menandai jalur tempuh oleh algoritma | ✅ |
| 8 | Menyimpan jalur yang ditempuh dalam traversal log | ✅ |
| 9 | [Bonus] Membuat video | ⬜ |
| 10 | [Bonus] Deploy aplikasi | ⬜ |
| 11 | [Bonus] Animasi penelusuran pohon | ✅ |
| 12 | [Bonus] Implementasi multithreading (Parallel BFS) | ✅ |
| 13 | [Bonus] Implementasi LCA Binary Lifting | ✅ |

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080`

### `GET /health`
Cek status server.
```json
{ "status": "ok" }
```

### `POST /search`
Traversal BFS/DFS pada pohon DOM berdasarkan CSS selector.

**Request:**
```json
{
  "url": "https://example.com",
  "html": "",
  "algorithm": "bfs",
  "selector": "p",
  "limit": 0
}
```
> Isi **salah satu** antara `url` atau `html`. `limit: 0` = tampilkan semua hasil.

**Response:**
```json
{
  "matches": [...],
  "tree": [...],
  "match_count": 3,
  "visited_count": 42,
  "duration_ms": 5,
  "max_depth": 7,
  "traversal_log": ["html", "head", "body", "..."],
  "traversal_sequence": ["root", "root.0", "root.1", "..."]
}
```

### `POST /lca`
Mencari Lowest Common Ancestor dari dua CSS selector.

**Request:**
```json
{
  "url": "https://example.com",
  "selector_a": "h1",
  "selector_b": "p.info"
}
```
## 🧑‍💻 Kontributor

| NIM | Nama | Tugas |
|-----|------|-------|
| 13524120 | Jonathan Alveraldo Bangun | Backend (Go) |
| 13524124 | Zahran Alvan P. W. | Frontend (Next.js + Tailwind) |
| 13524132 | Dika Pramudya Nugraha | Backend (Go) |

---

## 📚 Referensi

- [CSS Selector Reference — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Breadth-First Search — Wikipedia](https://www.geeksforgeeks.org/dsa/breadth-first-search-or-bfs-for-a-graph/)
- [Depth-First Search — Wikipedia](https://www.geeksforgeeks.org/dsa/depth-first-search-or-dfs-for-a-graph/)
- [LCA Binary Lifting — CP Algorithms](https://www.geeksforgeeks.org/dsa/lca-in-a-tree-using-binary-lifting-technique/)
- [Go Documentation](https://go.dev/doc/)
- [Next.js Documentation](https://nextjs.org/docs)