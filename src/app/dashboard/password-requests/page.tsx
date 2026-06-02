'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

type Request = {
  id: number; name: string; email: string; read: boolean; created: string
}

export default function PasswordRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    fetch('/api/users/forgot-password').then(r => r.json()).then(({ data }) => {
      setRequests(data || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: number) => {
    await fetch(`/api/users/forgot-password/${id}`, { method: 'PUT' })
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Eliminar esta solicitud?')) return
    await fetch(`/api/users/forgot-password/${id}`, { method: 'DELETE' })
    load()
  }

  const unread = requests.filter(r => !r.read).length

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Solicitudes de contraseña</h1>
          <p>{unread} solicitud{unread !== 1 ? 'es' : ''} sin atender</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/dashboard" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>

        {loading ? (
          <p className="text-muted">Cargando...</p>
        ) : requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
            <p className="text-muted">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map(r => (
              <div key={r.id} style={{
                background: r.read ? 'var(--white)' : 'var(--green-50)',
                border: r.read ? '1px solid var(--color-border)' : '1px solid var(--green-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  {!r.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green-600)', display: 'inline-block', flexShrink: 0 }} />}
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '.1rem' }}>{r.name}</p>
                    <p style={{ fontSize: '.85rem', color: 'var(--green-700)' }}>{r.email}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--gray-400)', marginTop: '.2rem' }}>
                      {format(new Date(r.created), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <Link href="/people"
                    style={{ fontSize: '.75rem', color: '#1e40af', background: '#dbeafe', padding: '4px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 500 }}>
                    🔑 Resetear en Personas
                  </Link>
                  {!r.read && (
                    <button onClick={() => markRead(r.id)}
                      style={{ fontSize: '.75rem', color: 'var(--green-700)', background: 'var(--green-100)', padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      ✓ Atendido
                    </button>
                  )}
                  <button onClick={() => remove(r.id)}
                    style={{ fontSize: '.75rem', color: '#991b1b', background: '#fee2e2', padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
