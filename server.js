const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs/promises");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = __dirname;
const ALBUM_URL =
  process.env.GOOGLE_PHOTOS_ALBUM_URL ||
  "https://photos.app.goo.gl/uwu8JLuMXjuRSUUH7";
const CACHE_MS = Number(process.env.GALLERY_CACHE_MS || 10 * 60 * 1000);

let galleryCache = {
  fetchedAt: 0,
  items: [],
  error: null
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function normalizeGoogleImage(url, size = "w1800-h1200-no") {
  const clean = url
    .replace(/\\u003d/g, "=")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/");

  const [base] = clean.split("=");
  return `${base}=${size}`;
}

function extractGalleryItems(html) {
  const matches = html.match(/https:\/\/lh3\.googleusercontent\.com\/[^"'\\\]]+/g) || [];
  const seen = new Set();

  return matches
    .map((url) => normalizeGoogleImage(url))
    .filter((url) => url.includes("/pw/"))
    .filter((url) => {
      const base = url.split("=")[0];
      if (seen.has(base)) return false;
      seen.add(base);
      return true;
    })
    .map((src, index) => ({
      id: `photo-${index + 1}`,
      src,
      thumb: normalizeGoogleImage(src, "w720-h540-no"),
      alt: `Juanma & The Center People en vivo ${index + 1}`
    }));
}

async function fetchGallery() {
  const now = Date.now();
  if (galleryCache.items.length && now - galleryCache.fetchedAt < CACHE_MS) {
    return galleryCache;
  }

  const response = await fetch(ALBUM_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Photos respondio ${response.status}`);
  }

  const html = await response.text();
  const items = extractGalleryItems(html);

  if (!items.length) {
    throw new Error("No se encontraron imagenes publicas en el album.");
  }

  galleryCache = {
    fetchedAt: now,
    items,
    error: null
  };

  return galleryCache;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = path
    .normalize(decodeURIComponent(url.pathname))
    .replace(/^([/\\])+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath === "" ? "index.html" : safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error("Not a file");
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-store" : "public, max-age=3600"
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("No encontrado");
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith("/api/gallery")) {
    try {
      const gallery = await fetchGallery();
      json(res, 200, {
        source: ALBUM_URL,
        updatedAt: new Date(gallery.fetchedAt).toISOString(),
        photos: gallery.items
      });
    } catch (error) {
      json(res, galleryCache.items.length ? 200 : 502, {
        source: ALBUM_URL,
        updatedAt: galleryCache.fetchedAt
          ? new Date(galleryCache.fetchedAt).toISOString()
          : null,
        photos: galleryCache.items,
        error: error.message
      });
    }
    return;
  }

  await serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Juanma & The Center People: http://localhost:${PORT}`);
});
