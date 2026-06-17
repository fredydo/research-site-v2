export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  try {
    const { rows: users } = await pool.query(
      `SELECT id, "fullName", "fullName" AS name, email, biography, "profilePictureUrl",
              "googleScholarUrl", "cvlacUrl", "researchInterests", "researchLine", admin
       FROM people WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (!users[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { rows: publications } = await pool.query(
      `SELECT p.id AS "_id", p.citation, p.year, p.type, p."paperUrl",
              p."bibtexCitation", p.doi, p."researchLine",
              SUBSTRING(p.year, 1, 4) AS "yearShort",
              COALESCE(
                (SELECT array_agg(pp2."peopleId") FROM publications_people pp2 WHERE pp2."publicationsId" = p.id),
                ARRAY[]::integer[]
              ) AS "userIds"
       FROM publications p
       INNER JOIN publications_people pp ON pp."publicationsId" = p.id
       WHERE pp."peopleId" = $1
       ORDER BY p.year DESC`,
      [id]
    )

    const { rows: projects } = await pool.query(
      `SELECT pr.id, pr.title, pr.description, pr."dateInit", pr."dateEnd", pr.budget,
              pr."fileUrl", pr."codeId", pr."fundingAgency", pr."researchLine",
              COALESCE(
                (SELECT array_agg(pp2."peopleId") FROM projects_people pp2 WHERE pp2."projectsId" = pr.id),
                ARRAY[]::integer[]
              ) AS "userIds"
       FROM projects pr
       INNER JOIN projects_people pp ON pp."projectsId" = pr.id
       WHERE pp."peopleId" = $1
       ORDER BY pr.id DESC`,
      [id]
    )

    // All research lines this person explicitly belongs to
    const { rows: rlRows } = await pool.query(
      `SELECT "researchLine" FROM people_research_lines WHERE "peopleId" = $1 ORDER BY "researchLine"`,
      [id]
    )
    const researchLines = rlRows.map(r => r.researchLine)

    const { rows: students } = await pool.query(
      `SELECT p.id, p."fullName", p.email, p."yearInit", p."yearEnd",
              p."profilePictureUrl" AS "pictureUrl", p.active,
              COALESCE(
                (SELECT role FROM people_roles 
                 WHERE "peopleId" = p.id 
                 AND role IN ('phd','master','undergraduate','alumni','member')
                 ORDER BY CASE role 
                   WHEN 'phd' THEN 1 WHEN 'master' THEN 2 
                   WHEN 'undergraduate' THEN 3 WHEN 'alumni' THEN 4 
                   ELSE 5 END
                 LIMIT 1),
                'member'
              ) AS type
       FROM people p
       WHERE p."supervisorId" = $1
       ORDER BY p."fullName"`,
      [id]
    )

    return NextResponse.json({
      data: {
        professor: users[0],
        publications,
        projects,
        students,
        researchLines,
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
