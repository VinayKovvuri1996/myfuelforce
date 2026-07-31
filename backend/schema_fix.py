from sqlalchemy import text

from . import database


def ensure_schema():
    """Best-effort ALTER for existing Neon tables (create_all won't add columns)."""
    statements = [
        "ALTER TABLE stocks ALTER COLUMN station_id DROP NOT NULL",
        "ALTER TABLE stocks ADD COLUMN IF NOT EXISTS unit VARCHAR DEFAULT 'Litre'",
        "ALTER TABLE stocks ADD COLUMN IF NOT EXISTS opening_quantity FLOAT DEFAULT 0",
        "ALTER TABLE stocks ADD COLUMN IF NOT EXISTS opening_date DATE",
        "ALTER TABLE shifts ALTER COLUMN station_id DROP NOT NULL",
        "ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_user_id_fkey",
        "ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_station_id_fkey",
        "ALTER TABLE stocks DROP CONSTRAINT IF EXISTS stocks_station_id_fkey",
    ]
    with database.engine.begin() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
