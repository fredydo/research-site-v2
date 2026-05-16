'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const { t } = useLang()
  const cp = t.change_pw
  const [form, setForm]     = useState({ current: '', newPass: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!form.current || !form.newPass || !form.confirm) {
      setMessage(cp.err_fields); setStatus('error'); return
    }
    if (form.newPass !== form.confirm) {
      setMessage(cp.err_match); setStatus('error'); return
    }
    if (form.newPass.length < 6) {
      setMessage(cp.err_length); setStatus('error'); return
    }

    setStatus('loading'); setMessage('')
    try {
      const res  = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success'); setMessage(cp.success)
        setForm({ current: '', newPass: '', confirm: '' })
      } else {
        setStatus('error')
        setMessage(data.error === 'La contraseña actual es incorrecta' ? cp.err_wrong : (data.error || cp.err_generic))
      }
    } catch {
      setStatus('error'); setMessage(cp.err_generic)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{cp.title}</h1>
          <p>{cp.subtitle} {session?.user?.name && `— ${session.user.name}`}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '480px' }}>
        <div className="card">
          {(['current', 'newPass', 'confirm'] as const).map(field => (
            <div className="form-group" key={field}>
              <label>
                {field === 'current' ? cp.current : field === 'newPass' ? cp.new_pass : cp.confirm}
              </label>
              <input
                type="password"
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                disabled={status === 'loading'}
              />
            </div>
          ))}

          {message && (
            <div style={{
              padding: '.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem',
              background: status === 'success' ? '#d1fae5' : '#fee2e2',
              color:      status === 'success' ? '#065f46'  : '#991b1b',
              fontSize: '.875rem',
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/dashboard" className="btn btn-outline">{cp.cancel}</Link>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={status === 'loading'}>
              {status === 'loading' ? cp.submitting : cp.submit}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
