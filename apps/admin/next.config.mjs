/** @type {import('next').NextConfig} */

// Forzar IPv4: Node 18+ resuelve "localhost" como IPv6 (::1) y uvicorn
// solo escucha en IPv4 por defecto, lo que rompe el proxy.
const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: `${API_BASE}/api/admin/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${API_BASE}/api/auth/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${API_BASE}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
