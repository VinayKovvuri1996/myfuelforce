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
        """
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            dealer_id VARCHAR NOT NULL REFERENCES users(id),
            first_name VARCHAR NOT NULL,
            last_name VARCHAR NOT NULL,
            contact_number VARCHAR,
            date_of_joining DATE,
            address TEXT,
            role VARCHAR NOT NULL DEFAULT 'Helper',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        )
        """,
        "CREATE INDEX IF NOT EXISTS ix_employees_dealer_id ON employees (dealer_id)",
        "ALTER TABLE shifts ADD COLUMN IF NOT EXISTS employee_id INTEGER",
        """
        DO $$ BEGIN
            ALTER TABLE shifts
                ADD CONSTRAINT shifts_employee_id_fkey
                FOREIGN KEY (employee_id) REFERENCES employees(id);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
        """,
        "CREATE INDEX IF NOT EXISTS ix_shifts_employee_id ON shifts (employee_id)",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS bill_number VARCHAR",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS bill_date DATE",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS supervisor_signed VARCHAR",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS bill_made_by VARCHAR",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS advance_cash FLOAT DEFAULT 0",
        "ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_mode VARCHAR DEFAULT 'Credit'",
        "CREATE INDEX IF NOT EXISTS ix_sales_bill_number ON sales (bill_number)",
    ]
    with database.engine.begin() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
