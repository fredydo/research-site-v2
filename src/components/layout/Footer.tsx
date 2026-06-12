'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

const PARTNERS = [
  { href: 'https://www.gna.org.co/',              img: '/images/home/udea-gna.svg',    alt: 'UdeA GNA' },
  { href: 'https://www5.cs.fau.de/',              img: '/images/home/prl_logo.png',    alt: 'Pattern Recognition Lab' },
  { href: 'https://www.clsp.jhu.edu/',            img: '/images/home/mc-learning.png', alt: 'Machine Learning & Data Analytics' },
  { href: 'https://research.ibm.com/',            img: '/images/home/IBM_logo.svg',    alt: 'IBM Research' },
  { href: 'https://www.imec-int.com/en',          img: '/images/home/imec-logo.svg',   alt: 'imec' },
  { href: 'https://www.mackenzie.br/mackgraphe/', img: '/images/home/MackGraphe.png',  alt: 'MackGraphe' },
]

const NAV_HREFS = ['/', '/people', '/projects', '/publications', '/lectures', '/news', '/contact']

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
)

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const socialStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '36px', height: '36px', borderRadius: '50%',
  background: 'rgba(255,255,255,.1)', color: '#fff',
  transition: 'background .2s', textDecoration: 'none',
}

export default function Footer() {
  const { t } = useLang()
  const NAV_LABELS = [t.nav.home, t.nav.people, t.nav.projects, t.nav.publications, t.nav.lectures, t.nav.news, t.nav.contact]

  return (
    <footer style={{ padding: 0, marginTop: 0 }}>

      {/* Partners strip */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '2.5rem 1.5rem' }}>
        <p style={{ textAlign: 'center', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '1.75rem' }}>
          Partners &amp; Collaborators
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', maxWidth: '1080px', margin: '0 auto' }}>
          {PARTNERS.map(({ href, img, alt }, i) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '180px', height: '110px', padding: '0 1.5rem', borderRight: i < PARTNERS.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'transform .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={alt} style={{ maxWidth: '100%', maxHeight: '72px', objectFit: 'contain' }} />
            </a>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div style={{ background: 'var(--green-900, #1a3a2a)', padding: '3rem 1.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/layout/logoGITA.png" alt="GITA" style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fff', padding: '4px' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-news)' }}>GITA</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.82rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                GITA research group<br />
                Universidad de Antioquia<br />
                Street 67 No. 53-108 Of. 18-310<br />
                Medellín, Antioquia — Colombia
              </p>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <a href="https://twitter.com/gitaudea1" target="_blank" rel="noopener noreferrer" title="X (Twitter)" style={socialStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#000' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}>
                  <IconX />
                </a>
                <a href="https://www.instagram.com/gitalabudea/" target="_blank" rel="noopener noreferrer" title="Instagram" style={socialStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e1306c' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}>
                  <IconInstagram />
                </a>
                <a href="https://gita.udea.edu.co/" target="_blank" rel="noopener noreferrer" title="Website" style={socialStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--green-700)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}>
                  <IconGlobe />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '1.25rem', fontWeight: 700 }}>
                {t.footer.navigation}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {NAV_HREFS.map((href, i) => (
                  <Link key={href} href={href}
                    style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-300, #86efac)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}>
                    {NAV_LABELS[i]}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '1.25rem', fontWeight: 700 }}>
                {t.footer.contact}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/layout/logo-udea.png" alt="UdeA" style={{ height: '100px', marginBottom: '1.25rem', filter: 'brightness(0) invert(1) opacity(1)' }} />
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.82rem', lineHeight: 1.9, marginBottom: '.5rem' }}>
                +57 4 2198523
              </p>
              <a href="https://twitter.com/gitaudea1" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--green-300, #86efac)', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.35rem', textDecoration: 'none' }}>
                <IconX /> @gitaudea1
              </a>
              <a href="https://www.instagram.com/gitalabudea/" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--green-300, #86efac)', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.4rem', textDecoration: 'none' }}>
                <IconInstagram /> @gitalabudea
              </a>
            </div>

          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.78rem' }}>
              © {new Date().getFullYear()} GITA — Universidad de Antioquia. {t.footer.rights}
            </p>
            <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.78rem' }}>{t.footer.recognized}</p>
          </div>
        </div>
      </div>

    </footer>
  )
}
