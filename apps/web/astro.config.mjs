import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    tailwind(),
    sitemap(),
  ],
  site: process.env.PUBLIC_SITE_URL || "http://localhost:3000",
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
