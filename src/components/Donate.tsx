'use client'
import { useState, useEffect } from 'react'

const GOAL = 50_000

const PRESETS = [
  {
    amount: 10,
    label: 'Light a Mic',
    sub: 'Covers sound gear for one audition',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    amount: 25,
    label: 'Ignite a Region',
    sub: 'Helps fund a regional heat event',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    amount: 50,
    label: 'Fuel the Stage',
    sub: 'Supports artist travel between stops',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    amount: 100,
    label: 'Back the Movement',
    sub: 'Funds mentorship for a young artist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]

const IMPACT = [
  {
    text: '4 regional heat events across the NT',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="13" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    text: 'Professional mentorship for young artists',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    text: 'Production, equipment & artist travel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    text: 'Recording & media exposure for finalists',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="15" height="10" rx="2" />
        <path d="M17 9l4-2v10l-4-2V9z" />
      </svg>
    ),
  },
  {
    text: 'Indigenous community music programs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v8c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 9c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </svg>
    ),
  },
]

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `$${n.toFixed(0)}`
}

export default function Donate() {
  const [selected, setSelected] = useState(25)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [raised, setRaised] = useState<number | null>(null)
  const [bankOpen, setBankOpen] = useState(false)

  useEffect(() => {
    fetch('/api/donate/total')
      .then(r => r.json())
      .then(d => setRaised(d.total ?? 0))
      .catch(() => setRaised(0))
  }, [])

  const parsedCustom = parseFloat(custom)
  const effectiveDols = custom && !isNaN(parsedCustom) && parsedCustom > 0 ? parsedCustom : selected
  const amountCents = Math.round(effectiveDols * 100)
  const progress = raised !== null ? Math.min(100, (raised / GOAL) * 100) : 0
  const displayAmt = effectiveDols % 1 === 0 ? `$${effectiveDols}` : `$${effectiveDols.toFixed(2)}`

  async function handleDonate() {
    setError('')
    if (amountCents < 100) { setError('Minimum donation is $1.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section donate section--dark" id="donate">
      <div className="donate-bg-glow" />
      <div className="container">

        <div className="section-header on-dark">
          <p className="section-tag">Support the Movement</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            Help Us Build the<br />
            <span className="gradient-text">Territory&apos;s Stage</span>
          </h2>
        </div>

        <p className="donate-story">
          Every year, talented young musicians from Alice Springs, Katherine, and Tennant Creek
          face a choice: stay in the NT or move south just to be heard. Darwin Has Talent changes
          that. Your donation funds regional heats, professional mentorship, and a stage that
          travels to every corner of the Territory — so NT talent gets to shine right here at home.
        </p>

        <div className="donate-progress-widget">
          <div className="donate-progress-track">
            <div className="donate-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="donate-progress-meta">
            <div className="donate-progress-stat">
              <span className="donate-progress-num">{raised !== null ? fmt(raised) : '—'}</span>
              <span className="donate-progress-lbl">raised</span>
            </div>
            <div className="donate-progress-pct">
              {raised !== null ? `${Math.round(progress)}% of goal` : ''}
            </div>
            <div className="donate-progress-stat" style={{ textAlign: 'right' }}>
              <span className="donate-progress-num">{fmt(GOAL)}</span>
              <span className="donate-progress-lbl">goal</span>
            </div>
          </div>
        </div>

        <div className="donate-main-grid">

          {/* LEFT: form */}
          <div className="donate-form-col glass-card">
            <h3 className="donate-form-heading">Choose Your Impact</h3>

            <div className="donate-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  className={`donate-preset${!custom && selected === p.amount ? ' active' : ''}`}
                  onClick={() => { setSelected(p.amount); setCustom(''); setError('') }}
                >
                  <span className="dp-icon" aria-hidden="true">{p.icon}</span>
                  <span className="dp-body">
                    <span className="dp-label">{p.label}</span>
                    <span className="dp-sub">{p.sub}</span>
                  </span>
                  <span className="dp-price">${p.amount}</span>
                </button>
              ))}
            </div>

            <div className="donate-custom-wrap">
              <span className="donate-custom-symbol">$</span>
              <input
                type="number"
                className="donate-custom-input"
                placeholder="Or enter your own amount"
                min="1"
                step="1"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setError('') }}
              />
            </div>

            {error && <p className="donate-error" role="alert">{error}</p>}

            <button
              type="button"
              className="btn btn-primary donate-cta-btn"
              onClick={handleDonate}
              disabled={loading}
            >
              {loading ? (
                <><span className="donate-spinner" aria-hidden="true" /> Redirecting to Stripe…</>
              ) : (
                <>
                  Donate {displayAmt} to DHT
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" aria-hidden="true" style={{ marginLeft: 6, flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>

            <div className="donate-trust-row">
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL · Powered by Stripe</span>
            </div>
          </div>

          {/* RIGHT: impact + sponsorship */}
          <div className="donate-info-col">
            <div className="donate-impact glass-card">
              <h3 className="donate-impact-heading">Where Your Money Goes</h3>
              <ul className="donate-impact-list">
                {IMPACT.map((item) => (
                  <li key={item.text} className="donate-impact-item">
                    <span className="donate-impact-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="donate-sponsor glass-card">
              <p className="donate-sponsor-heading">Want to give more?</p>
              <p className="donate-sponsor-body">
                Named donations, corporate sponsorship, or a custom program — let&apos;s talk.
              </p>
              <a href="#contact" className="btn btn-ghost donate-sponsor-btn">
                Discuss Sponsorship →
              </a>
              <p className="donate-note">ABN: 23 372 902 339</p>
            </div>
          </div>
        </div>

        {/* Bank transfer accordion */}
        <div className="donate-bank-wrap">
          <button
            type="button"
            className="donate-bank-toggle"
            onClick={() => setBankOpen((o) => !o)}
            aria-expanded={bankOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Prefer a direct bank transfer?
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" className={`donate-bank-chevron${bankOpen ? ' open' : ''}`} aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {bankOpen && (
            <div className="donate-bank-body glass-card">
              <div className="bank-details">
                <div className="bank-row">
                  <span className="bank-label">Account Name</span>
                  <span className="bank-value">Darwin Has Talent</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">BSB</span>
                  <span className="bank-value bank-placeholder">[Your BSB]</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Account No.</span>
                  <span className="bank-value bank-placeholder">[Your Account No.]</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Reference</span>
                  <span className="bank-value">DHT Donation</span>
                </div>
              </div>
              <p className="donate-bank-note">
                After transferring, email{' '}
                <a href="mailto:hello@darwinhastalents.com.au">hello@darwinhastalents.com.au</a>
                {' '}with your name and amount so we can thank you properly.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
