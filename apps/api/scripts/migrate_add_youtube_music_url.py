"""
Migración: agrega la columna site_settings.youtube_music_url.

Se usa para el botón "Escuchar", que ahora ofrece elegir entre Spotify y
YouTube Music. Es un campo distinto de youtube_url (canal de videos).

Idempotente: si la columna ya existe, no hace nada.
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

    cols = {row[1] for row in cur.execute("PRAGMA table_info(site_settings)")}
    if "youtube_music_url" in cols:
        print("youtube_music_url ya existe; nada que hacer.")
        conn.close()
        return

    cur.execute("ALTER TABLE site_settings ADD COLUMN youtube_music_url VARCHAR(500)")
    conn.commit()
    print("Columna youtube_music_url agregada.")
    conn.close()


if __name__ == "__main__":
    main()
