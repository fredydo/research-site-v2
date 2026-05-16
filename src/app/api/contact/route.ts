import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

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

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVICE,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"GITA Website" <${process.env.EMAIL_SERVICE}>`,
      to:   'grupogitalab@udea.edu.co',
      replyTo: email,
      subject: subject ? `[GITA Contact] ${subject}` : '[GITA Contact] New message',
      html: `
        <h2>New contact form submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${description.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({ message: 'Message sent' }, { status: 200 })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
