'use client'

import { useState, useEffect } from 'react'

type Lecture = {
  id: number
  title: string
  description?: string
  professor?: string
  semester?: string
  undergrad: boolean
  fileUrl?: string
  linkUrl?: string
}

const TABS = [{ label: 'Undergraduate' }, { label: 'Postgraduate' }]

export default function LecturesPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/lectures?undergrad=${activeTab === 0}`)
      .then(r => r.json())
      .then(({ data }) => { setLectures(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeTab])

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Lectures</h1>
          <p>Course materials and resources from GITA researchers.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="menu-tabs">
        <ul className="menu-tabs-inner container" style={{ padding: 0 }}>
          {TABS.map((t, i) => (
            <li key={t.label}>
              <button
                className={`menu-tab-btn ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {loading ? (
          <p className="text-muted">Loading lectures…</p>
        ) : lectures.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>
            No {TABS[activeTab].label.toLowerCase()} lectures added yet.
          </p>
        ) : (
          <div className="card-grid">
            {lectures.map(lecture => (
              <div className="card card-hover" key={lecture.id}>
                {/* Header bar */}
                <div style={{ background: 'var(--green-800)', margin: '-1.5rem -1.5rem 1rem', padding: '.75rem 1.25rem', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: '.68rem' }}>
                    {activeTab === 0 ? 'Undergraduate' : 'Postgraduate'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', marginBottom: '.4rem' }}>{lecture.title}</h3>

                {lecture.professor && (
                  <p className="text-sm text-muted" style={{ marginBottom: '.4rem' }}>
                    👤 {lecture.professor}
                  </p>
                )}
                {lecture.semester && (
                  <p className="text-sm text-muted" style={{ marginBottom: '.75rem' }}>
                    📅 {lecture.semester}
                  </p>
                )}
                {lecture.description && (
                  <p className="text-sm" style={{ color: 'var(--gray-600)', fontWeight: 300, marginBottom: '1rem' }}>
                    {lecture.description.slice(0, 140)}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                  {lecture.fileUrl && (
                    <a href={lecture.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      📄 Download
                    </a>
                  )}
                  {lecture.linkUrl && (
                    <a href={lecture.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: 'var(--color-info-lt)', color: 'var(--color-info)' }}>
                      🔗 Open link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
