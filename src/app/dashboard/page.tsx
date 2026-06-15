import { requireAuth } from '@/lib/auth/session'
import pool from '@/lib/db/postgres'
import Link from 'next/link'

async function getStats() {
  try {
    const [{ rows: p }, { rows: pub }, { rows: proj }, { rows: n }] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM people'),
      pool.query('SELECT COUNT(*) FROM publications'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM news'),
    ])
    return {
      people:       parseInt(p[0].count),
      publications: parseInt(pub[0].count),
      projects:     parseInt(proj[0].count),
      news:         parseInt(n[0].count),
    }
  } catch { return { people: 0, publications: 0, projects: 0, news: 0 } }
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const role    = (session.user as any).role as string
  const stats   = await getStats()
  const isAdmin = role === 'admin'

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Dashboard</h1>
          <p>Welcome, {session.user?.name}. Logged in as <strong>{role}</strong>.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Stats */}
        <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'People',       value: stats.people,       href: '/people' },
            { label: 'Publications', value: stats.publications, href: '/publications' },
            { label: 'Projects',     value: stats.projects,     href: '/projects' },
            { label: 'News',         value: stats.news,         href: '/news' },
          ].map(({ label, value, href }) => (
            <Link href={href} key={label} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--green-800)', fontSize: '2.5rem', fontFamily: 'var(--font-news)', fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--color-muted)', marginTop: '.5rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Change password */}
          <div className="card" style={{ border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '.5rem' }}>🔑 Change password</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Update your account password.</p>
            <Link href="/dashboard/change-password" className="btn btn-primary btn-sm">Change password</Link>
          </div>

          {/* Admin panel */}
          {isAdmin && (
            <div className="card" style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)' }}>
              <h3 style={{ marginBottom: '.5rem' }}>Admin panel</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Full access to add, edit and delete content.</p>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link href="/people"                      className="btn btn-primary btn-sm">Manage people</Link>
                <Link href="/publications"                className="btn btn-outline btn-sm">Publications</Link>
                <Link href="/projects"                    className="btn btn-outline btn-sm">Projects</Link>
                <Link href="/news"                        className="btn btn-outline btn-sm">News</Link>
                <Link href="/dashboard/contacts"          className="btn btn-outline btn-sm">📬 Messages</Link>
                <Link href="/dashboard/password-requests" className="btn btn-outline btn-sm">🔑 Password requests</Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Quick actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/publications" className="btn btn-primary">Publications</Link>
            <Link href="/projects"     className="btn btn-primary">Projects</Link>
            <Link href="/people"       className="btn btn-outline">People</Link>
            <Link href="/news"         className="btn btn-outline">News</Link>
          </div>
        </div>
      </div>
    </>
  )
}
