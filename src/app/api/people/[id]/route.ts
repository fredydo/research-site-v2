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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    `SELECT p.*, 
            COALESCE(
              array_agg(DISTINCT pr.role) FILTER (WHERE pr.role IS NOT NULL),
              ARRAY[]::text[]
            ) AS roles,
            COALESCE(
              (SELECT array_agg("researchLine" ORDER BY "researchLine") FROM people_research_lines WHERE "peopleId" = p.id),
              ARRAY[]::text[]
            ) AS "researchLines",
            sup."fullName" AS "supervisorName"
     FROM people p
     LEFT JOIN people_roles pr ON pr."peopleId" = p.id
     LEFT JOIN people sup ON sup.id = p."supervisorId"
     WHERE p.id = $1
     GROUP BY p.id, sup."fullName"`,
    [params.id]
  )
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: rows[0] })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const {
    fullName, email, password, biography, profilePictureUrl,
    googleScholarUrl, cvlacUrl, researchInterests, researchLine,
    yearInit, yearEnd, active, admin, isPublic, supervisorId, roles, researchLines
  } = await req.json()

  const now = new Date().toISOString()

  if (password) {
    const hashed = await bcrypt.hash(password, 10)
    await pool.query(
      `UPDATE people SET "fullName"=$1, email=$2, password=$3, biography=$4,
       "profilePictureUrl"=$5, "googleScholarUrl"=$6, "cvlacUrl"=$7,
       "researchInterests"=$8, "researchLine"=$9, "yearInit"=$10, "yearEnd"=$11,
       active=$12, admin=$13, "isPublic"=$14, "supervisorId"=$15, updated=$16
       WHERE id=$17`,
      [fullName, email, hashed, biography || null, profilePictureUrl || null,
       googleScholarUrl || null, cvlacUrl || null, researchInterests || null,
       researchLine, yearInit || null, yearEnd || null,
       active !== false, admin || false, isPublic !== false,
       supervisorId || null, now, params.id]
    )
  } else {
    await pool.query(
      `UPDATE people SET "fullName"=$1, email=$2, biography=$3,
       "profilePictureUrl"=$4, "googleScholarUrl"=$5, "cvlacUrl"=$6,
       "researchInterests"=$7, "researchLine"=$8, "yearInit"=$9, "yearEnd"=$10,
       active=$11, admin=$12, "isPublic"=$13, "supervisorId"=$14, updated=$15
       WHERE id=$16`,
      [fullName, email, biography || null, profilePictureUrl || null,
       googleScholarUrl || null, cvlacUrl || null, researchInterests || null,
       researchLine, yearInit || null, yearEnd || null,
       active !== false, admin || false, isPublic !== false,
       supervisorId || null, now, params.id]
    )
  }

  // Update roles
  if (roles !== undefined) {
    await pool.query('DELETE FROM people_roles WHERE "peopleId" = $1', [params.id])
    for (const role of roles) {
      await pool.query(
        'INSERT INTO people_roles ("peopleId", role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [params.id, role]
      )
    }
  // Update research lines
  if (researchLines !== undefined) {
    await pool.query('DELETE FROM people_research_lines WHERE "peopleId" = $1', [params.id])
    for (const rl of researchLines) {
      await pool.query(
        'INSERT INTO people_research_lines ("peopleId", "researchLine") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [params.id, rl]
      )
    }
  }
  }

  return NextResponse.json({ message: 'Updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await pool.query('DELETE FROM people WHERE id = $1', [params.id])
  return NextResponse.json({ message: 'Deleted' })
}
