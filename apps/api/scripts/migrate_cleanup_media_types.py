"""
Migración: simplifica los tipos de media a 3 (Imagen / Video / Reel).

Antes había 6 tipos: Imagen, Video, Reel, Flyer, Portada/Artwork, Descargable.
Flyer y Portada/Artwork son CATEGORÍAS dentro de Imagen, no tipos.
Descargable se gestiona en otra tabla (download_assets).

Esta migración:
1. Re-asigna media_items que usaban Flyer/Portada al tipo Imagen + categoría correspondiente
2. Elimina media_items que usaban tipo Descargable (deberían migrarse a download_assets manualmente si hay)
3. Elimina las 4 categorías de tipo Descargable (Fotos prensa, Portada/Logo, Rider, EPK PDF)
4. Elimina los 3 tipos obsoletos (flyer, cover, download)

Idempotente: si ya está limpio, no hace nada.
"""
import sys
import sqlite3
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DB = Path(__file__).resolve().parent.parent / "data" / "app.db"


def main() -> None:
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    # Mapear slugs a IDs actuales
    cur.execute("SELECT id, slug FROM media_types")
    types = {slug: tid for tid, slug in cur.fetchall()}
    print(f"Tipos actuales: {list(types.keys())}")

    if "flyer" not in types and "cover" not in types and "download" not in types:
        print("[OK] Ya limpio. Nada que hacer.")
        conn.close()
        return

    image_id = types.get("image")
    if not image_id:
        print("[ERROR] No existe el tipo 'image'. Abortando.")
        conn.close()
        return

    # 1. Asegurar que existan las categorías Flyers y Portadas dentro de Imagen
    cur.execute("SELECT id, slug FROM media_categories WHERE media_type_id = ?", (image_id,))
    image_cats = {slug: cid for cid, slug in cur.fetchall()}

    if "flyers" not in image_cats:
        cur.execute(
            "INSERT INTO media_categories (media_type_id, name, slug, is_active, sort_order) "
            "VALUES (?, 'Flyers', 'flyers', 1, 5)",
            (image_id,),
        )
        flyers_cat_id = cur.lastrowid
        print("  [OK] Categoría 'Flyers' creada en Imagen.")
    else:
        flyers_cat_id = image_cats["flyers"]

    if "portadas" not in image_cats:
        cur.execute(
            "INSERT INTO media_categories (media_type_id, name, slug, is_active, sort_order) "
            "VALUES (?, 'Portadas / Artwork', 'portadas', 1, 6)",
            (image_id,),
        )
        portadas_cat_id = cur.lastrowid
        print("  [OK] Categoría 'Portadas / Artwork' creada en Imagen.")
    else:
        portadas_cat_id = image_cats["portadas"]

    # 2. Re-asignar media_items que usaban flyer → tipo image + categoría flyers
    if "flyer" in types:
        cur.execute(
            "UPDATE media_items SET media_type_id = ?, category_id = ? WHERE media_type_id = ?",
            (image_id, flyers_cat_id, types["flyer"]),
        )
        print(f"  [OK] {cur.rowcount} media_items re-asignados de Flyer → Imagen/Flyers.")

    # 3. Re-asignar media_items que usaban cover → tipo image + categoría portadas
    if "cover" in types:
        cur.execute(
            "UPDATE media_items SET media_type_id = ?, category_id = ? WHERE media_type_id = ?",
            (image_id, portadas_cat_id, types["cover"]),
        )
        print(f"  [OK] {cur.rowcount} media_items re-asignados de Cover → Imagen/Portadas.")

    # 4. Eliminar media_items que usaban tipo download (raros: deberían ser DownloadAsset)
    if "download" in types:
        cur.execute("DELETE FROM media_items WHERE media_type_id = ?", (types["download"],))
        print(f"  [OK] {cur.rowcount} media_items de tipo Descargable eliminados.")

    # 5. Eliminar categorías de los tipos obsoletos
    for slug in ("flyer", "cover", "download"):
        if slug in types:
            cur.execute("DELETE FROM media_categories WHERE media_type_id = ?", (types[slug],))
            if cur.rowcount > 0:
                print(f"  [OK] {cur.rowcount} categorías de '{slug}' eliminadas.")

    # 6. Eliminar los tipos obsoletos
    for slug in ("flyer", "cover", "download"):
        if slug in types:
            cur.execute("DELETE FROM media_types WHERE id = ?", (types[slug],))
            print(f"  [OK] Tipo '{slug}' eliminado.")

    conn.commit()

    # Verificación final
    cur.execute("SELECT slug FROM media_types ORDER BY id")
    final_types = [r[0] for r in cur.fetchall()]
    print(f"\nTipos finales: {final_types}")
    cur.execute("SELECT COUNT(*) FROM media_categories")
    print(f"Total categorías: {cur.fetchone()[0]}")

    conn.close()


if __name__ == "__main__":
    main()
