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
  const { title, description, dateInit, dateEnd, budget, fileUrl, codeId, fundingAgency, researchLine, userIds } = await req.json()
  const now = new Date().toISOString()
  await pool.query(
    `UPDATE projects SET title=$1, description=$2, "dateInit"=$3, "dateEnd"=$4, budget=$5,
     "fileUrl"=$6, "codeId"=$7, "fundingAgency"=$8, "researchLine"=$9, updated=$10 WHERE id=$11`,
    [title, description, dateInit || null, dateEnd || null, budget ? Number(budget) : null, fileUrl || null, codeId || null, fundingAgency || null, researchLine, now, params.id]
  )
  if (userIds !== undefined) {
    await pool.query('DELETE FROM projects_user_user WHERE "projectsId" = $1', [params.id])
    if (userIds && userIds.length > 0) {
      for (const uid of userIds) {
        await pool.query(
          'INSERT INTO projects_user_user ("projectsId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [params.id, uid]
        )
      }
    }
  }
  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM projects WHERE id=$1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
