'use client'
import { useState, FormEvent } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('contact-name') as HTMLInputElement).value,
      email: (form.elements.namedItem('contact-email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('contact-subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('contact-message') as HTMLTextAreaElement).value,
    }
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {})
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section className="section contact section--white" id="contact">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Get In Touch</p>
          <h2 className="section-title">Let&apos;s Talk</h2>
          <p className="section-subtitle">Have a question, a partnership idea, or just want to say g&apos;day? We&apos;d love to hear from you.</p>
        </div>
        <div className="contact-grid">
          {submitted ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="30">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-muted)' }}>We&apos;ll get back to you within 48 hours.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="dark-label">Your Name</label>
                  <input type="text" name="contact-name" placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label className="dark-label">Email Address</label>
                  <input type="email" name="contact-email" placeholder="your@email.com" required />
                </div>
              </div>
              <div className="form-group">
                <label className="dark-label">Subject</label>
                <select name="contact-subject">
                  <option value="" disabled>What&apos;s this about?</option>
                  <option value="partnership">Partnership / Sponsorship</option>
                  <option value="audition">Audition Enquiry</option>
                  <option value="media">Media / Press</option>
                  <option value="general">General Enquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="dark-label">Message</label>
                <textarea name="contact-message" rows={5} placeholder="Tell us what's on your mind..." required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          )}

          <div className="contact-sidebar">
            <div className="contact-info-card light-info-card">
              <div className="cic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h4>Email</h4>
                <a href="mailto:admin@darwinhastalents.com.au">admin@darwinhastalents.com.au</a>
              </div>
            </div>
            <div className="contact-info-card light-info-card">
              <div className="cic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h4>ABN</h4>
                <p>23 372 902 339</p>
              </div>
            </div>
             <div className="contact-info-card light-info-card">
              <div className="cic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 4.18 2 2 0 0 1 5.1 2h3a2 2 0 0 1 2 1.72c.12.9.37 1.77.72 2.58a2 2 0 0 1-.45 2.11L9 9a16 16 0 0 0 6 6l.59-.37a2 2 0 0 1 2.11-.45c.81.35 1.68.6 2.58.72A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                {/*<h4>Contact</h4>
                <p><a href="tel:0416941973">0416 941 973</a></p> 
              </div> 
            </div> */}
            <div className="contact-info-card light-info-card">
              <div className="cic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h4>Location</h4>
                <p>Darwin, Northern Territory</p>
              </div>
            </div>
            <div className="social-links">
              <h4 className="dark-text">Follow Us</h4>
              <div className="social-row">
                <a href="https://www.instagram.com/darwinhastalent_nt" target="_blank" rel="noopener" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@darwinhastalent" target="_blank" rel="noopener" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                  TikTok
                </a>
                <a href="https://www.facebook.com/share/18DV43Hfcp/?mibextid=wwXlfr" target="_blank" rel="noopener" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  Facebook
                </a>
                <a href="https://www.linkedin.com/company/darwin-has-talents" target="_blank" rel="noopener" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
