'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ImageUpload from '@/components/admin/ImageUpload'
import PeopleSelector from '@/components/admin/PeopleSelector'

type Professor = {
  id: number; fullName: string; name?: string; email: string; biography?: string
  profilePictureUrl?: string; googleScholarUrl?: string; cvlacUrl?: string
  researchInterests?: string; researchLine: string; admin: boolean
}
type Publication = {
  _id: string; citation: string; year: string; yearShort: string; type: string
  paperUrl?: string; bibtexCitation?: string; doi?: string; researchLine: string; userIds?: number[]
}
type Project = {
  id: number; title: string; description?: string; dateInit?: string; dateEnd?: string
  budget?: number; fileUrl?: string; codeId?: string; fundingAgency?: string
  researchLine: string; userIds?: number[]
}
type Student = {
  id: number; fullName: string; email: string; type: string
  yearInit?: string; yearEnd?: string; pictureUrl?: string; active: boolean
}

const TYPE_ORDER = ['phd', 'master', 'undergraduate', 'alumni', 'member']
const TYPE_LABEL: Record<string, string> = {
  phd: 'PhD Students', master: "Master's Students",
  undergraduate: 'Undergraduate', alumni: 'Alumni', member: 'Member'
}
const RL_OPTIONS = [
  'Pattern Analysis And Signal Processing',
  "Communication's Systems Modeling",
  'Optical Communications',
]
const PUB_TYPE_ORDER: Record<string, number> = {
  'JOURNAL ARTICLES': 0, 'CONFERENCE PAPERS': 1, 'BOOK CHAPTERS': 2, 'THESIS': 3, 'OTHER': 4,
}
const EMPTY_PUB = {
  citation: '', year: String(new Date().getFullYear()), type: 'JOURNAL ARTICLES',
  researchLine: 'Pattern Analysis And Signal Processing', paperUrl: '', bibtexCitation: '', doi: '', userIds: [] as number[],
}
const EMPTY_PROJ = {
  title: '', description: '', dateInit: '', dateEnd: '', budget: '', fileUrl: '',
  codeId: '', fundingAgency: '', researchLine: 'Pattern Analysis And Signal Processing', userIds: [] as number[],
}

function initials(name: string) { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }
function fmtDate(d?: string) {
  if (!d) return ''
  const [y, m] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return m ? `${months[parseInt(m,10)-1]} ${y}` : y
}

export default function ProfessorProfilePage() {
  const { id } = useParams()
  const { data: session, status } = useSession()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const [professor, setProfessor]       = useState<Professor | null>(null)
  const [publications, setPublications] = useState<Publication[]>([])
  const [projects, setProjects]         = useState<Project[]>([])
  const [students, setStudents]         = useState<Student[]>([])
  const [allPeople, setAllPeople]       = useState<{ id: number; name: string }[]>([])
  const [stats, setStats]               = useState({ publications: 0, projects: 0, students: 0 })
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState<'publications' | 'projects' | 'students'>('publications')
  const [pubSortBy, setPubSortBy]       = useState<'year' | 'type'>('year')

  // Profile edit
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [savingProfile, setSavingProfile]     = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: '', biography: '', researchInterests: '',
    googleScholarUrl: '', cvlacUrl: '', profilePictureUrl: '', researchLine: '',
  })

  // Publication add/edit/delete
  const [showPubForm, setShowPubForm]   = useState(false)
  const [editPub, setEditPub]           = useState<Publication | null>(null)
  const [deletePub, setDeletePub]       = useState<Publication | null>(null)
  const [pubForm, setPubForm]           = useState(EMPTY_PUB)
  const [savingPub, setSavingPub]       = useState(false)
  const [deletingPub, setDeletingPub]   = useState(false)

  // Project add/edit/delete
  const [showProjForm, setShowProjForm] = useState(false)
  const [editProj, setEditProj]         = useState<Project | null>(null)
  const [deleteProj, setDeleteProj]     = useState<Project | null>(null)
  const [projForm, setProjForm]         = useState(EMPTY_PROJ)
  const [savingProj, setSavingProj]     = useState(false)
  const [deletingProj, setDeletingProj] = useState(false)

  const load = () => {
    if (!id) return
    fetch(`/api/users/${id}/profile`)
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setProfessor(data.professor)
          setPublications(data.publications)
          setProjects(data.projects)
          setStudents(data.students)
          setStats(data.stats)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    fetch('/api/people').then(r => r.json()).then(({ data }) =>
      setAllPeople((data || []).map((p: any) => ({ id: p.id, name: p.fullName })))
    )
  }, [])

  // ---- Profile edit handlers ----
  const openEditProfile = () => {
    if (!professor) return
    setProfileForm({
      fullName:          professor.fullName || professor.name || '',
      biography:         professor.biography || '',
      researchInterests: professor.researchInterests || '',
      googleScholarUrl:  professor.googleScholarUrl || '',
      cvlacUrl:          professor.cvlacUrl || '',
      profilePictureUrl: professor.profilePictureUrl || '',
      researchLine:      professor.researchLine || '',
    })
    setShowEditProfile(true)
  }
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    await fetch(`/api/people/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })
    setSavingProfile(false)
    setShowEditProfile(false)
    load()
  }

  // ---- Publication handlers ----
  const openAddPub = () => { setEditPub(null); setPubForm({ ...EMPTY_PUB, userIds: [Number(id)] }); setShowPubForm(true) }
  const openEditPub = (p: Publication) => {
    setEditPub(p)
    setPubForm({
      citation: p.citation, year: p.yearShort || p.year, type: p.type || 'JOURNAL ARTICLES',
      researchLine: p.researchLine, paperUrl: p.paperUrl || '', bibtexCitation: p.bibtexCitation || '',
      doi: p.doi || '', userIds: p.userIds || [],
    })
    setShowPubForm(true)
  }
  const handleSavePub = async () => {
    setSavingPub(true)
    const method = editPub ? 'PUT' : 'POST'
    const url = editPub ? `/api/publications/${editPub._id}` : '/api/publications'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pubForm) })
    setSavingPub(false)
    setShowPubForm(false)
    load()
  }
  const handleDeletePub = async () => {
    if (!deletePub) return
    setDeletingPub(true)
    await fetch(`/api/publications/${deletePub._id}`, { method: 'DELETE' })
    setDeletingPub(false)
    setDeletePub(null)
    load()
  }

  // ---- Project handlers ----
  const openAddProj = () => { setEditProj(null); setProjForm({ ...EMPTY_PROJ, userIds: [Number(id)] }); setShowProjForm(true) }
  const openEditProj = (p: Project) => {
    setEditProj(p)
    setProjForm({
      title: p.title, description: p.description || '', dateInit: p.dateInit || '', dateEnd: p.dateEnd || '',
      budget: p.budget ? String(p.budget) : '', fileUrl: p.fileUrl || '', codeId: p.codeId || '',
      fundingAgency: p.fundingAgency || '', researchLine: p.researchLine, userIds: p.userIds || [],
    })
    setShowProjForm(true)
  }
  const handleSaveProj = async () => {
    setSavingProj(true)
    const method = editProj ? 'PUT' : 'POST'
    const url = editProj ? `/api/projects/${editProj.id}` : '/api/projects'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projForm) })
    setSavingProj(false)
    setShowProjForm(false)
    load()
  }
  const handleDeleteProj = async () => {
    if (!deleteProj) return
    setDeletingProj(true)
    await fetch(`/api/projects/${deleteProj.id}`, { method: 'DELETE' })
    setDeletingProj(false)
    setDeleteProj(null)
    load()
  }

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><p className="text-muted">Loading…</p></div>
  if (!professor) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><p className="text-muted">Person not found.</p></div>

  const studentsByType = TYPE_ORDER
    .map(type => ({ type, label: TYPE_LABEL[type], list: students.filter(s => s.type === type) }))
    .filter(g => g.list.length > 0)

  // Group/sort publications same way as main Publications page
  const byGroup: Record<string, Publication[]> = {}
  publications.forEach(p => {
    const key = pubSortBy === 'year' ? (p.yearShort || p.year) : (p.type || 'OTHER')
    if (!byGroup[key]) byGroup[key] = []
    byGroup[key].push(p)
  })
  const sortedGroups = pubSortBy === 'year'
    ? Object.keys(byGroup).sort((a, b) => Number(b) - Number(a))
    : Object.keys(byGroup).sort((a, b) => (PUB_TYPE_ORDER[a] ?? 99) - (PUB_TYPE_ORDER[b] ?? 99))

  return (
    <>
      <div className="page-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/people" style={{ color: 'rgba(255,255,255,.7)', fontSize: '.875rem' }}>← People</Link>
          {isAdmin && (
            <button onClick={openEditProfile} className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>
              ✏️ Edit profile
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
        {/* Profile card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              {professor.profilePictureUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={professor.profilePictureUrl} alt={professor.fullName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-100)' }} />
                : <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: 'var(--green-700)' }}>
                    {initials(professor.fullName || professor.name || '')}
                  </div>
              }
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '.25rem' }}>{professor.fullName || professor.name}</h1>
              <p style={{ color: 'var(--green-700)', fontWeight: 600, marginBottom: '.35rem', fontSize: '.9rem' }}>{professor.researchLine}</p>
              <a href={`mailto:${professor.email}`} style={{ color: 'var(--gray-500)', fontSize: '.875rem', display: 'block', marginBottom: '1rem' }}>
                {professor.email}
              </a>
              {professor.researchInterests && (
                <p className="text-sm" style={{ marginBottom: '.75rem' }}>
                  <strong>Research interests:</strong> {professor.researchInterests}
                </p>
              )}
              {professor.biography && (
                <p style={{ fontSize: '.9rem', lineHeight: 1.7, color: 'var(--gray-600)', marginBottom: '1rem' }}>
                  {professor.biography}
                </p>
              )}
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {professor.googleScholarUrl && <a href={professor.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Google Scholar</a>}
                {professor.cvlacUrl && <a href={professor.cvlacUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">CvLAC</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Publications', value: stats.publications, tab: 'publications' as const },
            { label: 'Projects',     value: stats.projects,     tab: 'projects'     as const },
            { label: 'Students',     value: stats.students,     tab: 'students'     as const },
          ].map(({ label, value, tab }) => (
            <button key={label} onClick={() => setActiveTab(tab)} style={{
              background:   activeTab === tab ? 'var(--green-700)' : 'var(--white)',
              color:        activeTab === tab ? '#fff' : 'var(--gray-700)',
              border:       `1px solid ${activeTab === tab ? 'var(--green-700)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '1.25rem',
              textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-news)' }}>{value}</div>
              <div style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '.25rem', opacity: .8 }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Publications */}
        {activeTab === 'publications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
              {isAdmin
                ? <button className="btn btn-primary btn-sm" onClick={openAddPub}>+ Add publication</button>
                : <span />
              }
              <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>Sort by:</span>
                {(['year', 'type'] as const).map(s => (
                  <button key={s} onClick={() => setPubSortBy(s)} style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '.78rem', fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: pubSortBy === s ? 'var(--green-700)' : 'var(--color-border)',
                    background:  pubSortBy === s ? 'var(--green-700)' : '#fff',
                    color:       pubSortBy === s ? '#fff' : 'var(--gray-500)',
                  }}>
                    {s === 'year' ? '📅 Year' : '🏷️ Type'}
                  </button>
                ))}
              </div>
            </div>

            {publications.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No publications found.</p>
            ) : sortedGroups.map(group => (
              <div key={group} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--green-800)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {group}
                  <span style={{ background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '.72rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{byGroup[group].length} pubs.</span>
                </h3>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {byGroup[group].map((pub, idx) => (
                    <div key={pub._id} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: idx < byGroup[group].length - 1 ? '1px solid var(--color-border)' : 'none', background: '#fff', alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700 }}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        {pub.type && <span style={{ fontSize: '.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', display: 'inline-block', marginBottom: '.3rem' }}>{pub.type}</span>}
                        <p style={{ fontSize: '.875rem', lineHeight: 1.6 }}>{pub.citation}</p>
                        <div style={{ display: 'flex', gap: '.75rem', marginTop: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {pub.paperUrl && <a href={pub.paperUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: '#1e40af' }}>📄 PDF</a>}
                          {pub.doi && <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: '#1e40af' }}>🔗 DOI</a>}
                          {isAdmin && (
                            <>
                              <button onClick={() => openEditPub(pub)} style={{ fontSize: '.75rem', background: 'none', border: 'none', color: 'var(--yellow-600)', cursor: 'pointer', padding: 0 }}>✏️ Edit</button>
                              <button onClick={() => setDeletePub(pub)} style={{ fontSize: '.75rem', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0 }}>🗑️ Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '.75rem', color: 'var(--gray-400)', flexShrink: 0 }}>{pub.yearShort}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div>
            {isAdmin && (
              <div style={{ marginBottom: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={openAddProj}>+ Add project</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '2rem' }}>No projects found.</p>
              ) : projects.map(p => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px', background: 'var(--white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid var(--color-border)' }}>
                    {p.codeId && <span style={{ fontSize: '.7rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '.5rem' }}>{p.codeId}</span>}
                    <h3 style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: '.5rem' }}>{p.title}</h3>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '.75rem' }}>
                        <button onClick={() => openEditProj(p)} style={{ fontSize: '.75rem', background: 'none', border: 'none', color: 'var(--yellow-600)', cursor: 'pointer', padding: 0 }}>✏️ Edit</button>
                        <button onClick={() => setDeleteProj(p)} style={{ fontSize: '.75rem', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0 }}>🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem', background: 'var(--green-50)', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {(p.dateInit || p.dateEnd) && <p style={{ fontSize: '.82rem' }}>{fmtDate(p.dateInit)} – {fmtDate(p.dateEnd)}</p>}
                    {p.fundingAgency && <p style={{ fontSize: '.82rem', color: 'var(--gray-600)' }}>{p.fundingAgency}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div>
            {studentsByType.length === 0
              ? <p className="text-muted text-center" style={{ padding: '2rem' }}>No students found.</p>
              : studentsByType.map(({ type, label, list }) => (
                <div key={type} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--green-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {label}
                    <span style={{ background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{list.length}</span>
                  </h3>
                  <div className="card-grid">
                    {list.map(s => (
                      <Link href={`/people/${s.id}`} className="card" key={s.id} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        {s.pictureUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={s.pictureUrl} alt={s.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--green-700)', flexShrink: 0 }}>{initials(s.fullName)}</div>
                        }
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.1rem' }}>{s.fullName}</p>
                          <p style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{s.email}</p>
                          {(s.yearInit || s.yearEnd) && <p style={{ fontSize: '.72rem', color: 'var(--gray-400)', marginTop: '.1rem' }}>{s.yearInit}{s.yearEnd ? ` – ${s.yearEnd}` : ' – present'}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Edit profile modal */}
      {showEditProfile && (
        <Modal title="Edit profile" onClose={() => setShowEditProfile(false)} width="600px">
          <div className="form-group"><label>Full name</label>
            <input value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))} />
          </div>
          <div className="form-group"><label>Research line</label>
            <select value={profileForm.researchLine} onChange={e => setProfileForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Research interests</label>
            <input value={profileForm.researchInterests} onChange={e => setProfileForm(f => ({ ...f, researchInterests: e.target.value }))} />
          </div>
          <div className="form-group"><label>Biography</label>
            <textarea rows={4} value={profileForm.biography} onChange={e => setProfileForm(f => ({ ...f, biography: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Google Scholar URL</label>
              <input type="url" value={profileForm.googleScholarUrl} onChange={e => setProfileForm(f => ({ ...f, googleScholarUrl: e.target.value }))} />
            </div>
            <div className="form-group"><label>CvLAC URL</label>
              <input type="url" value={profileForm.cvlacUrl} onChange={e => setProfileForm(f => ({ ...f, cvlacUrl: e.target.value }))} />
            </div>
          </div>
          <ImageUpload label="Profile photo" value={profileForm.profilePictureUrl} onChange={url => setProfileForm(f => ({ ...f, profilePictureUrl: url }))} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => setShowEditProfile(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit publication modal */}
      {showPubForm && (
        <Modal title={editPub ? 'Edit publication' : 'Add publication'} onClose={() => setShowPubForm(false)} width="640px">
          <div className="form-group"><label>Citation</label>
            <textarea rows={3} value={pubForm.citation} onChange={e => setPubForm(f => ({ ...f, citation: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Year</label>
              <input value={pubForm.year} onChange={e => setPubForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div className="form-group"><label>Type</label>
              <select value={pubForm.type} onChange={e => setPubForm(f => ({ ...f, type: e.target.value }))}>
                <option value="JOURNAL ARTICLES">Journal article</option>
                <option value="CONFERENCE PAPERS">Conference paper</option>
                <option value="BOOK CHAPTERS">Book chapter</option>
                <option value="THESIS">Thesis</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group"><label>DOI</label>
              <input value={pubForm.doi} onChange={e => setPubForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.1109/…" />
            </div>
          </div>
          <div className="form-group"><label>Research line</label>
            <select value={pubForm.researchLine} onChange={e => setPubForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>PDF URL</label>
            <input type="url" value={pubForm.paperUrl} onChange={e => setPubForm(f => ({ ...f, paperUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <PeopleSelector
            label="Authors"
            people={allPeople}
            selected={pubForm.userIds}
            onChange={ids => setPubForm(f => ({ ...f, userIds: ids }))}
          />
          <div className="form-group"><label>BibTeX</label>
            <textarea rows={3} value={pubForm.bibtexCitation} onChange={e => setPubForm(f => ({ ...f, bibtexCitation: e.target.value }))} style={{ fontFamily: 'monospace', fontSize: '.8rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowPubForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSavePub} disabled={savingPub || !pubForm.citation}>
              {savingPub ? 'Saving…' : editPub ? 'Update' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit project modal */}
      {showProjForm && (
        <Modal title={editProj ? 'Edit project' : 'Add project'} onClose={() => setShowProjForm(false)} width="640px">
          <div className="form-group"><label>Title</label>
            <input value={projForm.title} onChange={e => setProjForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group"><label>Description</label>
            <textarea rows={4} value={projForm.description} onChange={e => setProjForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Code ID</label>
              <input value={projForm.codeId} onChange={e => setProjForm(f => ({ ...f, codeId: e.target.value }))} />
            </div>
            <div className="form-group"><label>Budget</label>
              <input type="number" value={projForm.budget} onChange={e => setProjForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="form-group"><label>Start date</label>
              <input type="date" value={projForm.dateInit} onChange={e => setProjForm(f => ({ ...f, dateInit: e.target.value }))} />
            </div>
            <div className="form-group"><label>End date</label>
              <input type="date" value={projForm.dateEnd} onChange={e => setProjForm(f => ({ ...f, dateEnd: e.target.value }))} />
            </div>
          </div>
          <div className="form-group"><label>Funding agency</label>
            <input value={projForm.fundingAgency} onChange={e => setProjForm(f => ({ ...f, fundingAgency: e.target.value }))} />
          </div>
          <div className="form-group"><label>Research line</label>
            <select value={projForm.researchLine} onChange={e => setProjForm(f => ({ ...f, researchLine: e.target.value }))}>
              {RL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <PeopleSelector
            label="Team members"
            people={allPeople}
            selected={projForm.userIds}
            onChange={ids => setProjForm(f => ({ ...f, userIds: ids }))}
          />
          <div className="form-group"><label>File URL</label>
            <input type="url" value={projForm.fileUrl} onChange={e => setProjForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowProjForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveProj} disabled={savingProj || !projForm.title}>
              {savingProj ? 'Saving…' : editProj ? 'Update' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deletePub && (
        <ConfirmDialog
          message={`Delete publication "${deletePub.citation.slice(0, 80)}…"?`}
          onConfirm={handleDeletePub}
          onCancel={() => setDeletePub(null)}
          loading={deletingPub}
        />
      )}
      {deleteProj && (
        <ConfirmDialog
          message={`Delete project "${deleteProj.title}"?`}
          onConfirm={handleDeleteProj}
          onCancel={() => setDeleteProj(null)}
          loading={deletingProj}
        />
      )}
    </>
  )
}
