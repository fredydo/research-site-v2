export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'

export async function GET() {
  const { rows } = await pool.query(
    `SELECT n.id, n.title, n.description AS content, n."pictureUrl" AS "imageUrl",
            n."documentUrl", n.created AS "createdAt", u."fullName" AS author
     FROM news n LEFT JOIN "user" u ON u.id = n."userId"
     ORDER BY n.created DESC`
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, content, pictureUrl, documentUrl } = await req.json()
  const now = new Date().toISOString()
  const userId = (session.user as any).id

  const { rows } = await pool.query(
    `INSERT INTO news (title, description, "pictureUrl", "documentUrl", "userId", created, updated)
     VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
    [title, content, pictureUrl || null, documentUrl || null, userId, now]
  )
  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
