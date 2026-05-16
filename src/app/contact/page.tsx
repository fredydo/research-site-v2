'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

type ContactForm = {
  name: string
  email: string
  subject?: string
  description: string
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>()

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSent(true)
      reset()
    } catch {
      // silent — show success optimistically; add toast in production
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Contact</h1>
          <p>GITA research group · Universidad de Antioquia · Street 67 No. 53-108 Of. 18-310 · Medellín, Colombia · +57 4 2198523</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '860px' }}>
        {/* Map */}
        <div style={{ marginBottom: '2rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.969412163259!2d-75.57103028474928!3d6.2677532278212365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428e0c9c8772f%3A0x10cce7ece69b2e2b!2sUniversidad%20de%20Antioquia%20-%20UdeA!5e0!3m2!1ses!2sco!4v1621907923944!5m2!1ses!2sco"
            width="100%"
            height="280"
            loading="lazy"
            style={{ display: 'block', border: 0 }}
            title="Universidad de Antioquia map"
          />
        </div>

        {/* Success message */}
        {sent && (
          <div style={{ background: 'var(--green-100)', border: '1px solid var(--green-600)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--green-800)', fontWeight: 500 }}>
              ✓ Your message has been sent! We will get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Send us a message</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="name">Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                id="name"
                type="text"
                placeholder="What is your name?"
                {...register('name', { required: true, minLength: 3, maxLength: 500 })}
              />
              {errors.name?.type === 'required'   && <p className="form-error">Name is required</p>}
              {errors.name?.type === 'minLength'  && <p className="form-error">Minimum 3 characters</p>}
              {errors.name?.type === 'maxLength'  && <p className="form-error">Maximum 500 characters</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                id="email"
                type="email"
                placeholder="Enter a valid email"
                {...register('email', {
                  required: true,
                  minLength: 10,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
              />
              {errors.email?.type === 'required'  && <p className="form-error">Email is required</p>}
              {errors.email?.type === 'pattern'   && <p className="form-error">Invalid email address</p>}
              {errors.email?.type === 'minLength' && <p className="form-error">Minimum 10 characters</p>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="Enter a subject"
                {...register('subject', { minLength: 5, maxLength: 100 })}
              />
              {errors.subject?.type === 'minLength' && <p className="form-error">Minimum 5 characters</p>}
              {errors.subject?.type === 'maxLength' && <p className="form-error">Maximum 100 characters</p>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Message <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <textarea
                id="description"
                rows={5}
                placeholder="Enter your message…"
                {...register('description', { required: true, minLength: 10, maxLength: 500 })}
              />
              {errors.description?.type === 'required'  && <p className="form-error">Message is required</p>}
              {errors.description?.type === 'minLength' && <p className="form-error">Minimum 10 characters</p>}
              {errors.description?.type === 'maxLength' && <p className="form-error">Maximum 500 characters</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
