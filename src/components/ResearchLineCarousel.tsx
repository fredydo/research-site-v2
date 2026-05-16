'use client'

import { useState, useEffect, useCallback } from 'react'

interface Slide { img: string; caption: string }
interface Contact { name: string; email: string; phone: string; office: string }
interface Props { title: string; description: string; slides: Slide[]; contact: Contact }

export default function ResearchLineCarousel({ title, description, slides, contact }: Props) {
  const [current, setCurrent]   = useState(0)
  const [lightbox, setLightbox] = useState(false)

  // Reset to 0 when slides change — CRITICAL fix
  useEffect(() => { setCurrent(0); setLightbox(false) }, [slides])

  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length])
  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])

  useEffect(() => {
    if (lightbox || slides.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, lightbox, slides.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    if (lightbox) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  // Guard — never render if slides is empty or current is out of bounds
  if (!slides.length || current >= slides.length) return null

  const slide = slides[current]

  return (
    <>
      <div style={{ display: 'flex', background: 'var(--white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', margin: '0 0 2rem 0', boxShadow: 'var(--shadow-sm)' }}>
        {/* Left: carousel */}
        <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
          <div style={{ height: '340px', position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current} src={slide.img} alt={slide.caption}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '1rem', transition: 'opacity .3s' }}
            />
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,.45)', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '.7rem', pointerEvents: 'none' }}>🔍 ampliar</div>
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>›</button>
          </div>
          <div style={{ padding: '.65rem 1rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', background: '#fff' }}>
            <p style={{ fontSize: '.85rem', color: 'var(--gray-600)', marginBottom: '.4rem' }}>{slide.caption}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: i === current ? 'var(--green-700)' : 'var(--green-200)', transition: 'background .2s' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: dark green panel */}
        <div style={{ flex: '0 0 35%', background: 'var(--green-900, #1a3a2a)', color: '#fff', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-news)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '1.25rem', color: '#fff' }}>{title}</h2>
            <p style={{ fontSize: '.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,.8)', marginBottom: '1.5rem' }}>{description}</p>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.5)', marginBottom: '.75rem' }}>Contact:</p>
            <p style={{ fontSize: '.875rem', color: '#fff', marginBottom: '.2rem', fontWeight: 500 }}>{contact.name}</p>
            <a href={`mailto:${contact.email}`} style={{ fontSize: '.83rem', color: 'var(--green-300, #86efac)', display: 'block', marginBottom: '.2rem' }}>{contact.email}</a>
            <p style={{ fontSize: '.83rem', color: 'rgba(255,255,255,.65)', marginBottom: '.1rem' }}>{contact.phone}</p>
            <p style={{ fontSize: '.83rem', color: 'rgba(255,255,255,.65)' }}>{contact.office}</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.img} alt={slide.caption} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 40px rgba(0,0,0,.6)' }} />
          <div style={{ position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '.9rem', background: 'rgba(0,0,0,.5)', padding: '.4rem 1rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {slide.caption} ({current + 1}/{slides.length})
          </div>
          <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: i === current ? 'var(--green-400, #4ade80)' : 'rgba(255,255,255,.4)' }} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
