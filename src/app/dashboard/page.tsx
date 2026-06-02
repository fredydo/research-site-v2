import { requireAuth } from '@/lib/auth/session'
import pool from '@/lib/db/postgres'
import Link from 'next/link'

async function getStats() {
  try {
    const [{ rows: u }, { rows: p }, { rows: s }, { rows: n }] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "user"'),
      pool.query('SELECT COUNT(*) FROM publications'),
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM news'),
    ])
    return { users: parseInt(u[0].count), publications: parseInt(p[0].count), students: parseInt(s[0].count), news: parseInt(n[0].count) }
  } catch { return { users: 0, publications: 0, students: 0, news: 0 } }
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
          <p>Bienvenido, {session.user?.name}. Sesión iniciada como <strong>{role}</strong>.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'Miembros',      value: stats.users,        href: '/people' },
            { label: 'Publicaciones', value: stats.publications,  href: '/publications' },
            { label: 'Estudiantes',   value: stats.students,      href: '/people' },
            { label: 'Noticias',      value: stats.news,          href: '/news' },
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
          {/* Change password card */}
          <div className="card" style={{ border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '.5rem' }}>🔑 Cambiar contraseña</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Actualiza tu contraseña de acceso.</p>
            <Link href="/dashboard/change-password" className="btn btn-primary btn-sm">Cambiar contraseña</Link>
          </div>

          {/* Admin panel */}
          {isAdmin && (
            <div className="card" style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)' }}>
              <h3 style={{ marginBottom: '.5rem' }}>Panel de administrador</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Acceso completo para agregar, editar y eliminar contenido.</p>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link href="/people"            className="btn btn-primary btn-sm">Gestionar personas</Link>
              <Link href="/dashboard/contacts"          className="btn btn-outline btn-sm">📬 Ver mensajes</Link>
              <Link href="/dashboard/password-requests" className="btn btn-outline btn-sm">🔑 Solicitudes contraseña</Link>
                <Link href="/publications" className="btn btn-outline btn-sm">Publicaciones</Link>
                <Link href="/news"         className="btn btn-outline btn-sm">Noticias</Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Acciones rápidas</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/publications" className="btn btn-primary">Publicaciones</Link>
            <Link href="/projects"     className="btn btn-primary">Proyectos</Link>
            <Link href="/people"       className="btn btn-outline">Personas</Link>
          </div>
        </div>
      </div>
    </>
  )
}
