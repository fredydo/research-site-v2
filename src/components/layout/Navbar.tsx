'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useLang } from '@/lib/i18n/LangContext'

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const { t, lang, toggleLang } = useLang()

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/layout/logoGITA.png" alt="GITA logo" style={{ height: '40px', width: 'auto' }} />
            <span>
              <span className="navbar-brand-name">GITA</span>
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
            <button
              onClick={toggleLang}
              className="btn btn-ghost btn-sm"
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              style={{ fontWeight: 600, fontSize: '.8rem', letterSpacing: '.05em', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--radius)', padding: '.25rem .6rem', minWidth: '42px' }}
            >
              {lang === 'es' ? '🇬🇧 EN' : '🇨🇴 ES'}
            </button>

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
