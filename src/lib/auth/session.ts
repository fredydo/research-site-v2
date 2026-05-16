import { getServerSession } from 'next-auth'
import { authOptions } from './options'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types'

export async function requireAuth(minRole?: UserRole) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  if (minRole) {
    const hierarchy: UserRole[] = ['member', 'editor', 'admin']
    const userLevel    = hierarchy.indexOf((session.user as any).role)
    const requiredLevel = hierarchy.indexOf(minRole)
    if (userLevel < requiredLevel) redirect('/')
  }

  return session
}

export async function getSession() {
  return getServerSession(authOptions)
}
