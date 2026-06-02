'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

type Contact = {
  id: number; name: string; email: string
  subject?: string; message: string; read: boolean; created: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    fetch('/api/contact').then(r => r.json()).then(({ data }) => {
      setContacts(data || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: number) => {
    await fetch(`/api/contact/${id}`, { method: 'PUT' })
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este mensaje?')) return
    await fetch(`/api/contact/${id}`, { method: 'DELETE' })
    load()
  }

  const unread = contacts.filter(c => !c.read).length

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Mensajes de contacto</h1>
          <p>{unread} mensaje{unread !== 1 ? 's' : ''} sin leer</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/dashboard" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>

        {loading ? (
          <p className="text-muted">Cargando mensajes…</p>
        ) : contacts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p className="text-muted">No hay mensajes aún.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contacts.map(c => (
              <div key={c.id} style={{
                background: c.read ? 'var(--white)' : 'var(--green-50)',
                border: `1px solid ${c.read ? 'var(--color-border)' : 'var(--green-200)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      {!c.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green-600)', display: 'inline-block' }} />}
                      <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                      <a href={`mailto:${c.email}`} style={{ fontSize: '.85rem', color: 'var(--green-700)' }}>{c.email}</a>
                    </div>
                    {c.subject && <p style={{ fontSize: '.85rem', color: 'var(--gray-600)', marginTop: '.2rem' }}><strong>Asunto:</strong> {c.subject}</p>}
                  </div>
                  <span style={{ fontSize: '.75rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    {format(new Date(c.created), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>

                <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--gray-700)', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                  {c.message}
                </p>

                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <a href={`mailto:${c.email}?subject=Re: ${c.subject || 'Tu mensaje a GITA'}`}
                    className="btn btn-primary btn-sm">
                    ✉️ Responder
                  </a>
                  {!c.read && (
                    <button onClick={() => markRead(c.id)}
                      style={{ fontSize: '.75rem', color: 'var(--green-700)', background: 'var(--green-100)', padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      ✓ Marcar como leído
                    </button>
                  )}
                  <button onClick={() => remove(c.id)}
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
