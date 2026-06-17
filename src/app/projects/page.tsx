'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PeopleSelector from '@/components/admin/PeopleSelector'
import { useLang } from '@/lib/i18n/LangContext'
import ResearchLineCarousel from '@/components/ResearchLineCarousel'

type Project = {
  id: number; title: string; description: string
  dateInit?: string; dateEnd?: string; budget?: number
  fileUrl?: string; codeId?: string; fundingAgency?: string; researchLine: string
}
type FormData = { title: string; description: string; dateInit: string; dateEnd: string; budget: string; fileUrl: string; codeId: string; fundingAgency: string; researchLine: string; userIds: number[] }

const TABS = [
  { id: 'PATTERN ANALYSIS AND SIGNAL PROCESSING' },
  { id: 'COMMUNICATIONS SYSTEMS MODELING' },
  { id: 'OPTICAL COMMUNICATIONS' },
]
const TAG_MAP: Record<string, string> = {
  'PATTERN ANALYSIS AND SIGNAL PROCESSING': 'pattern_analysis_and_signal_processing',
  'COMMUNICATIONS SYSTEMS MODELING': 'communications_systems_modeling',
  'OPTICAL COMMUNICATIONS': 'optical_communications',
}

const CAROUSEL_DATA = [
  {
    slides: [
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal.jpeg',  caption: 'Speech assessment' },
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal2.jpg',  caption: 'Signal processing' },
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal3.png',  caption: 'Gait analysis' },
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal4.png',  caption: 'Handwriting analysis' },
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal5.png',  caption: 'Neural networks' },
      { img: '/images/publications/patternAnalysisAndSignalProcessing/signal6.jpg',  caption: 'Pattern recognition' },
    ],
    contact: { name: 'Juan Rafael Orozco Arroyave', email: 'rafael.orozco@udea.edu.co', phone: '+(574) 2198523', office: 'Office 18-339B' },
  },
  {
    slides: [
      { img: '/images/publications/communicationSystemsModeling/modeling1.png', caption: 'Network architecture' },
      { img: '/images/publications/communicationSystemsModeling/modeling2.png', caption: 'Traffic modeling' },
      { img: '/images/publications/communicationSystemsModeling/modeling3.png', caption: 'Network planning' },
    ],
    contact: { name: 'Juan Felipe Botero Vega', email: 'juanf.botero@udea.edu.co', phone: '+(574) 2198566', office: 'Office 19-448' },
  },
  {
    slides: [
      { img: '/images/publications/opticalCommunications/optical1.png',  caption: 'Optical fiber' },
      { img: '/images/publications/opticalCommunications/optical2.png',  caption: 'Photonic networks' },
      { img: '/images/publications/opticalCommunications/optical3.jpeg', caption: 'Optical communications' },
      { img: '/images/publications/opticalCommunications/optical5.png',  caption: 'WDM systems' },
      { img: '/images/publications/opticalCommunications/optics.jpeg',   caption: 'Fiber optics' },
    ],
    contact: { name: 'Juan Zapata', email: 'juan.zapata@udea.edu.co', phone: '+(574) 2198523', office: 'Office 18-310' },
  },
]

const EMPTY: FormData = { title: '', description: '', dateInit: '', dateEnd: '', budget: '', fileUrl: '', codeId: '', fundingAgency: '', researchLine: 'PATTERN ANALYSIS AND SIGNAL PROCESSING', userIds: [] }

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const { t } = useLang()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const [activeTab, setActiveTab]       = useState(0)
  const [projects, setProjects]         = useState<Project[]>([])
  const [loading, setLoading]           = useState(true)
  const [sortBy, setSortBy]         = useState<'newest' | 'oldest'>('newest')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [form, setForm]                 = useState<FormData>(EMPTY)

  const [professors, setProfessors] = useState<{id:number; name:string}[]>([])

  useEffect(() => {
    fetch('/api/people').then(r => r.json()).then(({ data }) =>
      setProfessors((data || []).map((p: any) => ({ id: p.id, name: p.fullName })))
    )
  }, [])

  const TAB_LABELS = [t.rl.pattern, t.rl.comms, t.rl.optical]
  const TAB_DESCS  = [t.rl.pattern_desc, t.rl.comms_desc, t.rl.optical_desc]

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/projects?researchLine=${TAG_MAP[TABS[activeTab].id]}`)
      .then(r => r.json()).then(({ data }) => { setProjects(data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [activeTab])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setEditTarget(null); setForm({ ...EMPTY, researchLine: TABS[activeTab].id }); setShowForm(true) }
  const openEdit = (p: Project) => { setEditTarget(p); setForm({ title: p.title, description: p.description, dateInit: p.dateInit || '', dateEnd: p.dateEnd || '', budget: p.budget ? String(p.budget) : '', fileUrl: p.fileUrl || '', codeId: p.codeId || '', fundingAgency: p.fundingAgency || '', researchLine: p.researchLine, userIds: [] }); setShowForm(true) }
  const handleSave = async () => { setSaving(true); const method = editTarget ? 'PUT' : 'POST'; const url = editTarget ? `/api/projects/${editTarget.id}` : '/api/projects'; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); setSaving(false); setShowForm(false); load() }
  const handleDelete = async () => { if (!deleteTarget) return; setDeleting(true); await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' }); setDeleting(false); setDeleteTarget(null); load() }

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      if (filterStatus === 'active') return !p.dateEnd || new Date(p.dateEnd) >= new Date()
      if (filterStatus === 'completed') return p.dateEnd && new Date(p.dateEnd) < new Date()
      return true
    })
    .sort((a, b) => {
      const da = a.dateInit ? new Date(a.dateInit).getTime() : 0
      const db = b.dateInit ? new Date(b.dateInit).getTime() : 0
      return sortBy === 'newest' ? db - da : da - db
    })

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{t.projects.title}</h1>
          <p>{t.projects.subtitle}</p>
        </div>
      </div>

      <div className="menu-tabs">
        <ul className="menu-tabs-inner container" style={{ padding: 0 }}>
          {TABS.map((tb, i) => (
            <li key={tb.id}>
              <button className={`menu-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                {TAB_LABELS[i]}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Carousel */}
        <ResearchLineCarousel
          title={TAB_LABELS[activeTab]}
          description={TAB_DESCS[activeTab]}
          slides={CAROUSEL_DATA[activeTab].slides}
          contact={CAROUSEL_DATA[activeTab].contact}
        />

        {isAdmin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={openAdd}>Add project</button>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            {(['all', 'active', 'completed'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '.78rem', fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: filterStatus === s ? 'var(--green-700)' : 'var(--color-border)',
                background:  filterStatus === s ? 'var(--green-700)' : '#fff',
                color:       filterStatus === s ? '#fff' : 'var(--gray-500)',
              }}>
                {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Completed'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')} style={{ fontSize: '.8rem', padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>No projects found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredProjects.map(project => {
              const fmtDate = (d?: string) => {
                if (!d) return ''
                const [y, m] = d.split('-')
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                return m ? `${months[parseInt(m,10)-1]} ${y}` : y
              }
              const hasDesc = project.description?.trim() && project.description.trim() !== project.title?.trim()
              return (
                <div key={project.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 220px',
                  background: 'var(--white)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)' }}
                >
                  <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {project.codeId && (
                        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)', padding: '2px 8px', borderRadius: '4px', marginBottom: '.5rem', letterSpacing: '.03em' }}>
                          {project.codeId}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1rem', lineHeight: 1.45, margin: 0 }}>{project.title}</h3>
                      {hasDesc && (
                        <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', lineHeight: 1.6, marginTop: '.5rem' }}>{project.description}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
                        <button onClick={() => openEdit(project)} style={{ fontSize: '.72rem', color: '#92400e', background: '#fef3c7', padding: '3px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>✏️ Editar</button>
                        <button onClick={() => setDeleteTarget(project)} style={{ fontSize: '.72rem', color: '#991b1b', background: '#fee2e2', padding: '3px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>🗑️ Eliminar</button>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem', background: 'var(--green-50, #f0fdf4)', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {(project.dateInit || project.dateEnd) && (
                      <div>
                        <p style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: '.15rem', fontWeight: 700 }}>Período</p>
                        <p style={{ fontSize: '.82rem', color: 'var(--gray-800)', fontWeight: 500 }}>{fmtDate(project.dateInit)}{project.dateInit && project.dateEnd ? ' – ' : ''}{fmtDate(project.dateEnd)}</p>
                      </div>
                    )}
                    {project.fundingAgency && (
                      <div>
                        <p style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: '.15rem', fontWeight: 700 }}>Funded by</p>
                        <p style={{ fontSize: '.82rem', color: 'var(--gray-800)' }}>{project.fundingAgency}</p>
                      </div>
                    )}
                    {project.budget && (
                      <div>
                        <p style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: '.15rem', fontWeight: 700 }}>Budget</p>
                        <p style={{ fontSize: '.82rem', color: 'var(--gray-800)' }}>{Number(project.budget).toLocaleString()} COP</p>
                      </div>
                    )}
                    {project.fileUrl && (
                      <a href={project.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: '#1e40af', background: '#dbeafe', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: 500, marginTop: 'auto', textAlign: 'center' as const }}>
                        📄 See file
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editTarget ? t.projects.edit : t.projects.add} onClose={() => setShowForm(false)} width="640px">
          <div className="form-group"><label>{t.projects.form.title}</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label>{t.projects.form.description}</label><textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.projects.form.code_id}</label><input value={form.codeId} onChange={e => setForm(f => ({ ...f, codeId: e.target.value }))} /></div>
            <div className="form-group"><label>{t.projects.form.budget}</label><input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
            <div className="form-group"><label>{t.projects.form.date_init}</label><input type="date" value={form.dateInit} onChange={e => setForm(f => ({ ...f, dateInit: e.target.value }))} /></div>
            <div className="form-group"><label>{t.projects.form.date_end}</label><input type="date" value={form.dateEnd} onChange={e => setForm(f => ({ ...f, dateEnd: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>{t.projects.form.funding}</label><input value={form.fundingAgency} onChange={e => setForm(f => ({ ...f, fundingAgency: e.target.value }))} /></div>
          <div className="form-group"><label>{t.projects.form.research_line}</label>
            <select value={form.researchLine} onChange={e => setForm(f => ({ ...f, researchLine: e.target.value }))}>
              {TABS.map((tb, i) => <option key={tb.id} value={tb.id}>{TAB_LABELS[i]}</option>)}
            </select>
          </div>
          <PeopleSelector
            label="Investigadores GITA"
            people={professors}
            selected={form.userIds}
            onChange={ids => setForm(f => ({ ...f, userIds: ids }))}
          />
          <div className="form-group"><label>{t.projects.form.file_url}</label><input type="url" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://…" /></div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>{t.projects.form.cancel}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title || !form.description}>
              {saving ? t.common.loading : editTarget ? t.projects.form.update : t.projects.form.save}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog message={`${t.projects.delete_confirm} "${deleteTarget.title}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </>
  )
}
