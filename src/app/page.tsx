import Link from 'next/link'
import pool from '@/lib/db/postgres'
import { connectMongo, Publication } from '@/lib/db/mongo'
import { format } from 'date-fns'

async function getUpcomingEvents() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM events WHERE start_date >= NOW() ORDER BY start_date ASC LIMIT 3`
    )
    return rows
  } catch { return [] }
}

async function getRecentPubs() {
  try {
    await connectMongo()
    return Publication.find().sort({ year: -1, createdAt: -1 }).limit(3).lean()
  } catch { return [] }
}

const RESEARCH_LINES = [
  {
    href: '/publications?type=pattern_analysis_and_signal_processing',
    img:  '/images/home/signal-procesing.jpg',
    title: 'Pattern Analysis and Signal Processing',
    text: 'We analyse bio-signals (speech, gait, handwriting) from patients with neurodegenerative disorders like Parkinson\'s and Alzheimer\'s. Our aim is cutting-edge technology for automatic detection and unobtrusive monitoring, plus speaker verification, mobile computing, and machine learning.',
  },
  {
    href: '/publications?type=communications_systems_modeling',
    img:  '/images/home/system_modeling.jpg',
    title: "Communication's Systems Modeling",
    text: "Focused on planning, dimensioning, management, and theoretical analysis of communication networks — both wireless and wired. We study emerging architectures for the Future Internet and the technology enablers for such architectures.",
  },
  {
    href: '/publications?type=optical_communications',
    img:  '/images/home/optical.jpg',
    title: 'Optical Communications',
    text: 'Our key areas are Optical Fiber Technologies and High-Speed Networking: optical wavelength transport and access networks, DSP techniques, elastic optical networks, polarization/PMD treatment, network quality monitoring, and photonic device materials.',
  },
]

export default async function HomePage() {
  const [events, publications] = await Promise.all([getUpcomingEvents(), getRecentPubs()])

  return (
    <>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-eyebrow">A1 Group · MinCiencias</span>
          <h1>GITA Research Group</h1>
          <p className="hero-sub">
            Advancing knowledge in signal processing, communications systems,
            and optical networks at Universidad de Antioquia, Medellín.
          </p>
          <div className="hero-actions">
            <Link href="/publications" className="btn btn-accent">Our Publications</Link>
            <Link href="/people" className="btn btn-ghost">Meet the Team</Link>
          </div>

          <div className="hero-stats">
            {[{ n:'40+', l:'Publications' },{ n:'12', l:'Researchers' },{ n:'8', l:'Active projects' },{ n:'3', l:'Research lines' }].map(({ n, l }) => (
              <div key={l}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLCIENCIAS banner ────────────────────── */}
      <div className="container">
        <div className="colciencias-banner mt-6">
          <p>A1 research group recognised by COLCIENCIAS — Universidad de Antioquia · Medellín, Colombia</p>
        </div>
      </div>

      {/* ── Research Lines ───────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom:'2.5rem', textAlign:'center' }}>
            <h2>Research Lines</h2>
            <p className="text-muted" style={{ margin:'.5rem auto 0', textAlign:'center' }}>
              Three core areas driving our scientific contributions.
            </p>
          </div>

          <div className="card-grid">
            {RESEARCH_LINES.map((rl) => (
              <Link href={rl.href} key={rl.href} className="rl-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rl.img} alt={rl.title} />
                <div className="rl-card-body">
                  <p className="rl-card-title">{rl.title}</p>
                  <div className="rl-card-divider" />
                  <p className="rl-card-text">{rl.text}</p>
                </div>
                <div className="rl-read-more">
                  <span>Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ──────────────────────── */}
      {events.length > 0 && (
        <section className="section" style={{ background:'var(--color-surface)', borderTop:'1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
              <h2>Upcoming Events</h2>
              <Link href="/news" className="btn btn-outline btn-sm">View all →</Link>
            </div>
            <div className="card-grid">
              {events.map((ev: any) => (
                <div className="card card-hover" key={ev.id}>
                  <span className="badge badge-green" style={{ marginBottom:'.75rem' }}>{ev.type}</span>
                  <h3 style={{ marginBottom:'.4rem' }}>{ev.title}</h3>
                  <p className="text-sm text-muted" style={{ marginBottom:'.75rem' }}>
                    {format(new Date(ev.start_date), 'MMM d, yyyy')} · {ev.location}
                  </p>
                  <p className="text-sm" style={{ color:'var(--gray-600)' }}>{ev.description.slice(0, 120)}…</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </>
  )
}
