import Link from 'next/link'
import pool from '@/lib/db/postgres'

async function getStats() {
  try {
    const [{ rows: p }, { rows: u }, { rows: pr }] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM publications'),
      pool.query('SELECT COUNT(*) FROM "user"'),
      pool.query('SELECT COUNT(*) FROM projects'),
    ])
    return {
      publications: parseInt(p[0].count),
      researchers:  parseInt(u[0].count),
      projects:     parseInt(pr[0].count),
    }
  } catch { return { publications: 172, researchers: 6, projects: 16 } }
}

const RESEARCH_LINES = [
  {
    href:  '/publications?type=pattern_analysis_and_signal_processing',
    img:   '/images/home/signal-procesing.jpg',
    title: 'Pattern Analysis and Signal Processing',
    text:  "We analyse bio-signals (speech, gait, handwriting) from patients with neurodegenerative disorders like Parkinson's and Alzheimer's. Our aim is cutting-edge technology for automatic detection and unobtrusive monitoring.",
  },
  {
    href:  '/publications?type=communications_systems_modeling',
    img:   '/images/home/system_modeling.jpg',
    title: "Communication's Systems Modeling",
    text:  "Focused on planning, dimensioning, management, and theoretical analysis of communication networks — both wireless and wired. We study emerging architectures for the Future Internet.",
  },
  {
    href:  '/publications?type=optical_communications',
    img:   '/images/home/optical.jpg',
    title: 'Optical Communications',
    text:  'Our key areas are Optical Fiber Technologies and High-Speed Networking: optical wavelength transport, DSP techniques, elastic optical networks, and photonic device materials.',
  },
]

export default async function HomePage() {
  const stats = await getStats()

  return (
    <>
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
            {[
              { n: `${stats.publications}+`, l: 'Publications' },
              { n: `${stats.researchers}`,   l: 'Researchers' },
              { n: `${stats.projects}`,      l: 'Active projects' },
              { n: '3',                      l: 'Research lines' },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="colciencias-banner mt-6">
          <p>A1 research group recognised by COLCIENCIAS — Universidad de Antioquia · Medellín, Colombia</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2>Research Lines</h2>
            <p className="text-muted" style={{ margin: '.5rem auto 0', textAlign: 'center' }}>
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
                <div className="rl-read-more"><span>Read more →</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
