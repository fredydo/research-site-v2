export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') // filter by role

  const { rows } = await pool.query(
    `SELECT p.id, p."fullName", p.email, p.biography, p."profilePictureUrl",
            p."googleScholarUrl", p."cvlacUrl", p."researchInterests",
            p."researchLine", p."yearInit", p."yearEnd", p.active,
            p.admin, p."isPublic", p."supervisorId",
            COALESCE(
              array_agg(DISTINCT pr.role ORDER BY pr.role) FILTER (WHERE pr.role IS NOT NULL),
              ARRAY[]::text[]
            ) AS roles,
            sup."fullName" AS "supervisorName",
            COUNT(DISTINCT pp."publicationsId") AS "publicationCount"
     FROM people p
     LEFT JOIN people_roles pr ON pr."peopleId" = p.id
     LEFT JOIN people sup ON sup.id = p."supervisorId"
     LEFT JOIN publications_people pp ON pp."peopleId" = p.id
     ${role ? `WHERE EXISTS (SELECT 1 FROM people_roles WHERE "peopleId" = p.id AND role = $1)` : ''}
     GROUP BY p.id, sup."fullName"
     ORDER BY ${role === 'professor' ? '"publicationCount" DESC,' : ''} p."fullName" ASC`,
    role ? [role] : []
  )
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const {
    fullName, email, password, biography, profilePictureUrl,
    googleScholarUrl, cvlacUrl, researchInterests, researchLine,
    yearInit, yearEnd, active, admin, isPublic, supervisorId, roles
  } = await req.json()

  if (!fullName)
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  // Check duplicate
  if (email) {
    const existing = await pool.query('SELECT id FROM people WHERE LOWER(email) = LOWER($1)', [email])
    if (existing.rows.length > 0)
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const hashed = password ? await bcrypt.hash(password, 10) : null

  const { rows } = await pool.query(
    `INSERT INTO people (
      "fullName", email, password, biography, "profilePictureUrl",
      "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine",
      "yearInit", "yearEnd", active, admin, "isPublic", "supervisorId",
      created, updated
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16)
    RETURNING id`,
    [
      fullName, email, hashed, biography || null, profilePictureUrl || null,
      googleScholarUrl || null, cvlacUrl || null, researchInterests || null,
      researchLine, yearInit || null, yearEnd || null,
      active !== false, admin || false, isPublic !== false,
      supervisorId || null, now
    ]
  )

  const personId = rows[0].id

  // Insert roles
  if (roles && roles.length > 0) {
    for (const role of roles) {
      await pool.query(
        'INSERT INTO people_roles ("peopleId", role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [personId, role]
      )
    }
  }

  return NextResponse.json({ data: { id: personId } }, { status: 201 })
}
