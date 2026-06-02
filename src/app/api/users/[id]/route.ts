export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { fullName, email, password, biography, profilePictureUrl, googleScholarUrl, cvlacUrl, researchInterests, researchLine, admin, isProfessor } = await req.json()
  const now = new Date().toISOString()

  if (password) {
    const hashed = await bcrypt.hash(password, 10)
    await pool.query(
      `UPDATE "user" SET "fullName"=$1, email=$2, password=$3, biography=$4, "profilePictureUrl"=$5,
       "googleScholarUrl"=$6, "cvlacUrl"=$7, "researchInterests"=$8, "researchLine"=$9,
       admin=$10, "isProfessor"=$11, updated=$12
       WHERE id=$13`,
      [fullName, email, hashed, biography || null, profilePictureUrl || null,
       googleScholarUrl || null, cvlacUrl || null, researchInterests || null,
       researchLine, admin, isProfessor !== false, now, params.id]
    )
  } else {
    await pool.query(
      `UPDATE "user" SET "fullName"=$1, email=$2, biography=$3, "profilePictureUrl"=$4,
       "googleScholarUrl"=$5, "cvlacUrl"=$6, "researchInterests"=$7, "researchLine"=$8,
       admin=$9, "isProfessor"=$10, updated=$11
       WHERE id=$12`,
      [fullName, email, biography || null, profilePictureUrl || null,
       googleScholarUrl || null, cvlacUrl || null, researchInterests || null,
       researchLine, admin, isProfessor !== false, now, params.id]
    )
  }
  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM "user" WHERE id=$1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
