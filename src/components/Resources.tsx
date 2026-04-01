const resources = [
  {
    title: 'Audition Submission Form',
    desc: 'Submit your audition video and artist details for 2027 consideration.',
    cta: 'Submit Audition',
    subject: 'Audition Submission',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: 'Sponsorship Prospectus',
    desc: 'Download the official 2026/27 Partnership Prospectus for potential sponsors and partners.',
    cta: 'Request Document',
    subject: 'Sponsorship Prospectus Request',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Artist Info Pack',
    desc: 'Everything you need to know about DHT — eligibility, regions, judging criteria, and prizes.',
    cta: 'Get Info Pack',
    subject: 'Artist Info Pack',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Media & Press Kit',
    desc: 'Official logos, images, and press materials for media outlets and event partners.',
    cta: 'Request Press Kit',
    subject: 'Media Kit Request',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
]

export default function Resources() {
  return (
    <section className="section resources section--white" id="resources">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Forms &amp; Documents</p>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Download forms, upload your audition materials, and access all official DHT documents in one place.</p>
        </div>

        <div className="resources-grid">
          {resources.map((r) => (
            <div key={r.title} className="resource-card">
              <div className="resource-icon">{r.icon}</div>
              <div className="resource-content">
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <a
                  href={`mailto:hello@darwinhastalents.com.au?subject=${encodeURIComponent(r.subject)}`}
                  className="btn btn-primary resource-btn"
                >
                  {r.cta} &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="resources-note">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            Formal online upload portal coming soon. For now, email submissions are sent to{' '}
            <a href="mailto:hello@darwinhastalents.com.au">hello@darwinhastalents.com.au</a>{' '}
            and we will respond within 48 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
