'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

export default function ForgotPasswordPage() {
  const { t } = useLang()
  const f = t.forgot
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) { setMessage(f.err_required); setStatus('error'); return }
    setStatus('loading'); setMessage('')

    try {
      const res  = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.status === 404) {
        setMessage(f.err_notfound); setStatus('error'); return
      }
      // Treat any 2xx (even with warn) as success
      if (res.ok) { setStatus('success'); return }

      setMessage(f.err_generic); setStatus('error')
    } catch {
      setMessage(f.err_generic); setStatus('error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{f.title}</h1>
          <p>{f.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '480px' }}>
        <div className="card">
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h3 style={{ marginBottom: '.75rem' }}>{f.success_title}</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{f.success_msg}</p>
              <Link href="/login" className="btn btn-primary">{f.back_login}</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>{f.email_note}</p>

              <div className="form-group">
                <label>{f.email_label}</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={f.email_placeholder}
                  disabled={status === 'loading'}
                />
              </div>

              {message && (
                <div style={{ padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem', background: '#fee2e2', color: '#991b1b', fontSize: '.875rem' }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/login" className="text-sm" style={{ color: 'var(--color-muted)' }}>{f.back}</Link>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={status === 'loading'}>
                  {status === 'loading' ? f.submitting : f.submit}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
