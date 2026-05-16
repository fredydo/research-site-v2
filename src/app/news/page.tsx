'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import Modal from '@/components/admin/Modal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useLang } from '@/lib/i18n/LangContext'

type NewsItem = { id: string; title: string; content: string; imageUrl?: string; documentUrl?: string; author?: string; createdAt: string }
type FormData = { title: string; content: string; pictureUrl: string; documentUrl: string }
const EMPTY: FormData = { title: '', content: '', pictureUrl: '', documentUrl: '' }

export default function NewsPage() {
  const { data: session, status } = useSession()
  const { t } = useLang()
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin'

  const [news, setNews]             = useState<NewsItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editTarget, setEditTarget] = useState<NewsItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [form, setForm]             = useState<FormData>(EMPTY)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/news').then(r => r.json()).then(({ data }) => { setNews(data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const s = document.createElement('script')
    s.setAttribute('src', 'https://platform.twitter.com/widgets.js')
    s.setAttribute('async', 'true')
    document.head.appendChild(s)
  }, [])

  const openAdd  = () => { setEditTarget(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (item: NewsItem) => { setEditTarget(item); setForm({ title: item.title, content: item.content, pictureUrl: item.imageUrl || '', documentUrl: item.documentUrl || '' }); setShowForm(true) }
  const handleSave = async () => { setSaving(true); const method = editTarget ? 'PUT' : 'POST'; const url = editTarget ? `/api/news/${editTarget.id}` : '/api/news'; await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); setSaving(false); setShowForm(false); load() }
  const handleDelete = async () => { if (!deleteTarget) return; setDeleting(true); await fetch(`/api/news/${deleteTarget.id}`, { method: 'DELETE' }); setDeleting(false); setDeleteTarget(null); load() }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{t.news.title}</h1>
          <p>{t.news.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {isAdmin && <div style={{ marginBottom: '1.5rem' }}><button className="btn btn-primary" onClick={openAdd}>{t.news.add}</button></div>}

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? <p className="text-muted">{t.news.loading}</p>
            : news.length === 0 ? <p className="text-muted text-center" style={{ padding: '3rem' }}>{t.news.no_results}</p>
            : news.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', background: 'var(--white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} style={{ width: '160px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ padding: '1.25rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem' }}>{item.title}</h3>
                    <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                  {item.author && <p className="text-xs text-muted" style={{ marginBottom: '.5rem' }}>{t.news.by} {item.author}</p>}
                  <p className="text-sm" style={{ color: 'var(--gray-600)', fontWeight: 300 }}>
                    {item.content?.slice(0, 220)}{(item.content?.length ?? 0) > 220 ? '…' : ''}
                  </p>
                  {item.documentUrl && <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '.75rem' }}>{t.news.document}</a>}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
                      <button className="btn btn-sm" style={{ background: 'var(--yellow-100)', color: 'var(--yellow-600)' }} onClick={() => openEdit(item)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(item)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ width: '340px', flexShrink: 0, position: 'sticky', top: '80px' }}>
            <a className="twitter-timeline" data-height="600" href="https://twitter.com/gitaudea1?ref_src=twsrc%5Etfw">Tweets by gitaudea1</a>
          </div>
        </div>
      </div>

      {showForm && (
        <Modal title={editTarget ? t.news.edit : t.news.add} onClose={() => setShowForm(false)} width="600px">
          <div className="form-group"><label>{t.news.form.title}</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label>{t.news.form.content}</label><textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
          <div className="form-group"><label>{t.news.form.image_url}</label><input type="url" value={form.pictureUrl} onChange={e => setForm(f => ({ ...f, pictureUrl: e.target.value }))} placeholder="https://…" /></div>
          <div className="form-group"><label>{t.news.form.document_url}</label><input type="url" value={form.documentUrl} onChange={e => setForm(f => ({ ...f, documentUrl: e.target.value }))} placeholder="https://…" /></div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>{t.news.form.cancel}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title || !form.content}>
              {saving ? t.common.loading : editTarget ? t.news.form.update : t.news.form.save}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog message={`${t.news.delete_confirm} "${deleteTarget.title}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
    </>
  )
}
