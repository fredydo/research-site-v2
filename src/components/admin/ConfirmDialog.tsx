'use client'

import Modal from './Modal'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal title="Confirm deletion" onClose={onCancel} width="400px">
      <p style={{ marginBottom: '1.5rem', color: 'var(--gray-700)' }}>{message}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
      </div>
    </Modal>
  )
}
