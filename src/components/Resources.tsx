'use client'

import { useState } from 'react'

type ResourceType = 'form' | 'download' | 'sponsor'

interface Resource {
  type: ResourceType
  title: string
  desc: string
  cta: string
  file?: string
  subject?: string
  icon: React.ReactNode
}

// ── Sponsor Enquiry Modal ─────────────────────────────────────
function SponsorModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ org_name: '', contact_name: '', email: '', interest: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.contact_name,
          email: form.email,
          message: `Organisation: ${form.org_name}\nLevel of Interest: ${form.interest}`,
          subject: 'Sponsorship Enquiry',
        }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="aud-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="aud-modal req-modal" role="dialog" aria-modal="true">
        <div className="aud-drag-handle" aria-hidden="true" />
        <div className="aud-modal-header">
          <div className="aud-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="aud-header-text">
            <h2>Partner Enquiry</h2>
            <p>Darwin Has Talent · 2027 Season</p>
          </div>
          <button className="aud-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="aud-success">
            <div className="aud-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Enquiry Received!</h3>
            <p>Thanks for your interest in partnering with Darwin Has Talent. We&apos;ll be in touch within 48 hours.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="aud-form" onSubmit={handleSubmit} noValidate>
            <p className="req-modal-intro">Tell us about your organisation and we&apos;ll reach out to discuss partnership opportunities.</p>
            <div className="form-group">
              <label>Organisation Name <span className="req">*</span></label>
              <input type="text" required placeholder="e.g. Acme Corporation" value={form.org_name} onChange={(e) => set('org_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Your Name <span className="req">*</span></label>
              <input type="text" required placeholder="Full name" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address <span className="req">*</span></label>
              <input type="email" required placeholder="your@organisation.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Level of Interest <span className="req">*</span></label>
              <select required value={form.interest} onChange={(e) => set('interest', e.target.value)}>
                <option value="">Select sponsorship level</option>
                <option>Lead Sponsor (Platinum Naming Rights)</option>
                <option>Regional Hub Sponsor</option>
                <option>Prize Partner</option>
                <option>In-Kind (Travel / Technical)</option>
                <option>General Enquiry</option>
              </select>
            </div>
            {status === 'error' && <p className="aud-error">{errorMsg}</p>}
            <div className="aud-form-footer">
              <button type="submit" className="btn btn-primary aud-submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="donate-spinner" aria-hidden="true" /> Sending…</>
                ) : (
                  <>
                    Send Enquiry
                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" style={{ marginLeft: 6 }}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Request-by-email modal ────────────────────────────────────
function RequestModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/request-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, document: resource.title }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Request failed')
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="aud-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="aud-modal req-modal" role="dialog" aria-modal="true">
        <div className="aud-drag-handle" aria-hidden="true" />
        <div className="aud-modal-header">
          <div className="aud-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="aud-header-text">
            <h2>Request Document</h2>
            <p>{resource.title}</p>
          </div>
          <button className="aud-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="aud-success">
            <div className="aud-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Request Sent!</h3>
            <p>We&apos;ll email you the <strong>{resource.title}</strong> within 48 hours.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="aud-form" onSubmit={handleSubmit} noValidate>
            <p className="req-modal-intro">Enter your details and we&apos;ll send the document straight to your inbox.</p>
            <div className="form-group">
              <label>Your Name <span className="req">*</span></label>
              <input type="text" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address <span className="req">*</span></label>
              <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {status === 'error' && <p className="aud-error">{errorMsg}</p>}
            <div className="aud-form-footer">
              <button type="submit" className="btn btn-primary aud-submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="donate-spinner" aria-hidden="true" /> Sending…</>
                ) : (
                  <>
                    Send Me the Document
                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" style={{ marginLeft: 6 }}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const resources: Resource[] = [
  {
    type: 'form',
    title: 'Audition Submission',
    desc: 'Apply to compete in the 2027 Darwin Has Talent — submit your video and artist details.',
    cta: 'Apply Now',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    type: 'sponsor',
    title: 'Sponsorship Prospectus',
    desc: 'Download the official 2026/27 Partnership Prospectus for potential sponsors and partners.',
    cta: 'Download PDF',
    file: '/docs/Darwin_Has_Talent_2027_Sponsorship_Prospectus.pdf',
    subject: 'Sponsorship Prospectus Request',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    type: 'download',
    title: 'Artist Info Pack',
    desc: 'Everything you need to know — eligibility, regions, judging criteria, and prizes.',
    cta: 'Download PDF',
    file: '/docs/artist-info-pack.pdf',
    subject: 'Artist Info Pack Request',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    type: 'download',
    title: 'Media & Press Kit',
    desc: 'Official logos, images, and press materials for media outlets and event partners.',
    cta: 'Download PDF',
    file: '/docs/press-kit.pdf',
    subject: 'Media Kit Request',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
]

// ── Premium Audition Modal ───────────────────────────────────
function AuditionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', region: '',
    performance_type: '', genre: '', video_link: '', bio: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/audition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="aud-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="aud-modal" role="dialog" aria-modal="true">

        <div className="aud-drag-handle" aria-hidden="true" />
        {/* Branded header */}
        <div className="aud-modal-header">
          <div className="aud-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div className="aud-header-text">
            <h2>Audition Application</h2>
            <p>Darwin Has Talent · 2027 Season</p>
          </div>
          <button className="aud-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="aud-success">
            <div className="aud-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Application Received!</h3>
            <p>Thank you for applying to Darwin Has Talent. We&apos;ll review your audition and be in touch within 5 business days.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="aud-form" onSubmit={handleSubmit} noValidate>

            {/* Section 1 */}
            <div className="aud-section">
              <div className="aud-section-label">
                <span className="aud-section-num">1</span>
                Personal Details
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name <span className="req">*</span></label>
                  <input type="text" required placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address <span className="req">*</span></label>
                  <input type="email" required placeholder="your@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Phone <span className="form-optional">optional</span></label>
                  <input type="tel" placeholder="+61 4XX XXX XXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Your Region <span className="req">*</span></label>
                  <select required value={form.region} onChange={(e) => set('region', e.target.value)}>
                    <option value="">Select your region</option>
                    <option>Alice Springs / Red Centre</option>
                    <option>Tennant Creek / Barkly</option>
                    <option>Katherine / Big Rivers</option>
                    <option>Darwin / Top End</option>
                    <option>Outside the NT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="aud-section">
              <div className="aud-section-label">
                <span className="aud-section-num">2</span>
                Performance Details
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Performance Type <span className="req">*</span></label>
                  <select required value={form.performance_type} onChange={(e) => set('performance_type', e.target.value)}>
                    <option value="">Select type</option>
                    <option>Solo Artist</option>
                    <option>Duo</option>
                    <option>Group / Band</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Genre / Style <span className="req">*</span></label>
                  <input type="text" required placeholder="e.g. Country, R&B, Hip-Hop…" value={form.genre} onChange={(e) => set('genre', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="aud-section">
              <div className="aud-section-label">
                <span className="aud-section-num">3</span>
                Your Audition
              </div>
              <div className="form-group">
                <label>Video Link <span className="req">*</span></label>
                <div className="aud-input-icon-wrap">
                  <svg className="aud-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="15" height="10" rx="2" />
                    <path d="M17 9l4-2v10l-4-2V9z" />
                  </svg>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.video_link}
                    onChange={(e) => set('video_link', e.target.value)}
                    className="has-icon"
                  />
                </div>
                <span className="form-hint">YouTube, Vimeo, or Google Drive · ensure public sharing is enabled</span>
              </div>
              <div className="form-group">
                <label>About You <span className="req">*</span></label>
                <textarea
                  required
                  placeholder="Tell us about yourself — your musical background, influences, and why you want to compete in DHT…"
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  style={{ minHeight: 120 }}
                />
              </div>
            </div>

            {status === 'error' && <p className="aud-error">{errorMsg}</p>}

            <div className="aud-form-footer">
              <p className="aud-disclaimer">
                By submitting you agree to DHT&apos;s terms. Your details will only be used to contact you about your application.
              </p>
              <button type="submit" className="btn btn-primary aud-submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="donate-spinner" aria-hidden="true" /> Submitting…</>
                ) : (
                  <>
                    Submit Application
                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" style={{ marginLeft: 6 }}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function Resources() {
  const [modalOpen, setModalOpen] = useState(false)
  const [requestResource, setRequestResource] = useState<Resource | null>(null)
  const [sponsorOpen, setSponsorOpen] = useState(false)

  return (
    <section className="section resources section--white" id="resources">
      {modalOpen && <AuditionModal onClose={() => setModalOpen(false)} />}
      {requestResource && <RequestModal resource={requestResource} onClose={() => setRequestResource(null)} />}
      {sponsorOpen && <SponsorModal onClose={() => setSponsorOpen(false)} />}

      <div className="container">
        <div className="section-header">
          <p className="section-tag">Forms &amp; Documents</p>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            Apply to audition, download official documents, and access all DHT materials in one place.
          </p>
        </div>

        <div className="resources-grid">
          {resources.map((r) => (
            <div key={r.title} className="resource-card">
              <div className="resource-icon">{r.icon}</div>
              <div className="resource-content">
                <h3>{r.title}</h3>
                <p>{r.desc}</p>

                {r.type === 'form' ? (
                  <button className="btn btn-primary resource-btn" onClick={() => setModalOpen(true)}>
                    {r.cta} &rarr;
                  </button>
                ) : r.type === 'sponsor' ? (
                  <div className="resource-download-group">
                    <a href={r.file} download className="btn btn-primary resource-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ marginRight: 6 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {r.cta}
                    </a>
                    <button
                      type="button"
                      className="resource-email-link"
                      onClick={() => setSponsorOpen(true)}
                    >
                      Partner enquiry &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="resource-download-group">
                    <a href={r.file} download className="btn btn-primary resource-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ marginRight: 6 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {r.cta}
                    </a>
                    <button
                      type="button"
                      className="resource-email-link"
                      onClick={() => setRequestResource(r)}
                    >
                      Request by email
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="resources-note">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            Auditions for 2027 are now open. For enquiries contact{' '}
            <a href="mailto:admin@darwinhastalents.com.au">admin@darwinhastalents.com.au</a>
            {' '}— we respond within 48 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
