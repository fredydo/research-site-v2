export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    // Get professor from people table
    const { rows: users } = await pool.query(
      `SELECT id, "fullName", "fullName" AS name, email, biography, "profilePictureUrl",
              "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine", admin
       FROM people WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (!users[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Get publications via new junction table
    const { rows: publications } = await pool.query(
      `SELECT p.id AS "_id", p.citation, p.year, p.type, p."paperUrl",
              SUBSTRING(p.year, 1, 4) AS "yearShort"
       FROM publications p
       INNER JOIN publications_people pp ON pp."publicationsId" = p.id
       WHERE pp."peopleId" = $1
       ORDER BY p.year DESC`,
      [id]
    )

    // Get projects via new junction table
    const { rows: projects } = await pool.query(
      `SELECT pr.id, pr.title, pr."dateInit", pr."dateEnd", pr."fundingAgency", pr."codeId"
       FROM projects pr
       INNER JOIN projects_people pp ON pp."projectsId" = pr.id
       WHERE pp."peopleId" = $1
       ORDER BY pr.id DESC`,
      [id]
    )

    // Get students supervised by this person
    const { rows: students } = await pool.query(
      `SELECT p.id, p."fullName", p.email, p."yearInit", p."yearEnd",
              p."profilePictureUrl" AS "pictureUrl", p.active,
              string_agg(pr.role, ', ' ORDER BY pr.role) AS type
       FROM people p
       LEFT JOIN people_roles pr ON pr."peopleId" = p.id
       WHERE p."supervisorId" = $1
       GROUP BY p.id
       ORDER BY p."fullName"`,
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
