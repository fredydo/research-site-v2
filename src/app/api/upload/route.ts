export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { writeFile, mkdir, access } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/'))
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })

    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const ext      = path.extname(file.name).toLowerCase() || '.jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'people')

    // Create dir if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, safeName), buffer)

    return NextResponse.json({ url: `/images/people/${safeName}` }, { status: 201 })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: `Upload failed: ${err.message}` },
      { status: 500 }
    )
  }
}
