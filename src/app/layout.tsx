import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import Navbar from '@/components/layout/Navbar'
import SessionProvider from '@/components/layout/SessionProvider'
import { LangProvider } from '@/lib/i18n/LangContext'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'GITA Research Group', template: '%s | GITA' },
  description: 'Grupo de investigación GITA — Universidad de Antioquia.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <LangProvider>
            <Navbar session={session} />
            <main>{children}</main>
            <Footer />
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
