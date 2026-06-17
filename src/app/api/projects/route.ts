export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'

const RL_MAP: Record<string, string> = {
  pattern_analysis_and_signal_processing: 'PATTERN ANALYSIS AND SIGNAL PROCESSING',
  communications_systems_modeling: 'COMMUNICATIONS SYSTEMS MODELING',
  optical_communications: 'OPTICAL COMMUNICATIONS',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('researchLine') ?? 'pattern_analysis_and_signal_processing'
  const rl  = RL_MAP[tag] ?? RL_MAP['pattern_analysis_and_signal_processing']

  const { rows } = await pool.query(
    `SELECT pr.id, pr.title, pr.description, pr."dateInit", pr."dateEnd", pr.budget,
            pr."fileUrl", pr."codeId", pr."fundingAgency", pr."researchLine",
            COALESCE(
              array_agg(pp."peopleId") FILTER (WHERE pp."peopleId" IS NOT NULL),
              ARRAY[]::integer[]
            ) AS "userIds"
     FROM projects pr
     LEFT JOIN projects_people pp ON pp."projectsId" = pr.id
     WHERE UPPER(pr."researchLine") = UPPER($1)
     GROUP BY pr.id
     ORDER BY pr.id DESC`,
    [rl]
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, dateInit, dateEnd, budget, fileUrl, codeId, fundingAgency, researchLine, userIds } = await req.json()
  const now = new Date().toISOString()

  const { rows } = await pool.query(
    `INSERT INTO projects (title, description, "dateInit", "dateEnd", budget, "fileUrl", "codeId", "fundingAgency", "researchLine", created, updated)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10) RETURNING id`,
    [title, description, dateInit || null, dateEnd || null, budget ? Number(budget) : null, fileUrl || null, codeId || null, fundingAgency || null, researchLine, now]
  )

  const projectId = rows[0].id

  if (Array.isArray(userIds) && userIds.length > 0) {
    for (const peopleId of userIds) {
      await pool.query(
        'INSERT INTO projects_people ("projectsId", "peopleId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [projectId, peopleId]
      )
    }
  }

  return NextResponse.json({ data: { id: projectId } }, { status: 201 })
}
