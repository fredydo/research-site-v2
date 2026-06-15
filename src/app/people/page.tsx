'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ImageUpload from '@/components/admin/ImageUpload'
import Link from 'next/link'

type Person = {
  id: number; fullName: string; email: string; biography?: string
  profilePictureUrl?: string; googleScholarUrl?: string; cvlacUrl?: string
  researchInterests?: string; researchLine: string; yearInit?: string
  yearEnd?: string; active: boolean; admin: boolean; isPublic: boolean
  supervisorId?: number; supervisorName?: string; roles: string[]; publicationCount?: number
}
type PersonForm = {
  fullName: string; email: string; password: string; biography: string
  profilePictureUrl: string; googleScholarUrl: string; cvlacUrl: string
  researchInterests: string; researchLine: string; yearInit: string
  yearEnd: string; active: boolean; admin: boolean; isPublic: boolean
  supervisorId: string; roles: string[]
}

const RL_OPTIONS = [
  'Pattern Analysis And Signal Processing',
  "Communication's Systems Modeling",
  'Optical Communications',
]
const ALL_ROLES = ['professor', 'phd', 'master', 'undergraduate', 'alumni', 'member']
const ROLE_LABELS: Record<string, string> = {
  professor: 'Professor', phd: 'PhD Student', master: "Master's Student",
  undergraduate: 'Undergraduate', alumni: 'Alumni', member: 'Member',
}
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  professor:     { bg: 'var(--green-100)', color: 'var(--green-800)' },
  phd:           { bg: '#dbeafe',          color: '#1e40af' },
  master:        { bg: '#ede9fe',          color: '#5b21b6' },
  undergraduate: { bg: '#fef3c7',          color: '#92400e' },
  alumni:        { bg: 'var(--gray-100)',  color: 'var(--gray-600)' },
  member:        { bg: 'var(--gray-100)',  color: 'var(--gray-500)' },
}
const TABS = [
  { label: 'Professors',    role: 'professor'     },
  { label: 'PhD Students',  role: 'phd'           },
  { label: "Master's",      role: 'master'        },
  { label: 'Undergraduate', role: 'undergraduate' },
  { label: 'Alumni',        role: 'alumni'        },
]
const EMPTY_FORM: PersonForm = {
  fullName: '', email: '', password: '', biography: '',
  profilePictureUrl: '', googleScholarUrl: '', cvlacUrl: '',
  researchInterests: '', researchLine: 'Pattern Analysis And Signal Processing',
  yearInit: '', yearEnd: '', active: true, admin: false, isPublic: true,
  supervisorId: '', roles: ['professor'],
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function PeoplePage() {
  const { data: session, status } = useSession()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const [activeTab, setActiveTab]       = useState(0)
  const [filterRL, setFilterRL]         = useState('')
  const [people, setPeople]             = useState<Person[]>([])
  const [allPeople, setAllPeople]       = useState<Person[]>([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editPerson, setEditPerson]     = useState<Person | null>(null)
  const [deletePerson, setDeletePerson] = useState<Person | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [form, setForm]                 = useState<PersonForm>(EMPTY_FORM)

  const loadPeople = useCallback(() => {
    setLoading(true)
    fetch(`/api/people?role=${TABS[activeTab].role}`)
      .then(r => r.json())
      .then(({ data }) => { setPeople(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeTab])

  useEffect(() => {
    fetch('/api/people?role=professor')
      .then(r => r.json())
      .then(({ data }) => setAllPeople(data || []))
  }, [])

  useEffect(() => { loadPeople() }, [loadPeople])

  const openAdd = () => {
    setEditPerson(null)
    setForm({ ...EMPTY_FORM, roles: [TABS[activeTab].role] })
    setShowForm(true)
  }

  const openEdit = (p: Person) => {
    setEditPerson(p)
    setForm({
      fullName: p.fullName, email: p.email, password: '',
      biography: p.biography || '', profilePictureUrl: p.profilePictureUrl || '',
      googleScholarUrl: p.googleScholarUrl || '', cvlacUrl: p.cvlacUrl || '',
      researchInterests: p.researchInterests || '', researchLine: p.researchLine,
      yearInit: p.yearInit || '', yearEnd: p.yearEnd || '',
      active: p.active, admin: p.admin, isPublic: p.isPublic,
      supervisorId: String(p.supervisorId || ''), roles: p.roles,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const method = editPerson ? 'PUT' : 'POST'
    const url    = editPerson ? `/api/people/${editPerson.id}` : '/api/people'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, supervisorId: form.supervisorId ? parseInt(form.supervisorId) : null }),
    })
    setSaving(false)
    setShowForm(false)
    loadPeople()
  }

  const handleDelete = async () => {
    if (!deletePerson) return
    setDeleting(true)
    await fetch(`/api/people/${deletePerson.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeletePerson(null)
    loadPeople()
  }

  const toggleRole = (role: string) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }))
  }

  const filtered = filterRL ? people.filter(p => p.researchLine === filterRL) : people

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>People</h1>
          <p>Meet the researchers, professors and students of the GITA group.</p>
        </div>
      </div>

      <div className="menu-tabs">
        <ul className="menu-tabs-inner container" style={{ padding: 0 }}>
          {TABS.map((tb, i) => (
            <li key={tb.role}>
              <button className={`menu-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                {tb.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {isAdmin && (
          <div style={{ marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={openAdd}>+ Add person</button>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {['', ...RL_OPTIONS].map(r => (
            <button key={r} onClick={() => setFilterRL(r)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '.78rem', fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: filterRL === r ? 'var(--green-700)' : 'var(--color-border)',
              background:  filterRL === r ? 'var(--green-700)' : '#fff',
              color:       filterRL === r ? '#fff' : 'var(--gray-500)',
              transition: 'all .15s',
            }}>
              {r === '' ? 'All' : r === 'Pattern Analysis And Signal Processing' ? 'Pattern Analysis' : r === "Communication's Systems Modeling" ? 'Comm. Systems' : 'Optical'}
            </button>
          ))}
        </div>

        {loading
          ? <p className="text-muted">Loading…</p>
          : filtered.length === 0
          ? <p className="text-muted text-center" style={{ padding: '3rem' }}>No people found.</p>
          : activeTab === 0
          ? <>
              {filtered.map(p => (
                <div className="professor-card" key={p.id}>
                  {p.profilePictureUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.profilePictureUrl} alt={p.fullName} className="avatar-circle" />
                    : <div className="avatar-placeholder">{initials(p.fullName)}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '.2rem' }}>{p.fullName}</h3>
                    <p className="text-sm text-muted" style={{ marginBottom: '.4rem' }}>{p.email}</p>
                    {p.researchInterests && <p className="text-sm" style={{ marginBottom: '.4rem' }}><strong>Research interests:</strong> {p.researchInterests}</p>}
                    {p.biography && <p className="text-sm" style={{ color: 'var(--gray-600)', marginBottom: '.75rem' }}>{p.biography}</p>}
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                      {p.roles.map(r => (
                        <span key={r} style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, background: ROLE_COLORS[r]?.bg, color: ROLE_COLORS[r]?.color }}>
                          {ROLE_LABELS[r] || r}
                        </span>
                      ))}
                      {p.publicationCount !== undefined && p.publicationCount > 0 && (
                      <span style={{ fontSize: '.72rem', background: 'var(--green-50)', color: 'var(--green-700)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid var(--green-200)' }}>
                        📄 {p.publicationCount} publications
                      </span>
                    )}
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {p.googleScholarUrl && <a href={p.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Google Scholar</a>}
                      {p.cvlacUrl && <a href={p.cvlacUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">CvLAC</a>}
                      <Link href={`/people/${p.id}`} className="btn btn-outline btn-sm">View more →</Link>
                      {isAdmin && <>
                        <button className="btn btn-sm" style={{ background: 'var(--yellow-100)', color: 'var(--yellow-600)' }} onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeletePerson(p)}>🗑️</button>
                      </>}
                    </div>
                  </div>
                </div>
              ))}
            </>
          : <div className="card-grid">
              {filtered.map(p => (
                <div className="card card-hover" key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
                    {p.profilePictureUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.profilePictureUrl} alt={p.fullName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-news)', fontSize: '1.2rem', color: 'var(--green-700)', flexShrink: 0 }}>{initials(p.fullName)}</div>
                    }
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '.1rem' }}>{p.fullName}</h3>
                      <p className="text-xs text-muted">{p.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                    {p.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}
                    {(p.yearInit || p.yearEnd) && <span className="badge badge-gray">{p.yearInit}{p.yearEnd ? ` – ${p.yearEnd}` : ' – present'}</span>}
                    {p.supervisorName && <span style={{ fontSize: '.72rem', color: 'var(--gray-500)' }}>Supervisor: {p.supervisorName}</span>}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-sm" style={{ background: 'var(--yellow-100)', color: 'var(--yellow-600)' }} onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeletePerson(p)}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>

      {showForm && (
        <Modal title={editPerson ? 'Edit person' : 'Add person'} onClose={() => setShowForm(false)} width="680px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Full name *</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div className="form-group"><label>Email (optional)</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          {!editPerson && <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave empty for no login access" /></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Start year</label><input value={form.yearInit} onChange={e => setForm(f => ({ ...f, yearInit: e.target.value }))} placeholder="2020" /></div>
            <div className="form-group"><label>End year</label><input value={form.yearEnd} onChange={e => setForm(f => ({ ...f, yearEnd: e.target.value }))} placeholder="2024" /></div>
          </div>
          <div className="form-group"><label>Research line</label>
            <select value={form.researchLine} onChange={e => setForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Supervisor</label>
            <select value={form.supervisorId} onChange={e => setForm(f => ({ ...f, supervisorId: e.target.value }))}>
              <option value="">-- Not assigned --</option>
              {allPeople.map(p => <option key={p.id} value={String(p.id)}>{p.fullName}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Research interests</label><input value={form.researchInterests} onChange={e => setForm(f => ({ ...f, researchInterests: e.target.value }))} /></div>
          <div className="form-group"><label>Biography</label><textarea rows={3} value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Google Scholar URL</label><input type="url" value={form.googleScholarUrl} onChange={e => setForm(f => ({ ...f, googleScholarUrl: e.target.value }))} /></div>
            <div className="form-group"><label>CvLAC URL</label><input type="url" value={form.cvlacUrl} onChange={e => setForm(f => ({ ...f, cvlacUrl: e.target.value }))} /></div>
          </div>
          <ImageUpload label="Profile photo" value={form.profilePictureUrl} onChange={url => setForm(f => ({ ...f, profilePictureUrl: url }))} />
          <div className="form-group">
            <label>Roles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.35rem' }}>
              {ALL_ROLES.map(role => (
                <button key={role} type="button" onClick={() => toggleRole(role)} style={{
                  padding: '4px 12px', borderRadius: '20px', border: '2px solid',
                  cursor: 'pointer', fontSize: '.8rem', fontWeight: 600,
                  borderColor: form.roles.includes(role) ? ROLE_COLORS[role]?.color : 'var(--color-border)',
                  background:  form.roles.includes(role) ? ROLE_COLORS[role]?.bg : '#fff',
                  color:       form.roles.includes(role) ? ROLE_COLORS[role]?.color : 'var(--gray-400)',
                }}>
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 'auto' }} />Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} style={{ width: 'auto' }} />Visible on People page
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.admin} onChange={e => setForm(f => ({ ...f, admin: e.target.checked }))} style={{ width: 'auto' }} />Admin access
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.fullName}>
              {saving ? 'Saving…' : editPerson ? 'Update' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deletePerson && (
        <ConfirmDialog message={`Delete "${deletePerson.fullName}"?`} onConfirm={handleDelete} onCancel={() => setDeletePerson(null)} loading={deleting} />
      )}
    </>
  )
}
