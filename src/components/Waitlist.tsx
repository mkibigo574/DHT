'use client'
import { useState, FormEvent } from 'react'

export default function Waitlist() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      role,
      region: (form.elements.namedItem('region') as HTMLSelectElement).value,
    }

    // POST to our API
    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {})

    // Fire-and-forget to Google Forms
    const gfParams = new URLSearchParams({
      'entry.997698696': data.name,
      'entry.1555752851': data.email,
      'entry.1483143165': data.role,
      'entry.1401430195': data.region,
    })
    fetch(`https://docs.google.com/forms/d/e/1FAIpQLSe29UGd-X-3vQIgfRqW8I6RcZNalW5zOpnErlOiCzQFezneeQ/formResponse?${gfParams}`, {
      method: 'POST', mode: 'no-cors',
    }).catch(() => {})

    setLoading(false)
    setSubmitted(true)
  }

  const roles = [
    { value: 'Musician / Artist', label: 'Musician / Artist' },
    { value: 'Parent / Guardian', label: 'Parent / Guardian' },
    { value: 'Teacher / Educator', label: 'Teacher / Educator' },
    { value: 'Potential Sponsor / Partner', label: 'Sponsor / Partner' },
    { value: 'Community Member / Supporter', label: 'Community Member' },
  ]

  return (
    <section className="section waitlist section--bg" id="waitlist">
      <div className="container">
        <div className="waitlist-wrapper">
          <div className="waitlist-intro">
            <div className="wh-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h2>Be Part of History</h2>
            <p>Get notified when 2027 auditions open. Join the waitlist and be the first to know.</p>
            <ul className="waitlist-perks">
              <li>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                First access to 2027 audition info
              </li>
              <li>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Monthly Founder&apos;s Diary newsletter
              </li>
              <li>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Behind-the-scenes Territory tour updates
              </li>
            </ul>
            <p className="form-disclaimer">We respect your privacy. Unsubscribe at any time.</p>
          </div>

          <div className="gform-container">
            {submitted ? (
              <div className="cgf-success">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>You&apos;re on the list!</h3>
                <p>We&apos;ll be in touch when 2027 auditions open. Welcome to the Darwin Has Talent community.</p>
              </div>
            ) : (
              <form className="custom-gform" onSubmit={handleSubmit} noValidate>
                <div className="cgf-row">
                  <div className="cgf-group">
                    <label htmlFor="wf-name">Full Name <span className="cgf-required">*</span></label>
                    <div className="cgf-input-wrap">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" />
                        <path d="M3 18c0-4 3.134-7 7-7s7 3 7 7" />
                      </svg>
                      <input type="text" id="wf-name" name="name" placeholder="Your full name" required autoComplete="name" />
                    </div>
                  </div>
                  <div className="cgf-group">
                    <label htmlFor="wf-email">Email Address <span className="cgf-required">*</span></label>
                    <div className="cgf-input-wrap">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M2 4h16a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1z" />
                        <polyline points="1,4 10,11 19,4" />
                      </svg>
                      <input type="email" id="wf-email" name="email" placeholder="your@email.com" required autoComplete="email" />
                    </div>
                  </div>
                </div>

                <div className="cgf-group">
                  <label>I am a <span className="cgf-required">*</span></label>
                  <div className="cgf-radio-group">
                    {roles.map((r) => (
                      <label key={r.value} className="cgf-radio">
                        <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} required />
                        <span className="cgf-radio-box">
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                            <circle cx="7" cy="16" r="2.5" /><circle cx="15" cy="14" r="2.5" />
                            <polyline points="9.5,16 9.5,6 17.5,4 17.5,14" />
                          </svg>
                          <span className="cgf-radio-label">{r.label}</span>
                          <span className="cgf-radio-check">
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                            </svg>
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="cgf-group">
                  <label htmlFor="wf-region">Your Region</label>
                  <div className="cgf-select-wrap">
                    <svg className="cgf-select-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" />
                      <circle cx="10" cy="8" r="2" />
                    </svg>
                    <select id="wf-region" name="region">
                      <option value="" disabled>Select your region</option>
                      <option value="Darwin / Top End">Darwin / Top End</option>
                      <option value="Katherine / Big Rivers">Katherine / Big Rivers</option>
                      <option value="Tennant Creek / Barkly">Tennant Creek / Barkly</option>
                      <option value="Alice Springs / Red Centre">Alice Springs / Red Centre</option>
                      <option value="Outside the NT">Outside the NT</option>
                      <option value="Other">Other</option>
                    </select>
                    <svg className="cgf-chevron" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-full cgf-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-spinner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" className="spin">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Submitting…
                    </span>
                  ) : 'Join the 2027 Waitlist'}
                </button>
                <p className="form-disclaimer">We respect your privacy. Unsubscribe at any time.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
