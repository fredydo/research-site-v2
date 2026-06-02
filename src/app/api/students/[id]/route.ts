export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { fullName, email, researchLine, yearInit, yearEnd, pictureUrl, active, type, userId } = await req.json()
  const now = new Date().toISOString()
  await pool.query(
    `UPDATE students SET "fullName"=$1, email=$2, "researchLine"=$3, "yearInit"=$4, "yearEnd"=$5,
     "pictureUrl"=$6, active=$7, type=$8, "userId"=$9, updated=$10 WHERE id=$11`,
    [fullName, email, researchLine, yearInit || null, yearEnd || null, pictureUrl || null, active, type, userId || null, now, params.id]
  )
  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM students WHERE id=$1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
