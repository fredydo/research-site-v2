// ─── User & Auth ────────────────────────────────────────────
export type UserRole = 'admin' | 'editor' | 'member'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  title?: string
  bio?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Events ─────────────────────────────────────────────────
export interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate?: Date
  type: 'seminar' | 'conference' | 'workshop' | 'other'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// ─── Publications (MongoDB) ──────────────────────────────────
export interface Publication {
  _id?: string
  title: string
  authors: string[]
  abstract: string
  journal?: string
  conference?: string
  year: number
  doi?: string
  tags: string[]
  pdfUrl?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// ─── API Responses ───────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
