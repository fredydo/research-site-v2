'use client'

import { useState, useRef, useEffect } from 'react'

interface Person { id: number; name: string }
interface Props {
  label?: string
  people: Person[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function PeopleSelector({ label = 'Authors', people, selected, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered      = people.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) && !selected.includes(p.id))
  const selectedPeople = people.filter(p => selected.includes(p.id))

  const add    = (id: number) => { onChange([...selected, id]); setQuery(''); setOpen(false) }
  const remove = (id: number) => onChange(selected.filter(s => s !== id))

  return (
    <div className="form-group" ref={ref}>
      <label>{label}</label>

      {/* Selected chips */}
      {selectedPeople.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.5rem' }}>
          {selectedPeople.map(p => (
            <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--green-100)', color: 'var(--green-800)', padding: '3px 10px', borderRadius: '20px', fontSize: '.8rem', fontWeight: 500 }}>
              {p.name}
              <button type="button" onClick={() => remove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-700)', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Search input + dropdown */}
      <div style={{ position: 'relative' }}>
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search and add..."
          style={{ marginBottom: 0 }}
        />
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '.75rem 1rem', color: 'var(--gray-400)', fontSize: '.875rem', margin: 0 }}>
                {query ? 'No results' : selected.length === people.length ? 'All members selected' : 'Type to search'}
              </p>
            ) : filtered.map(p => (
              <button key={p.id} type="button" onClick={() => add(p.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '.875rem', color: 'var(--gray-800)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-50)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >{p.name}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
