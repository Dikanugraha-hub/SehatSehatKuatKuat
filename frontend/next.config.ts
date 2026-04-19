import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return [
      { source: "/search",  destination: `${backendUrl}/search`  },
      { source: "/lca",     destination: `${backendUrl}/lca`     },
      { source: "/health",  destination: `${backendUrl}/health`  },
    ];
  },
};

export default nextConfig;
