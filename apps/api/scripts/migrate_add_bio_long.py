"""
Migración manual: agrega la columna bio_long a band_members.
Idempotente: si ya existe, no hace nada.
"""
import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parent.parent / "data" / "app.db"

def main() -> None:
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info('band_members')")
    cols = [r[1] for r in cur.fetchall()]
    print(f"Columnas actuales: {cols}")
    if "bio_long" not in cols:
        cur.execute("ALTER TABLE band_members ADD COLUMN bio_long TEXT")
        conn.commit()
        print("[OK] Columna bio_long agregada.")
    else:
        print("[OK] La columna bio_long ya existia.")
    cur.execute("PRAGMA table_info('band_members')")
    print(f"Columnas finales: {[r[1] for r in cur.fetchall()]}")
    conn.close()


if __name__ == "__main__":
    main()
