export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, "fullName" AS name, email, biography AS bio, "profilePictureUrl" AS avatar,
            "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine", admin
     FROM "user"
     WHERE email != 'grupogitalab@udea.edu.co'
     ORDER BY "fullName" ASC`
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { fullName, email, password, biography, profilePictureUrl, googleScholarUrl, cvlacUrl, researchInterests, researchLine, admin } = await req.json()
  const hashed = await bcrypt.hash(password || 'Gita2024!', 6)
  const now = new Date().toISOString()

  const { rows } = await pool.query(
    `INSERT INTO "user" ("fullName", email, password, biography, "profilePictureUrl", "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine", admin, created, updated)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
    [fullName, email, hashed, biography || null, profilePictureUrl || null, googleScholarUrl || null, cvlacUrl || null, researchInterests || null, researchLine, admin || false, now]
  )
  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
