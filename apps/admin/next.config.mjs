/** @type {import('next').NextConfig} */

// IMPORTANTE: evaluamos process.env DENTRO de async rewrites() para que
// se lea en RUNTIME (cuando el server arranca en el contenedor), no en
// BUILD-TIME. En modo standalone Next.js puede capturar constantes de
// nivel de módulo en el bundle del servidor.
// En local sin env, cae a 127.0.0.1:8000 (IPv4 para evitar el problema
// de "localhost" → IPv6 que rompe el proxy con uvicorn).
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "api" },
      { protocol: "https", hostname: "api.juanmacenterpeople.com" },
    ],
  },
  async rewrites() {
    const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
    return [
      {
        source: "/api/admin/:path*",
        destination: `${apiBase}/api/admin/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${apiBase}/api/auth/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${apiBase}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
