// API calls ke backend G
import { SearchRequest, SearchResponse, LCARequest, LCAResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function handleResponse<T>(res: Response): Promise<T> {
  const rawBody = await res.text();
  let data: unknown = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error("Respons backend tidak valid (bukan JSON).");
    }
  }

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `HTTP ${res.status} ${res.statusText}`
    );
  }

  return data as T;
}

// POST /search — scraping + traversal dalam satu call
// Backend handle: kalau url diisi → scrape dulu, kalau html diisi → langsung parse
export async function searchDOM(req: SearchRequest): Promise<SearchResponse> {
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<SearchResponse>(res);
}

// POST /lca — Lowest Common Ancestor (bonus)
export async function findLCA(req: LCARequest): Promise<LCAResponse> {
  const res = await fetch(`${BASE_URL}/lca`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<LCAResponse>(res);
}

// GET /health — cek koneksi backend
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
