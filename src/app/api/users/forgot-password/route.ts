export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 })
  const { rows } = await pool.query(
    'SELECT "fullName", email FROM people WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  )
  if (!rows[0]) return NextResponse.json({ error: 'no_user' }, { status: 404 })
  await pool.query(
    'INSERT INTO password_requests (name, email, created) VALUES ($1, $2, $3)',
    [rows[0].fullName, rows[0].email, new Date().toISOString()]
  )
  return NextResponse.json({ message: 'ok' })
}

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM password_requests ORDER BY created DESC'
  )
  return NextResponse.json({ data: rows })
}
