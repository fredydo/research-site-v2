import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'

export const dynamic = 'force-dynamic'

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(500) NOT NULL,
      description TEXT,
      professor   VARCHAR(255),
      semester    VARCHAR(100),
      undergrad   BOOLEAN NOT NULL DEFAULT TRUE,
      file_url    VARCHAR(500),
      link_url    VARCHAR(500),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

export async function GET(req: NextRequest) {
  await ensureTable()
  const undergrad = new URL(req.url).searchParams.get('undergrad')
  const filter = undergrad !== null ? 'WHERE undergrad = $1' : ''
  const params = undergrad !== null ? [undergrad === 'true'] : []
  const { rows } = await pool.query(`SELECT * FROM lectures ${filter} ORDER BY created_at DESC`, params)
  return NextResponse.json({ data: rows })
}
