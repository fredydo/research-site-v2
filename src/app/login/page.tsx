'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router   = useRouter()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await signIn('credentials', {
        email:    form.get('email') as string,
        password: form.get('password') as string,
        redirect: false,
      })
      if (res?.ok && !res?.error) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Invalid email or password.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/layout/logoGITA.png" alt="GITA" style={{ height: '80px', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--green-800)' }}>Log in</h2>
          <p className="text-sm text-muted">Access the GITA research group dashboard</p>
        </div>
        {error && (
          <div style={{ background: 'var(--color-danger-lt)', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{ color: 'var(--green-800)', fontWeight: 600 }}>Email Address</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="e.g. researcher@udea.edu.co"
              style={{ fontSize: '1rem', padding: '.6rem 0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: '1px solid var(--gray-300)', borderRadius: 0, boxShadow: 'none' }}
            />
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
              <label htmlFor="password" style={{ color: 'var(--green-800)', fontWeight: 600, margin: 0 }}>Password</label>
              <a href="/forgot-password" style={{ fontSize: '.8rem', color: 'var(--green-700)' }}>Forgot your password?</a>
            </div>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              placeholder="Enter your password"
              style={{ fontSize: '1rem', padding: '.6rem 0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: '1px solid var(--gray-300)', borderRadius: 0, boxShadow: 'none' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '.75rem', marginTop: '2rem', fontSize: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--green-800)' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '.85rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          Don't have an account?{' '}
          <Link href="/contact" style={{ color: 'var(--green-700)', fontWeight: 500 }}>Contact an administrator</Link>.
        </p>
      </div>
    </div>
  )
}
