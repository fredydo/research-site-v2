export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'

const RL_MAP: Record<string, string> = {
  pattern_analysis_and_signal_processing: 'PATTERN ANALYSIS AND SIGNAL PROCESSING',
  communications_systems_modeling:        'COMMUNICATIONS SYSTEMS MODELING',
  optical_communications:                 'OPTICAL COMMUNICATIONS',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('tag') ?? 'pattern_analysis_and_signal_processing'
  const rl  = RL_MAP[tag] ?? RL_MAP['pattern_analysis_and_signal_processing']

  const { rows } = await pool.query(
    `SELECT p.id AS "_id", p.citation, p.year,
            SUBSTRING(p.year, 1, 4) AS "yearShort",
            p."paperUrl", p."bibtexCitation", p."researchLine", p.type,
            COALESCE(p.doi, '') AS doi,
            COALESCE(
              array_agg(pu."userId") FILTER (WHERE pu."userId" IS NOT NULL),
              ARRAY[]::integer[]
            ) AS "userIds"
     FROM publications p
     LEFT JOIN publications_user_user pu ON pu."publicationsId" = p.id
     WHERE UPPER(p."researchLine") = UPPER($1)
     GROUP BY p.id
     ORDER BY p.year DESC, p.id DESC`,
    [rl]
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { citation, year, type, researchLine, paperUrl, bibtexCitation, doi } = await req.json()
  const now = new Date().toISOString()
  // Extract just the year number if a full date was passed
  const yearVal = String(year ?? '').slice(0, 4)
  const { rows } = await pool.query(
    `INSERT INTO publications (citation, year, type, "researchLine", "paperUrl", "bibtexCitation", doi, created, updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id`,
    [citation, yearVal, type || 'JOURNAL ARTICLES', researchLine, paperUrl || null, bibtexCitation || null, doi || null, now]
  )
  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
