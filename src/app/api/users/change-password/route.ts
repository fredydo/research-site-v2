export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import pool from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  if (newPassword.length < 6)
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })

  const { rows } = await pool.query('SELECT password FROM "user" WHERE email = $1 LIMIT 1', [session.user.email])
  if (!rows[0]) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, rows[0].password)
  if (!valid) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })

  const hash = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE "user" SET password=$1, updated=$2 WHERE email=$3', [hash, new Date().toISOString(), session.user.email])

  return NextResponse.json({ message: 'Contraseña actualizada' })
}
