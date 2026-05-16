import { Pool } from 'pg'

declare global {
  var pgPool: Pool | undefined
}

// Reuse pool across hot-reloads in development
const pool = global.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool
}

export default pool

// ─── Initialise tables ───────────────────────────────────────
export async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(50)  NOT NULL DEFAULT 'member',
      title       VARCHAR(255),
      bio         TEXT,
      avatar      VARCHAR(500),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS events (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(255) NOT NULL,
      description TEXT         NOT NULL,
      location    VARCHAR(255) NOT NULL,
      start_date  TIMESTAMPTZ  NOT NULL,
      end_date    TIMESTAMPTZ,
      type        VARCHAR(50)  NOT NULL DEFAULT 'other',
      created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)
}
