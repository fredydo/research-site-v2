export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const { rows: users } = await pool.query(
      `SELECT id, "fullName", email, biography, "profilePictureUrl",
              "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine", admin,
              "fullName" AS name,
              "fullName" AS name
       FROM "user" WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (!users[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { rows: publications } = await pool.query(
      `SELECT p.id AS "_id", p.citation, p.year, p.type, p."paperUrl",
              SUBSTRING(p.year, 1, 4) AS "yearShort"
       FROM publications p
       INNER JOIN publications_user_user pu ON pu."publicationsId" = p.id
       WHERE pu."userId" = $1
       ORDER BY p.year DESC`,
      [id]
    )

    const { rows: projects } = await pool.query(
      `SELECT pr.id, pr.title, pr."dateInit", pr."dateEnd", pr."fundingAgency", pr."codeId"
       FROM projects pr
       INNER JOIN projects_user_user pu ON pu."projectsId" = pr.id
       WHERE pu."userId" = $1
       ORDER BY pr.id DESC`,
      [id]
    )

    const { rows: students } = await pool.query(
      `SELECT id, "fullName", email, type, "yearInit", "yearEnd", "pictureUrl", active
       FROM students
       WHERE "userId" = $1
       ORDER BY type, "fullName"`,
      [id]
    )

    return NextResponse.json({
      data: {
        professor: users[0],
        publications,
        projects,
        students,
        stats: {
          publications: publications.length,
          projects:     projects.length,
          students:     students.length,
        }
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
