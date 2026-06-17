import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/postgres'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const { rows } = await pool.query(
          'SELECT * FROM people WHERE LOWER(email) = LOWER($1) AND password IS NOT NULL LIMIT 1',
          [credentials.email]
        )
        const user = rows[0]
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return {
          id:    String(user.id),
          name:  user.fullName,
          email: user.email,
          role:  user.admin ? 'admin' : 'member',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.name = user.name
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id
        ;(session.user as any).name = token.name
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
}
