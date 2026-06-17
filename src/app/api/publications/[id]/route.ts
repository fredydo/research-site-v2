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
  const { citation, year, type, researchLine, paperUrl, bibtexCitation, doi, userIds } = await req.json()
  const yearVal = String(year ?? '').slice(0, 4)
  const now = new Date().toISOString()
  await pool.query(
    `UPDATE publications
     SET citation=$1, year=$2, type=$3, "researchLine"=$4,
         "paperUrl"=$5, "bibtexCitation"=$6, doi=$7, updated=$8
     WHERE id=$9`,
    [citation, yearVal, type, researchLine, paperUrl || null, bibtexCitation || null, doi || null, now, params.id]
  )
  // Update people assignments if provided
  if (userIds !== undefined) {
    await pool.query('DELETE FROM publications_people WHERE "publicationsId" = $1', [params.id])
    if (userIds && userIds.length > 0) {
      for (const uid of userIds) {
        await pool.query(
          'INSERT INTO publications_people ("publicationsId", "peopleId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [params.id, uid]
        )
      }
    }
  }
  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM publications WHERE id=$1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
