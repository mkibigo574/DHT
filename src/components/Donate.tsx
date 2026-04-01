export default function Donate() {
  return (
    <section className="section donate section--dark" id="donate">
      <div className="roadmap-bg-glow" />
      <div className="container">
        <div className="section-header on-dark">
          <p className="section-tag">Support the Movement</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            Help Us Build the<br /><span className="gradient-text">Territory&apos;s Stage</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted-dark)' }}>
            Every dollar goes directly toward making DHT a reality — regional heats, artist mentorship, production, and youth development across the NT.
          </p>
        </div>

        <div className="donate-grid">
          {/* Bank Transfer */}
          <div className="donate-card glass-card">
            <div className="donate-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3>Direct Bank Transfer</h3>
            <p>Transfer directly to our DHT account. Every contribution — big or small — helps us bring this vision to life.</p>
            <div className="bank-details">
              <div className="bank-row">
                <span className="bank-label">Account Name</span>
                <span className="bank-value">Darwin Has Talent</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">BSB</span>
                <span className="bank-value bank-placeholder">[Add your BSB]</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Account No.</span>
                <span className="bank-value bank-placeholder">[Add account number]</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Reference</span>
                <span className="bank-value">DHT Donation</span>
              </div>
            </div>
          </div>

          {/* What your donation funds */}
          <div className="donate-card glass-card">
            <div className="donate-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>What Your Donation Funds</h3>
            <ul className="donate-list">
              {[
                'Regional heat events across 4 NT locations',
                'Professional mentorship for young artists',
                'Production, equipment & artist travel',
                'Recording & media exposure for finalists',
                'Indigenous community music programs',
              ].map((item) => (
                <li key={item}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="donate-card glass-card donate-card--cta">
            <div className="donate-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3>Want to Give More?</h3>
            <p>If you&apos;d like to make a larger contribution, partner with us as a sponsor, or discuss a named donation toward a specific program, reach out directly.</p>
            <a href="#contact" className="btn btn-primary">Discuss Sponsorship &rarr;</a>
            <p className="donate-note">ABN: 23 372 902 339</p>
          </div>
        </div>
      </div>
    </section>
  )
}
