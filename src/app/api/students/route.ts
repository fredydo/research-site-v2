export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'

const TYPE_MAP: Record<string, string> = {
  phd:           'Ph.D',
  masters:       'Master',
  undergraduate: 'Bachelor',
  alumni:        'Alumni',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type') ?? 'phd'
  const dbType = TYPE_MAP[type] ?? type

  const { rows } = await pool.query(
    `SELECT id, "fullName", email, "researchLine", "yearInit", "yearEnd", "pictureUrl", active, type
     FROM students
     WHERE LOWER(type) = LOWER($1)
     ORDER BY "fullName" ASC`,
    [dbType]
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { fullName, email, researchLine, yearInit, yearEnd, pictureUrl, active, type, userId } = await req.json()
  const now = new Date().toISOString()
  const { rows } = await pool.query(
    `INSERT INTO students ("fullName", email, "researchLine", "yearInit", "yearEnd", "pictureUrl", active, type, "userId", created, updated)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10) RETURNING id`,
    [fullName, email, researchLine, yearInit || null, yearEnd || null, pictureUrl || null, active ?? true, type, userId || null, now]
  )
  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
