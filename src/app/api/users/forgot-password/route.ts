export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/postgres'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 })

  // Check user exists
  const { rows } = await pool.query(
    'SELECT "fullName", email FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  )
  if (!rows[0]) return NextResponse.json({ error: 'no_user' }, { status: 404 })

  const user = rows[0]

  // Try to send email with 8 second timeout
  const emailPromise = async () => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      auth: {
        user: process.env.EMAIL_SERVICE,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"GITA Website" <${process.env.EMAIL_SERVICE}>`,
      to:   'grupogitalab@udea.edu.co',
      subject: '[GITA] Solicitud de restablecimiento de contraseña',
      html: `
        <h2>Solicitud de restablecimiento de contraseña</h2>
        <p>El usuario <strong>${user.fullName}</strong> (${user.email}) ha solicitado restablecer su contraseña.</p>
        <p>Por favor inicia sesión como administrador y actualiza su contraseña en la sección <strong>Personas</strong>.</p>
        <br/>
        <a href="${process.env.NEXTAUTH_URL}/login" style="background:#1a3a2a;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">
          Ir al sitio
        </a>
      `,
    })

    await transporter.sendMail({
      from: `"GITA Website" <${process.env.EMAIL_SERVICE}>`,
      to:   user.email,
      subject: '[GITA] Solicitud recibida',
      html: `
        <h2>Solicitud recibida</h2>
        <p>Hola <strong>${user.fullName}</strong>,</p>
        <p>Hemos notificado al administrador sobre tu solicitud de restablecimiento de contraseña.</p>
        <p>Te contactarán pronto con tus nuevas credenciales.</p>
        <p>— El equipo GITA</p>
      `,
    })
  }

  // Race against a timeout
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 10000)
  )

  try {
    await Promise.race([emailPromise(), timeout])
    return NextResponse.json({ message: 'ok' })
  } catch (err: any) {
    console.error('Forgot password email error:', err?.message)
    // Still succeed from the user's perspective — admin can reset manually
    // But return a specific code so frontend can show appropriate message
    if (err?.message === 'timeout') {
      return NextResponse.json({ message: 'ok', warn: 'email_timeout' })
    }
    return NextResponse.json({ message: 'ok', warn: 'email_failed' })
  }
}
