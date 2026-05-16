'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Photo' }: Props) {
  const [dragging, setDragging]         = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [error, setError]               = useState('')
  const [localPreview, setLocalPreview] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('File too large (max 5MB)'); return }
    setError(''); setUploading(true)
    const blobUrl = URL.createObjectURL(file)
    setLocalPreview(blobUrl)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); setLocalPreview('') }
      else { onChange(data.url) }
    } catch { setError('Upload failed'); setLocalPreview('') }
    finally { setUploading(false) }
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()  // don't trigger the drop zone click
    setLocalPreview('')
    onChange('')
  }

  const displayPreview = localPreview || value

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !displayPreview && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--green-600)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center',
          cursor: displayPreview ? 'default' : 'pointer',
          background: dragging ? 'var(--green-50)' : 'var(--gray-50)',
          transition: 'all .2s', marginBottom: '.5rem',
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>⏳</div>
            <p className="text-sm text-muted">Uploading…</p>
          </div>
        ) : displayPreview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPreview}
              alt="Preview"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-200)' }}
            />
            <div style={{ textAlign: 'left' }}>
              <p className="text-sm" style={{ color: 'var(--green-700)', fontWeight: 600 }}>✓ Image ready</p>
              <p className="text-xs text-muted" style={{ marginBottom: '.5rem' }}>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => inputRef.current?.click()}>
                  Click to replace
                </span>
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-sm"
                style={{ background: 'var(--red-100, #fee2e2)', color: 'var(--red-600, #dc2626)', fontSize: '.75rem', padding: '.2rem .6rem' }}
              >
                🗑️ Remove photo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📷</div>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
              <strong>Drag & drop</strong> or <strong>click to browse</strong>
            </p>
            <p className="text-xs text-muted" style={{ marginTop: '.25rem' }}>JPG, PNG, GIF — max 5MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) { setLocalPreview(''); upload(f) }
          e.target.value = ''
        }}
      />
      <input
        type="url"
        value={value}
        onChange={e => { setLocalPreview(''); onChange(e.target.value) }}
        placeholder="Or paste an image URL…"
        style={{ fontSize: '.85rem' }}
      />
      {error && <p className="text-xs" style={{ color: 'var(--color-danger)', marginTop: '.25rem' }}>{error}</p>}
    </div>
  )
}
