'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ImageUpload from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

type Professor = { id: number; name: string; email: string; bio?: string; avatar?: string; googleScholarUrl?: string; cvlacUrl?: string; researchInterests?: string; researchLine: string; admin: boolean; isProfessor: boolean }
type Student   = { id: number; fullName: string; email: string; researchLine: string; yearInit?: string; yearEnd?: string; pictureUrl?: string; active: boolean; type: string; userId?: number }
type ProfForm  = { fullName: string; email: string; password: string; biography: string; profilePictureUrl: string; googleScholarUrl: string; cvlacUrl: string; researchInterests: string; researchLine: string; admin: boolean; isProfessor: boolean }
type StudForm  = { fullName: string; email: string; researchLine: string; yearInit: string; yearEnd: string; pictureUrl: string; active: boolean; type: string; userId: string; googleScholarUrl?: string; cvlacUrl?: string; biography?: string }

const STUDENT_TYPES = ['', 'phd', 'masters', 'undergraduate', 'alumni']
const RL_OPTIONS = ['PATTERN ANALYSIS AND SIGNAL PROCESSING', 'COMMUNICATIONS SYSTEMS MODELING', 'OPTICAL COMMUNICATIONS']
const EMPTY_PROF: ProfForm = { fullName: '', email: '', password: '', biography: '', profilePictureUrl: '', googleScholarUrl: '', cvlacUrl: '', researchInterests: '', researchLine: 'PATTERN ANALYSIS AND SIGNAL PROCESSING', admin: false, isProfessor: true }
const EMPTY_STUD: StudForm = { fullName: '', email: '', researchLine: 'PATTERN ANALYSIS AND SIGNAL PROCESSING', yearInit: '', yearEnd: '', pictureUrl: '', active: true, type: 'Ph.D', userId: '', googleScholarUrl: '', cvlacUrl: '', biography: '' }

function initials(name: string) { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }

export default function PeoplePage() {
  const { data: session, status } = useSession()
  const { t } = useLang()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const TABS = [
    { label: t.people.tabs.professors },
    { label: t.people.tabs.phd },
    { label: t.people.tabs.masters },
    { label: t.people.tabs.undergraduate },
    { label: t.people.tabs.alumni },
  ]

  const [activeTab, setActiveTab]       = useState(0)
  const [professors, setProfessors]     = useState<Professor[]>([])
  const [students, setStudents]         = useState<Student[]>([])
  const [loading, setLoading]           = useState(true)
  const [showProfForm, setShowProfForm] = useState(false)
  const [showStudForm, setShowStudForm] = useState(false)
  const [editProf, setEditProf]         = useState<Professor | null>(null)
  const [editStud, setEditStud]         = useState<Student | null>(null)
  const [deleteProf, setDeleteProf]     = useState<Professor | null>(null)
  const [deleteStud, setDeleteStud]     = useState<Student | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [profForm, setProfForm]         = useState<ProfForm>(EMPTY_PROF)
  const [studForm, setStudForm]         = useState<StudForm>(EMPTY_STUD)

  const loadProfs = useCallback(() => {
    fetch('/api/users').then(r => r.json()).then(({ data }) => { setProfessors((data || []).filter((u: any) => u.isProfessor)); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const loadStudents = useCallback(() => {
    fetch(`/api/students?type=${STUDENT_TYPES[activeTab]}`).then(r => r.json()).then(({ data }) => { setStudents(data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [activeTab])

  useEffect(() => { setLoading(true); if (activeTab === 0) loadProfs(); else loadStudents() }, [activeTab, loadProfs, loadStudents])

  const openAddProf  = () => { setEditProf(null); setProfForm(EMPTY_PROF); setShowProfForm(true) }
  const openEditProf = (p: Professor) => { setEditProf(p); setProfForm({ fullName: p.name, email: p.email, password: '', biography: p.bio || '', profilePictureUrl: p.avatar || '', googleScholarUrl: p.googleScholarUrl || '', cvlacUrl: p.cvlacUrl || '', researchInterests: p.researchInterests || '', researchLine: p.researchLine, admin: p.admin, isProfessor: p.isProfessor }); setShowProfForm(true) }
  const handleSaveProf = async () => { setSaving(true); const method = editProf ? 'PUT' : 'POST'; const url = editProf ? `/api/users/${editProf.id}` : '/api/users'; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profForm) }); setSaving(false); setShowProfForm(false); loadProfs() }
  const handleDeleteProf = async () => { if (!deleteProf) return; setDeleting(true); await fetch(`/api/users/${deleteProf.id}`, { method: 'DELETE' }); setDeleting(false); setDeleteProf(null); loadProfs() }

  const openAddStud  = () => { setEditStud(null); setStudForm({ ...EMPTY_STUD, type: STUDENT_TYPES[activeTab] }); setShowStudForm(true) }
  const openEditStud = (s: Student) => { setEditStud(s); setStudForm({ fullName: s.fullName, email: s.email, researchLine: s.researchLine, yearInit: s.yearInit || '', yearEnd: s.yearEnd || '', pictureUrl: s.pictureUrl || '', active: s.active, type: s.type, userId: String(s.userId || ''), googleScholarUrl: (s as any).googleScholarUrl || '', cvlacUrl: (s as any).cvlacUrl || '', biography: (s as any).biography || '' }); setShowStudForm(true) }
  const handleSaveStud = async () => { setSaving(true); const method = editStud ? 'PUT' : 'POST'; const url = editStud ? `/api/students/${editStud.id}` : '/api/students'; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studForm) }); setSaving(false); setShowStudForm(false); loadStudents() }
  const handleDeleteStud = async () => { if (!deleteStud) return; setDeleting(true); await fetch(`/api/students/${deleteStud.id}`, { method: 'DELETE' }); setDeleting(false); setDeleteStud(null); loadStudents() }

  return (
    <>
      <div className="page-header">
        <div className="container"><h1>{t.people.title}</h1><p>{t.people.subtitle}</p></div>
      </div>

      <div className="menu-tabs">
        <ul className="menu-tabs-inner container" style={{ padding: 0 }}>
          {TABS.map((tb, i) => <li key={tb.label}><button className={`menu-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{tb.label}</button></li>)}
        </ul>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Professors */}
        {activeTab === 0 && (
          <>
            {isAdmin && <div style={{ marginBottom: '1.5rem' }}><button className="btn btn-primary" onClick={openAddProf}>{t.people.add_professor}</button></div>}
            {loading ? <p className="text-muted">{t.people.loading}</p>
            : professors.length === 0 ? <p className="text-muted">{t.people.no_professors}</p>
            : professors.map(prof => (
              <div className="professor-card" key={prof.id}>
                {prof.avatar
                  ? <img src={prof.avatar} alt={prof.name} className="avatar-circle" />   // eslint-disable-line
                  : <div className="avatar-placeholder">{initials(prof.name)}</div>
                }
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '.2rem' }}>{prof.name}</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: '.4rem' }}>{prof.email}</p>
                  {prof.researchInterests && <p className="text-sm" style={{ marginBottom: '.4rem' }}><strong>{t.people.interests}:</strong> {prof.researchInterests}</p>}
                  {prof.bio && <p className="text-sm" style={{ color: 'var(--gray-600)', marginBottom: '.75rem' }}>{prof.bio}</p>}
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {prof.isProfessor
                      ? <span className="badge badge-green">Profesor</span>
                      : <span style={{ fontSize: '.72rem', background: 'var(--gray-100)', color: 'var(--gray-500)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Miembro</span>
                    }
                    {prof.admin && <span style={{ fontSize: '.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, marginLeft: '.25rem' }}>Admin</span>}
                    {prof.googleScholarUrl && <a href={prof.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Google Scholar</a>}
                    {prof.cvlacUrl && <a href={prof.cvlacUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">CvLAC</a>}
                    <a href={`/people/${prof.id}`} className="btn btn-outline btn-sm">View more →</a>
                    {isAdmin && <>
                      <button className="btn btn-sm" style={{ background: 'var(--yellow-100)', color: 'var(--yellow-600)' }} onClick={() => openEditProf(prof)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteProf(prof)}>🗑️</button>
                    </>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Students */}
        {activeTab > 0 && (
          <>
            {isAdmin && <div style={{ marginBottom: '1.5rem' }}><button className="btn btn-primary" onClick={openAddStud}>{t.people.add_student}</button></div>}
            {loading ? <p className="text-muted">{t.people.loading}</p>
            : students.length === 0 ? <p className="text-muted text-center" style={{ padding: '3rem' }}>{t.people.no_students}</p>
            : <div className="card-grid">
                {students.map(s => (
                  <div className="card card-hover" key={s.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
                      {s.pictureUrl
                        ? <img src={s.pictureUrl} alt={s.fullName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} /> // eslint-disable-line
                        : <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-news)', fontSize: '1.2rem', color: 'var(--green-700)', flexShrink: 0 }}>{initials(s.fullName)}</div>
                      }
                      <div><h3 style={{ fontSize: '1rem', marginBottom: '.1rem' }}>{s.fullName}</h3><p className="text-xs text-muted">{s.email}</p></div>
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                      {s.active ? <span className="badge badge-green">{t.people.active}</span> : <span className="badge badge-gray">{t.people.alumni_badge}</span>}
                      {s.yearInit && <span className="badge badge-gray">{s.yearInit}{s.yearEnd ? ` – ${s.yearEnd}` : ' – present'}</span>}
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--yellow-100)', color: 'var(--yellow-600)' }} onClick={() => openEditStud(s)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteStud(s)}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            }
          </>
        )}
      </div>

      {/* Professor Form */}
      {showProfForm && (
        <Modal title={editProf ? t.people.tabs.professors : t.people.add_professor} onClose={() => setShowProfForm(false)} width="640px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.people.form_prof.full_name}</label><input value={profForm.fullName} onChange={e => setProfForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div className="form-group"><label>{t.people.form_prof.email}</label><input type="email" value={profForm.email} onChange={e => setProfForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          {!editProf && <div className="form-group"><label>{t.people.form_prof.password}</label><input type="password" value={profForm.password} onChange={e => setProfForm(f => ({ ...f, password: e.target.value }))} /></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Año inicio</label><input value={(profForm as any).yearInit || ''} onChange={e => setProfForm(f => ({ ...f, yearInit: e.target.value } as any))} placeholder="2020" /></div>
            <div className="form-group"><label>Año fin</label><input value={(profForm as any).yearEnd || ''} onChange={e => setProfForm(f => ({ ...f, yearEnd: e.target.value } as any))} placeholder="2024" /></div>
          </div>
          <div className="form-group"><label>{t.people.form_prof.research_line}</label>
            <select value={profForm.researchLine} onChange={e => setProfForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>{t.people.form_prof.interests}</label><input value={profForm.researchInterests} onChange={e => setProfForm(f => ({ ...f, researchInterests: e.target.value }))} /></div>
          <div className="form-group"><label>{t.people.form_prof.biography}</label><textarea rows={3} value={profForm.biography} onChange={e => setProfForm(f => ({ ...f, biography: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.people.form_prof.scholar}</label><input type="url" value={profForm.googleScholarUrl} onChange={e => setProfForm(f => ({ ...f, googleScholarUrl: e.target.value }))} /></div>
            <div className="form-group"><label>{t.people.form_prof.cvlac}</label><input type="url" value={profForm.cvlacUrl} onChange={e => setProfForm(f => ({ ...f, cvlacUrl: e.target.value }))} /></div>
          </div>
          <ImageUpload label={t.people.form_prof.photo} value={profForm.profilePictureUrl} onChange={url => setProfForm(f => ({ ...f, profilePictureUrl: url }))} />
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <input type="checkbox" id="prof-check" checked={profForm.isProfessor} onChange={e => setProfForm(f => ({ ...f, isProfessor: e.target.checked }))} style={{ width: 'auto' }} />
              <label htmlFor="prof-check" style={{ margin: 0 }}>Es profesor (aparece en People)</label>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <input type="checkbox" id="admin-check" checked={profForm.admin} onChange={e => setProfForm(f => ({ ...f, admin: e.target.checked }))} style={{ width: 'auto' }} />
              <label htmlFor="admin-check" style={{ margin: 0 }}>{t.people.form_prof.admin}</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowProfForm(false)}>{t.people.form_prof.cancel}</button>
            <button className="btn btn-primary" onClick={handleSaveProf} disabled={saving || !profForm.fullName || !profForm.email}>
              {saving ? t.common.loading : editProf ? t.people.form_prof.update : t.people.form_prof.save}
            </button>
          </div>
        </Modal>
      )}

      {/* Student Form */}
      {showStudForm && (
        <Modal title={editStud ? t.people.tabs.phd : t.people.add_student} onClose={() => setShowStudForm(false)} width="580px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.people.form_stud.full_name}</label><input value={studForm.fullName} onChange={e => setStudForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div className="form-group"><label>{t.people.form_stud.email}</label><input type="email" value={studForm.email} onChange={e => setStudForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>{t.people.form_stud.year_init}</label><input value={studForm.yearInit} onChange={e => setStudForm(f => ({ ...f, yearInit: e.target.value }))} placeholder="2020" /></div>
            <div className="form-group"><label>{t.people.form_stud.year_end}</label><input value={studForm.yearEnd} onChange={e => setStudForm(f => ({ ...f, yearEnd: e.target.value }))} placeholder="2024" /></div>
          </div>
          <div className="form-group"><label>{t.people.form_stud.type}</label>
            <select value={studForm.type} onChange={e => setStudForm(f => ({ ...f, type: e.target.value }))}>
              <option value="Ph.D">PhD</option>
              <option value="Master">{t.people.tabs.masters}</option>
              <option value="Bachelor">{t.people.tabs.undergraduate}</option>
              <option value="Alumni">{t.people.tabs.alumni}</option>
            </select>
          </div>
          <div className="form-group"><label>{t.people.form_stud.research_line}</label>
            <select value={studForm.researchLine} onChange={e => setStudForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Supervisor</label>
            <select value={studForm.userId} onChange={e => setStudForm(f => ({ ...f, userId: e.target.value }))}>
              <option value="">-- Sin asignar --</option>
              {professors.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
          </div>
          <ImageUpload label={t.people.form_stud.photo} value={studForm.pictureUrl} onChange={url => setStudForm(f => ({ ...f, pictureUrl: url }))} />
          <div className="form-group"><label>Google Scholar URL</label><input type="url" value={studForm.googleScholarUrl || ''} onChange={e => setStudForm(f => ({ ...f, googleScholarUrl: e.target.value }))} /></div>
          <div className="form-group"><label>CvLAC URL</label><input type="url" value={studForm.cvlacUrl || ''} onChange={e => setStudForm(f => ({ ...f, cvlacUrl: e.target.value }))} /></div>
          <div className="form-group"><label>Biografía</label><textarea rows={3} value={studForm.biography || ''} onChange={e => setStudForm(f => ({ ...f, biography: e.target.value }))} /></div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <input type="checkbox" id="active-check" checked={studForm.active} onChange={e => setStudForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 'auto' }} />
            <label htmlFor="active-check" style={{ margin: 0 }}>{t.people.form_stud.active}</label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowStudForm(false)}>{t.people.form_stud.cancel}</button>
            <button className="btn btn-primary" onClick={handleSaveStud} disabled={saving || !studForm.fullName || !studForm.email}>
              {saving ? t.common.loading : editStud ? t.people.form_stud.update : t.people.form_stud.save}
            </button>
          </div>
        </Modal>
      )}

      {deleteProf && <ConfirmDialog message={`${t.people.delete_prof} "${deleteProf.name}"?`} onConfirm={handleDeleteProf} onCancel={() => setDeleteProf(null)} loading={deleting} />}
      {deleteStud && <ConfirmDialog message={`${t.people.delete_stud} "${deleteStud.fullName}"?`} onConfirm={handleDeleteStud} onCancel={() => setDeleteStud(null)} loading={deleting} />}
    </>
  )
}
