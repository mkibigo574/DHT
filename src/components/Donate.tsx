'use client'
import { useState, useEffect } from 'react'

const GOAL = 50_000   // AUD — update this as the campaign grows

const PRESETS = [
  { amount: 10,  label: 'Light a Mic',       emoji: '🎤', sub: 'Covers sound gear for one audition' },
  { amount: 25,  label: 'Ignite a Region',   emoji: '🔥', sub: 'Helps fund a regional heat event'   },
  { amount: 50,  label: 'Fuel the Stage',    emoji: '🎸', sub: 'Supports artist travel between stops'},
  { amount: 100, label: 'Back the Movement', emoji: '⭐', sub: 'Funds mentorship for a young artist' },
]

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `$${n.toFixed(0)}`
}

export default function Donate() {
  const [selected, setSelected]   = useState(25)
  const [custom,   setCustom]     = useState('')
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')
  const [raised,   setRaised]     = useState<number | null>(null)
  const [bankOpen, setBankOpen]   = useState(false)

  // Fetch total raised (cached 60 s on the edge)
  useEffect(() => {
    fetch('/api/donate/total')
      .then(r => r.json())
      .then(d => setRaised(d.total ?? 0))
      .catch(() => setRaised(0))
  }, [])

  const parsedCustom   = parseFloat(custom)
  const effectiveDols  = custom && !isNaN(parsedCustom) && parsedCustom > 0 ? parsedCustom : selected
  const amountCents    = Math.round(effectiveDols * 100)
  const progress       = raised !== null ? Math.min(100, (raised / GOAL) * 100) : 0
  const displayAmt     = effectiveDols % 1 === 0 ? `$${effectiveDols}` : `$${effectiveDols.toFixed(2)}`

  async function handleDonate() {
    setError('')
    if (amountCents < 100) { setError('Minimum donation is $1.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/donate/checkout', {
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

        {/* ── Section header ── */}
        <div className="section-header on-dark">
          <p className="section-tag">Support the Movement</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            Help Us Build the<br />
            <span className="gradient-text">Territory&apos;s Stage</span>
          </h2>
        </div>

        {/* ── Emotional copy ── */}
        <p className="donate-story">
          Every year, talented young musicians from Alice Springs, Katherine, and Tennant Creek
          face a choice: stay in the NT or move south just to be heard. Darwin Has Talent changes
          that. Your donation funds regional heats, professional mentorship, and a stage that
          travels to every corner of the Territory — so NT talent gets to shine right here at home.
        </p>

        {/* ── Progress bar ── */}
        <div className="donate-progress-widget">
          <div className="donate-progress-track">
            <div
              className="donate-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="donate-progress-meta">
            <div className="donate-progress-stat">
              <span className="donate-progress-num">
                {raised !== null ? fmt(raised) : '—'}
              </span>
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

        {/* ── Main grid ── */}
        <div className="donate-main-grid">

          {/* ─── LEFT: form ─── */}
          <div className="donate-form-col glass-card">
            <h3 className="donate-form-heading">Choose Your Impact</h3>

            {/* Labeled preset buttons */}
            <div className="donate-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  className={`donate-preset${!custom && selected === p.amount ? ' active' : ''}`}
                  onClick={() => { setSelected(p.amount); setCustom(''); setError('') }}
                >
                  <span className="dp-emoji" aria-hidden="true">{p.emoji}</span>
                  <span className="dp-body">
                    <span className="dp-label">{p.label}</span>
                    <span className="dp-sub">{p.sub}</span>
                  </span>
                  <span className="dp-price">${p.amount}</span>
                </button>
              ))}
            </div>

            {/* Custom amount */}
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

            {/* CTA */}
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

            {/* Trust row */}
            <div className="donate-trust-row">
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL · Powered by Stripe</span>
            </div>
          </div>

          {/* ─── RIGHT: impact + sponsorship ─── */}
          <div className="donate-info-col">

            {/* Impact list */}
            <div className="donate-impact glass-card">
              <h3 className="donate-impact-heading">Where Your Money Goes</h3>
              <ul className="donate-impact-list">
                {[
                  { emoji: '🎪', text: '4 regional heat events across the NT' },
                  { emoji: '🎓', text: 'Professional mentorship for young artists' },
                  { emoji: '🚌', text: 'Production, equipment & artist travel' },
                  { emoji: '🎬', text: 'Recording & media exposure for finalists' },
                  { emoji: '🪘', text: 'Indigenous community music programs' },
                ].map((item) => (
                  <li key={item.text} className="donate-impact-item">
                    <span className="donate-impact-emoji" aria-hidden="true">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sponsorship CTA */}
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

        {/* ── Bank transfer accordion ── */}
        <div className="donate-bank-wrap">
          <button
            type="button"
            className="donate-bank-toggle"
            onClick={() => setBankOpen((o) => !o)}
            aria-expanded={bankOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" width="17" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Prefer a direct bank transfer?
            <svg viewBox="0 0 20 20" fill="currentColor" width="15"
              className={`donate-bank-chevron${bankOpen ? ' open' : ''}`} aria-hidden="true">
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
                  {/* ← Replace with real BSB before launch */}
                  <span className="bank-value bank-placeholder">[Your BSB]</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">Account No.</span>
                  {/* ← Replace with real account number before launch */}
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
