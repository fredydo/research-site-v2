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
    `SELECT id, title, description, "dateInit", "dateEnd", budget,
            "fileUrl", "codeId", "fundingAgency", "researchLine"
     FROM projects WHERE UPPER("researchLine") = UPPER($1) ORDER BY id DESC`,
    [rl]
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, dateInit, dateEnd, budget, fileUrl, codeId, fundingAgency, researchLine } = await req.json()
  const now = new Date().toISOString()

  const { rows } = await pool.query(
    `INSERT INTO projects (title, description, "dateInit", "dateEnd", budget, "fileUrl", "codeId", "fundingAgency", "researchLine", created, updated)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10) RETURNING id`,
    [title, description, dateInit || null, dateEnd || null, budget ? Number(budget) : null, fileUrl || null, codeId || null, fundingAgency || null, researchLine, now]
  )
  return NextResponse.json({ data: rows[0] }, { status: 201 })
}
