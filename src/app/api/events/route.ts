import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const EventSchema = z.object({
  title:       z.string().min(3).max(255),
  description: z.string().min(10),
  location:    z.string().min(2),
  startDate:   z.string().datetime(),
  endDate:     z.string().datetime().optional(),
  type:        z.enum(['seminar', 'conference', 'workshop', 'other']).default('other'),
})

// GET /api/events — public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const upcoming = searchParams.get('upcoming') === 'true'

  const query = upcoming
    ? 'SELECT * FROM events WHERE start_date >= NOW() ORDER BY start_date ASC'
    : 'SELECT * FROM events ORDER BY start_date DESC'

  const { rows } = await pool.query(query)
  return NextResponse.json({ data: rows })
}

// POST /api/events — editor or admin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  if (!['editor', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = EventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { title, description, location, startDate, endDate, type } = parsed.data
  const userId = (session.user as any).id

  const { rows } = await pool.query(
    `INSERT INTO events (title, description, location, start_date, end_date, type, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description, location, startDate, endDate ?? null, type, userId]
  )

  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
