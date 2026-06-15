import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const siteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:3000";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: siteUrl,
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes("/api/") &&
        !page.includes("/solicitar/") &&
        !page.endsWith("/404"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        `${siteUrl}/`,
        `${siteUrl}/banda`,
        `${siteUrl}/musica`,
        `${siteUrl}/fotos`,
        `${siteUrl}/videos`,
        `${siteUrl}/reels`,
        `${siteUrl}/prensa-epk`,
        `${siteUrl}/fechas`,
        `${siteUrl}/contacto`,
      ],
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    define: {
      "import.meta.env.API_BASE_URL": JSON.stringify(
        process.env.API_BASE_URL || "http://localhost:8000"
      ),
    },
  },
});
