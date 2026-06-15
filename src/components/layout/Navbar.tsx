'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useLang } from '@/lib/i18n/LangContext'

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const { t } = useLang()

  const NAV_LINKS = [
    { href: '/',             label: t.nav.home },
    { href: '/people',       label: t.nav.people },
    { href: '/projects',     label: t.nav.projects },
    { href: '/publications', label: t.nav.publications },
    { href: '/contact',      label: t.nav.contact },
  ]

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/layout/logoGITA.png" alt="GITA logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span>
              <span className="navbar-brand-name">Grupo de Investigación en Telecomunicaciones Aplicadas</span>
              <span className="navbar-brand-sub">Universidad de Antioquia</span>
            </span>
          </Link>

          <ul className="navbar-links">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={pathname === href ? 'active' : ''}>{label}</Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">

            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-accent btn-sm">{t.nav.dashboard}</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-ghost btn-sm">{t.nav.logout}</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-accent btn-sm">{t.nav.login}</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
