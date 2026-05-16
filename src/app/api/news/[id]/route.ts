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
  const { title, content, pictureUrl, documentUrl } = await req.json()
  const now = new Date().toISOString()
  await pool.query(
    `UPDATE news SET title=$1, description=$2, "pictureUrl"=$3, "documentUrl"=$4, updated=$5 WHERE id=$6`,
    [title, content, pictureUrl || null, documentUrl || null, now, params.id]
  )
  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM news WHERE id=$1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
