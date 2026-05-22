"""
Procesa el logo/wordmark de la banda.

Lee  apps/web/public/logo-source.png
Genera apps/web/public/logo-dark.png  (texto oscuro sobre transparente — fondos claros)
Genera apps/web/public/logo-light.png (texto bone #f5f0eb sobre transparente — fondos oscuros)

Algoritmo:
- Toma los píxeles más claros (~fondo) y los hace transparentes.
- Para la versión "dark": preserva el color original del trazo.
- Para la versión "light": reemplaza el color del trazo por el bone del sitio.
- La opacidad final es proporcional a qué tan oscuro era el píxel original
  (preserva el antialiasing del trazo).
"""
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from PIL import Image

# Color "bone" del sitio (del tailwind.config.mjs)
BONE = (245, 240, 235)

# Umbral: píxeles más claros que esto se consideran fondo.
# Valor en escala 0-255 sobre la luminancia.
FONDO_UMBRAL = 200

WEB_PUBLIC = Path(__file__).resolve().parent.parent.parent.parent / "apps" / "web" / "public"
SOURCE = WEB_PUBLIC / "logo-source.png"
OUT_DARK = WEB_PUBLIC / "logo-dark.png"
OUT_LIGHT = WEB_PUBLIC / "logo-light.png"


def luminance(r: int, g: int, b: int) -> int:
    """Aproximación rápida de luminancia (Rec. 601)."""
    return (299 * r + 587 * g + 114 * b) // 1000


def main() -> None:
    if not SOURCE.is_file():
        print(f"[ERROR] No existe {SOURCE}")
        print("Guarda tu logo como logo-source.png en apps/web/public/")
        sys.exit(1)

    img = Image.open(SOURCE).convert("RGBA")
    width, height = img.size
    print(f"  Procesando {SOURCE.name}: {width}x{height}")

    pixels = img.load()
    dark = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    light = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    px_dark = dark.load()
    px_light = light.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            lum = luminance(r, g, b)
            if lum >= FONDO_UMBRAL:
                # Es fondo, dejar transparente
                continue
            # Cuánto más oscuro, más opaco (preserva antialiasing del trazo)
            opacity = int((1 - (lum / FONDO_UMBRAL)) * 255)
            opacity = min(255, max(0, opacity))
            # Dark: mantener color original
            px_dark[x, y] = (r, g, b, opacity)
            # Light: pintar con bone
            px_light[x, y] = (*BONE, opacity)

    dark.save(OUT_DARK, "PNG", optimize=True)
    light.save(OUT_LIGHT, "PNG", optimize=True)
    print(f"  [OK] Generado {OUT_DARK.name}")
    print(f"  [OK] Generado {OUT_LIGHT.name}")


if __name__ == "__main__":
    main()
