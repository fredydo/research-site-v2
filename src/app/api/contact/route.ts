export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import pool from '@/lib/db/postgres'

const ContactSchema = z.object({
  name:        z.string().min(3),
  email:       z.string().email(),
  subject:     z.string().optional(),
  description: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, subject, description } = parsed.data

  await pool.query(
    `INSERT INTO contacts (name, email, subject, message, created)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, email, subject || null, description, new Date().toISOString()]
  )

  return NextResponse.json({ message: 'Message received' }, { status: 200 })
}

export async function GET(req: NextRequest) {
  const { rows } = await pool.query(
    `SELECT * FROM contacts ORDER BY created DESC`
  )
  return NextResponse.json({ data: rows })
}
