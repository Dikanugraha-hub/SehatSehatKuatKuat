# DOM Traversal Frontend

Frontend aplikasi penelusuran CSS Selector pada pohon DOM menggunakan algoritma BFS dan DFS.

**Tech stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui  
**Tugas:** IF2211 Strategi Algoritma — Tugas Besar 2, Semester II 2025/2026

---

## Requirement

- Node.js >= 20
- npm >= 9
- Backend Go berjalan di `http://localhost:8080` (lihat `API_CONTRACT.md`)

---

## Cara Menjalankan (Development)

```bash
# 1. Clone repository
git clone <url-repo-frontend>
cd frontend

# 2. Install dependencies
npm install

# 3. Set environment variable
cp .env.example .env.local
# Edit .env.local jika URL backend berbeda

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## Cara Menjalankan (Docker)

```bash
# Build dan jalankan hanya frontend
docker build -t frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 frontend

# Atau jalankan frontend + backend sekaligus
docker compose up --build
```

---

## Struktur Folder

```
src/
├── app/
│   ├── layout.tsx        # Root layout (font, metadata)
│   ├── page.tsx          # Halaman utama
│   └── globals.css       # Global styles
├── components/
│   ├── InputForm.tsx         # Form input URL/HTML, selector, algoritma
│   ├── DOMTreeViewer.tsx     # Visualisasi pohon DOM + highlight animasi
│   ├── AnimationControls.tsx # Play/pause/reset animasi traversal
│   ├── StatsPanel.tsx        # Statistik hasil traversal
│   ├── TraversalLog.tsx      # Log langkah traversal + download
│   └── MatchedResults.tsx    # Daftar elemen yang match selector
├── hooks/
│   └── useTraversalAnimation.ts  # Hook animasi step-by-step
├── lib/
│   ├── api.ts            # API calls ke backend Go
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
```

---

## Fitur

### Wajib
- [x] Input URL website atau raw HTML
- [x] Pilihan algoritma: BFS / DFS
- [x] Input CSS Selector
- [x] Pilihan jumlah hasil: Top N / Semua
- [x] Visualisasi pohon DOM
- [x] Highlight elemen yang match selector
- [x] Tampilkan waktu pencarian & jumlah node dikunjungi
- [x] Traversal log (tampil + download)

### Bonus
- [x] Animasi penelusuran pohon DOM (step-by-step dengan kontrol play/pause/reset/speed)
- [x] Docker (Dockerfile + docker-compose.yml)

---

## API Contract

Lihat file `API_CONTRACT.md` untuk spesifikasi lengkap endpoint backend.

---

## Author

Zahran Alvan Putra Winarko — IF2211 Strategi Algoritma  
Institut Teknologi Bandung · 2025/2026
