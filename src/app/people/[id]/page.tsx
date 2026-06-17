'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

type Professor = {
  id: number; fullName: string; name?: string; email: string; biography?: string
  profilePictureUrl?: string; googleScholarUrl?: string; cvlacUrl?: string
  researchInterests?: string; researchLine: string; admin: boolean
}
type Publication = { _id: string; citation: string; yearShort: string; type: string; paperUrl?: string }
type Project     = { id: number; title: string; dateInit?: string; dateEnd?: string; fundingAgency?: string; codeId?: string }
type Student     = { id: number; fullName: string; email: string; type: string; yearInit?: string; yearEnd?: string; pictureUrl?: string; active: boolean }

const TYPE_ORDER = ['phd', 'master', 'undergraduate', 'alumni', 'member']
const TYPE_LABEL: Record<string, string> = { 'phd': 'PhD Students', 'master': "Master's Students", 'undergraduate': 'Undergraduate', 'alumni': 'Alumni', 'member': 'Member' }

function initials(name: string) { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }

function fmtDate(d?: string) {
  if (!d) return ''
  const [y, m] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return m ? `${months[parseInt(m,10)-1]} ${y}` : y
}

export default function ProfessorProfilePage() {
  const { id } = useParams()
  const { t } = useLang()
  const [professor, setProfessor]   = useState<Professor | null>(null)
  const [publications, setPublications] = useState<Publication[]>([])
  const [projects, setProjects]     = useState<Project[]>([])
  const [students, setStudents]     = useState<Student[]>([])
  const [stats, setStats]           = useState({ publications: 0, projects: 0, students: 0 })
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'students' | 'publications' | 'projects'>('students')

  useEffect(() => {
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
  }, [id])

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><p className="text-muted">Loading…</p></div>
  if (!professor) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><p className="text-muted">Professor not found.</p></div>

  const studentsByType = TYPE_ORDER.map(type => ({
    type,
    label: TYPE_LABEL[type],
    list: students.filter(s => s.type === type)
  })).filter(g => g.list.length > 0)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Link href="/people" style={{ color: 'rgba(255,255,255,.7)', fontSize: '.875rem' }}>← {t.people.title}</Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Profile card */}
        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '2rem', padding: '2rem' }}>
          {professor.profilePictureUrl
            ? <img src={professor.profilePictureUrl} alt={professor.fullName || professor.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> // eslint-disable-line
            : <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--green-700)', flexShrink: 0 }}>{initials(professor.fullName || professor.name || "")}</div>
          }
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '.25rem' }}>{professor.fullName || professor.name}</h1>
            <p style={{ color: 'var(--green-700)', marginBottom: '.5rem' }}>{professor.researchLine}</p>
            <a href={`mailto:${professor.email}`} style={{ color: 'var(--gray-500)', fontSize: '.875rem', display: 'block', marginBottom: '.75rem' }}>{professor.email}</a>
            {professor.researchInterests && <p className="text-sm" style={{ marginBottom: '.75rem' }}><strong>Research interests:</strong> {professor.researchInterests}</p>}
            {professor.biography && <p style={{ fontSize: '.9rem', lineHeight: 1.7, color: 'var(--gray-600)', marginBottom: '1rem' }}>{professor.biography}</p>}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {professor.googleScholarUrl && <a href={professor.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Google Scholar</a>}
              {professor.cvlacUrl && <a href={professor.cvlacUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">CvLAC</a>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Publications', value: stats.publications, tab: 'publications' as const },
            { label: 'Projects',     value: stats.projects,     tab: 'projects' as const },
            { label: 'Students',     value: stats.students,     tab: 'students' as const },
          ].map(({ label, value, tab }) => (
            <button key={label} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'var(--green-700)' : 'var(--white)',
              color: activeTab === tab ? '#fff' : 'var(--gray-700)',
              border: `1px solid ${activeTab === tab ? 'var(--green-700)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
              transition: 'all .2s',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-news)' }}>{value}</div>
              <div style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '.25rem', opacity: .8 }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Students tab */}
        {activeTab === 'students' && (
          <div>
            {studentsByType.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No students found.</p>
            ) : studentsByType.map(({ type, label, list }) => (
              <div key={type} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green-800)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {label} <span style={{ background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '.75rem', padding: '2px 8px', borderRadius: '20px', marginLeft: '.5rem' }}>{list.length}</span>
                </h3>
                <div className="card-grid">
                  {list.map(s => (
                    <div className="card" key={s.id} style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                      {s.pictureUrl
                        ? <img src={s.pictureUrl} alt={s.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> // eslint-disable-line
                        : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--green-700)', flexShrink: 0 }}>{initials(s.fullName)}</div>
                      }
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.1rem' }}>{s.fullName}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{s.email}</p>
                        {(s.yearInit || s.yearEnd) && <p style={{ fontSize: '.72rem', color: 'var(--gray-400)', marginTop: '.1rem' }}>{s.yearInit}{s.yearEnd ? ` – ${s.yearEnd}` : ' – present'}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Publications tab */}
        {activeTab === 'publications' && (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {publications.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No publications found.</p>
            ) : publications.map((pub, idx) => (
              <div key={pub._id} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', background: '#fff', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700 }}>{idx + 1}</span>
                <div style={{ flex: 1 }}>
                  {pub.type && <span style={{ fontSize: '.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', display: 'inline-block', marginBottom: '.3rem' }}>{pub.type}</span>}
                  <p style={{ fontSize: '.875rem', lineHeight: 1.6 }}>{pub.citation}</p>
                  {pub.paperUrl && <a href={pub.paperUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.75rem', color: '#1e40af', marginTop: '.3rem', display: 'inline-block' }}>📄 PDF</a>}
                </div>
                <span style={{ fontSize: '.75rem', color: 'var(--gray-400)', flexShrink: 0 }}>{pub.yearShort}</span>
              </div>
            ))}
          </div>
        )}

        {/* Projects tab */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No projects found.</p>
            ) : projects.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px', background: 'var(--white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid var(--color-border)' }}>
                  {p.codeId && <span style={{ fontSize: '.7rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '.5rem' }}>{p.codeId}</span>}
                  <h3 style={{ fontSize: '1rem', lineHeight: 1.4 }}>{p.title}</h3>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--green-50)', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {(p.dateInit || p.dateEnd) && <p style={{ fontSize: '.82rem' }}>{fmtDate(p.dateInit)} – {fmtDate(p.dateEnd)}</p>}
                  {p.fundingAgency && <p style={{ fontSize: '.82rem', color: 'var(--gray-600)' }}>{p.fundingAgency}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
