'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PeopleSelector from '@/components/admin/PeopleSelector'
import { useLang } from '@/lib/i18n/LangContext'
import ResearchLineCarousel from '@/components/ResearchLineCarousel'

type Publication = {
  _id: string; citation: string; year: string; yearShort: string
  paperUrl?: string; pdfUrl?: string; bibtexCitation?: string
  researchLine: string; type: string; doi?: string; userIds?: number[]
}
type FormData = { citation: string; year: string; type: string; researchLine: string; paperUrl: string; bibtexCitation: string; doi: string; userIds: number[] }

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

const EMPTY: FormData = { citation: '', year: String(new Date().getFullYear()), type: 'JOURNAL ARTICLES', researchLine: 'PATTERN ANALYSIS AND SIGNAL PROCESSING', paperUrl: '', bibtexCitation: '', doi: '', userIds: [] }

export default function PublicationsPage() {
  const { data: session, status } = useSession()
  const { t } = useLang()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const [activeTab, setActiveTab]       = useState(0)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (!tab) return
    const idx = TABS.findIndex(t => TAG_MAP[t.id] === tab)
    if (idx >= 0) setActiveTab(idx)
  }, [])
  const [allPeople, setAllPeople]       = useState<{id:number; name:string}[]>([])
  const [pubs, setPubs]                 = useState<Publication[]>([])
  const [loading, setLoading]           = useState(true)
  const [openYears, setOpenYears]       = useState<Record<string, boolean>>({})
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState<Publication | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [form, setForm]                 = useState<FormData>(EMPTY)

  const [sortBy, setSortBy] = useState<'year' | 'type'>('year')

  useEffect(() => {
    fetch('/api/people').then(r => r.json()).then(({ data }) => {
      setAllPeople((data || []).map((p: any) => ({ id: p.id, name: p.fullName })))
    })
  }, [])

  const TAB_LABELS = [t.rl.pattern, t.rl.comms, t.rl.optical]
  const TAB_DESCS  = [t.rl.pattern_desc, t.rl.comms_desc, t.rl.optical_desc]

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/publications?tag=${TAG_MAP[TABS[activeTab].id]}`)
      .then(r => r.json())
      .then(({ data }) => {
        setPubs(data || [])
        if (data?.length) {
          const years = Array.from(new Set((data as Publication[]).map((p: Publication) => p.yearShort || String(p.year ?? '').slice(0,4)))).sort((a, b) => Number(b) - Number(a)) as string[]
          setOpenYears({ [years[0]]: true })
        }
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [activeTab])

  useEffect(() => { load() }, [load])

  // Extract 4-digit year - use yearShort from API or slice
  const getYear = (y: string) => String(y ?? '').slice(0, 4) || 'Unknown'

  const TYPE_ORDER: Record<string, number> = {
    'JOURNAL ARTICLES': 0, 'CONFERENCE ARTICLES': 1,
    'BOOK CHAPTERS & LECTURE NOTES': 2, 'BOOKS': 3,
  }
  const TYPE_LABEL: Record<string, string> = {
    'JOURNAL ARTICLES': 'Journal Articles',
    'CONFERENCE ARTICLES': 'Conference Articles',
    'BOOK CHAPTERS & LECTURE NOTES': 'Book Chapters & Lecture Notes',
    'BOOKS': 'Books',
  }

  const byYear: Record<string, Publication[]> = {}
  if (sortBy === 'year') {
    pubs.forEach(p => { const y = p.yearShort || getYear(p.year); if (!byYear[y]) byYear[y] = []; byYear[y].push(p) })
  } else {
    pubs.forEach(p => { const k = p.type || 'Other'; if (!byYear[k]) byYear[k] = []; byYear[k].push(p) })
  }
  const sortedYears = sortBy === 'year'
    ? Object.keys(byYear).sort((a, b) => Number(b) - Number(a))
    : Object.keys(byYear).sort((a, b) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99))

  const openAdd  = () => { setEditTarget(null); setForm({ ...EMPTY, researchLine: TABS[activeTab].id }); setShowForm(true) }
  const openEdit = (p: Publication) => { setEditTarget(p); setForm({ citation: p.citation, year: p.yearShort || getYear(p.year), type: p.type || 'JOURNAL ARTICLES', researchLine: p.researchLine, paperUrl: p.paperUrl || p.pdfUrl || '', bibtexCitation: p.bibtexCitation || '', doi: p.doi || '', userIds: p.userIds || [] }); setShowForm(true) }
  const handleSave = async () => { setSaving(true); const method = editTarget ? 'PUT' : 'POST'; const url = editTarget ? `/api/publications/${editTarget._id}` : '/api/publications'; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, doi: form.doi || null }) }); setSaving(false); setShowForm(false); load() }
  const handleDelete = async () => { if (!deleteTarget) return; setDeleting(true); await fetch(`/api/publications/${deleteTarget._id}`, { method: 'DELETE' }); setDeleting(false); setDeleteTarget(null); load() }

  const extractJournal = (citation: string): string => {
    // Match text after closing quote/speech mark, before Vol./No./pp./year or end
    const m = citation.match(/[\u201c""]([^\u201d""]+)[\u201d""],?\s+([A-Z][^,\.0-9(]{3,60?})/)
    if (m && m[2]) {
      const journal = m[2].trim().replace(/[,.]$/, '').trim()
      // Exclude common non-journal phrases
      if (/^(under review|in press|submitted|accepted)/i.test(journal)) return ''
      return journal
    }
    return ''
  }

  const extractDOI = (citation: string): string => {
    const m = citation.match(/10\.\d{4,}\/[^\s,)\]]+/)
    return m ? m[0].replace(/[.,]$/, '') : ''
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{t.publications.title}</h1>
          <p>{t.publications.subtitle}</p>
        </div>
      </div>

      {/* Research line tabs */}
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

        {/* Admin add button */}
        {isAdmin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={openAdd}>{t.publications.add}</button>
          </div>
        )}

        {/* Sort controls */}
        {!loading && sortedYears.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginRight: '.25rem' }}>{t.publications.sort_by}:</span>
            {(['year', 'type'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                fontSize: '.8rem', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: sortBy === s ? 'var(--green-700)' : 'var(--gray-100)',
                color: sortBy === s ? '#fff' : 'var(--gray-600)',
                transition: 'all .15s',
              }}>
                {s === 'year' ? `📅 ${t.publications.sort_year}` : `🏷️ ${t.publications.sort_type}`}
              </button>
            ))}
          </div>
        )}

        {/* Publications list */}
        {loading ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>{t.publications.loading}</p>
        ) : sortedYears.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>{t.publications.no_results}</p>
        ) : (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            {sortedYears.map(year => (
              <div key={year} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* Year header */}
                <button
                  onClick={() => setOpenYears(p => ({ ...p, [year]: !p[year] }))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '.9rem 1.25rem', background: openYears[year] ? 'var(--green-50, #f0fdf4)' : 'var(--color-surface)',
                    border: 'none', cursor: 'pointer', transition: 'background .15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-800)', fontFamily: 'var(--font-news)' }}>
                      {sortBy === 'type' ? (TYPE_LABEL[year] || year) : year}
                    </span>
                    <span style={{ background: 'var(--green-700)', color: '#fff', fontSize: '.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                      {byYear[year].length} {byYear[year].length === 1 ? 'pub.' : 'pubs.'}
                    </span>
                  </div>
                  <span style={{ color: 'var(--green-700)', fontSize: '.85rem', fontWeight: 600 }}>{openYears[year] ? '▲' : '▼'}</span>
                </button>

                {/* Publications for this year */}
                {openYears[year] && (
                  <div>
                    {byYear[year].map((pub, idx) => {
                      const typeColors: Record<string, { bg: string; color: string }> = {
                        'JOURNAL ARTICLES':              { bg: '#dbeafe', color: '#1e40af' },
                        'CONFERENCE ARTICLES':           { bg: '#fef3c7', color: '#92400e' },
                        'BOOK CHAPTERS & LECTURE NOTES': { bg: '#ede9fe', color: '#5b21b6' },
                        'BOOKS':                         { bg: '#d1fae5', color: '#065f46' },
                      }
                      const tc = typeColors[pub.type] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' }
                      const typeLabel: Record<string, string> = {
                        'JOURNAL ARTICLES': 'Journal',
                        'CONFERENCE ARTICLES': 'Conference',
                        'BOOK CHAPTERS & LECTURE NOTES': 'Book Chapter',
                        'BOOKS': 'Book',
                      }
                      return (
                        <div key={pub._id} style={{
                          display: 'flex', gap: '1rem', padding: '1rem 1.25rem',
                          borderTop: '1px solid var(--color-border)',
                          background: '#fff',
                          alignItems: 'flex-start',
                          transition: 'background .1s',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafff9' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
                        >
                          {/* Index */}
                          <span style={{
                            flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--green-100)', color: 'var(--green-800)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.75rem', fontWeight: 700, marginTop: '2px',
                          }}>{idx + 1}</span>

                          {/* Citation + type */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: '.5rem' }}>
                              {pub.type && (
                                <span style={{
                                  display: 'inline-block', fontSize: '.7rem', fontWeight: 600,
                                  padding: '2px 8px', borderRadius: '4px', marginBottom: '.4rem',
                                  background: tc.bg, color: tc.color, letterSpacing: '.02em',
                                }}>
                                  {typeLabel[pub.type] || pub.type}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--gray-800)', margin: 0 }}>
                              {pub.citation}
                            </p>
                            {extractJournal(pub.citation) && (
                              <p style={{ fontSize: '.78rem', color: 'var(--green-700)', fontStyle: 'italic', marginTop: '.3rem', fontWeight: 500 }}>
                                📰 {extractJournal(pub.citation)}
                              </p>
                            )}
                            {(pub.doi || extractDOI(pub.citation)) && (
                              <a href={'https://doi.org/' + (pub.doi || extractDOI(pub.citation))} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '.75rem', color: '#1e40af', display: 'inline-block', marginTop: '.2rem' }}>
                                🔗 DOI: {pub.doi || extractDOI(pub.citation)}
                              </a>
                            )}
                            {/* Actions inline below citation */}
                            {(pub.pdfUrl || pub.bibtexCitation || isAdmin) && (
                              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                {(pub.paperUrl || pub.pdfUrl) && (
                                  <a href={pub.paperUrl || pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: '.75rem', color: '#1e40af', background: '#dbeafe', padding: '3px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: 500 }}>
                                    📄 PDF
                                  </a>
                                )}
                                {pub.bibtexCitation && pub.bibtexCitation !== 'None' && pub.bibtexCitation.trim().startsWith('@') && (
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(pub.bibtexCitation!); alert(t.common.copied) }}
                                    style={{ fontSize: '.75rem', color: 'var(--gray-600)', background: 'var(--gray-100)', padding: '3px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                    📋 BibTeX
                                  </button>
                                )}
                                {isAdmin && (
                                  <>
                                    <button onClick={() => openEdit(pub)}
                                      style={{ fontSize: '.75rem', color: '#92400e', background: '#fef3c7', padding: '3px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                      ✏️ Editar
                                    </button>
                                    <button onClick={() => setDeleteTarget(pub)}
                                      style={{ fontSize: '.75rem', color: '#991b1b', background: '#fee2e2', padding: '3px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                      🗑️ Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editTarget ? t.publications.edit : t.publications.add} onClose={() => setShowForm(false)} width="640px">
          <div className="form-group"><label>{t.publications.form.citation}</label><textarea rows={4} value={form.citation} onChange={e => setForm(f => ({ ...f, citation: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.publications.form.year}</label><input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
            <div className="form-group"><label>{t.publications.form.type}</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="journal">{t.publications.type_journal}</option>
                <option value="conference">{t.publications.type_conference}</option>
                <option value="book">{t.publications.type_book}</option>
                <option value="thesis">{t.publications.type_thesis}</option>
                <option value="other">{t.publications.type_other}</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>{t.publications.form.research_line}</label>
            <select value={form.researchLine} onChange={e => setForm(f => ({ ...f, researchLine: e.target.value }))}>
              {TABS.map((tb, i) => <option key={tb.id} value={tb.id}>{TAB_LABELS[i]}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>{t.publications.form.pdf_url}</label><input type="url" value={form.paperUrl} onChange={e => setForm(f => ({ ...f, paperUrl: e.target.value }))} placeholder="https://…" /></div>
            <div className="form-group"><label>DOI</label><input type="text" value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.1109/…" /></div>
          </div>
          <PeopleSelector
            label="Autores del grupo GITA"
            people={allPeople}
            selected={form.userIds}
            onChange={ids => setForm(f => ({ ...f, userIds: ids }))}
          />
          <div className="form-group"><label>{t.publications.form.bibtex}</label><textarea rows={3} value={form.bibtexCitation} onChange={e => setForm(f => ({ ...f, bibtexCitation: e.target.value }))} style={{ fontFamily: 'monospace', fontSize: '.8rem' }} /></div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>{t.publications.form.cancel}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.citation}>
              {saving ? t.common.loading : editTarget ? t.publications.form.update : t.publications.form.save}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog message={`${t.publications.delete_confirm} "${deleteTarget.citation?.slice(0, 80)}…"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </>
  )
}
