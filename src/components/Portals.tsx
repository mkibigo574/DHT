export default function Portals() {
  return (
    <section className="section portals section--bg" id="portals">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Pick Your Lane</p>
          <h2 className="section-title">How Do You Want In?</h2>
          <p className="section-subtitle">Artist, sponsor, or supporter — everyone has a role to play. The NT&apos;s biggest music moment needs all of you.</p>
        </div>

        <div className="portals-grid">
          {/* Musicians */}
          <div className="portal-card portal-card--musicians">
            <div className="portal-top">
              <div className="portal-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="18" r="3" /><circle cx="19" cy="16" r="3" />
                  <polyline points="12 18 12 2 22 5" /><path d="M12 2L22 5" />
                </svg>
              </div>
              <span className="portal-number">01</span>
            </div>
            <h3>For Musicians</h3>
            <p>If you&apos;ve got the talent, 2027 is your year. Register now and be the first to know when auditions drop.</p>
            <ul className="portal-list">
              <li>First access when auditions open</li>
              <li>Pro mentorship &amp; industry coaching</li>
              <li>Perform on the Territory&apos;s biggest stage</li>
            </ul>
            <a href="#waitlist" className="btn btn-primary">Lock In My Spot &rarr;</a>
          </div>

          {/* Sponsors */}
          <div className="portal-card portal-card--sponsors portal-card--featured">
            <div className="portal-featured-label">High Impact</div>
            <div className="portal-top">
              <div className="portal-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="portal-number">02</span>
            </div>
            <h3>For Sponsors</h3>
            <p>Align your brand with the NT&apos;s most exciting cultural moment. Our 2026/27 Partnership Prospectus is ready for you.</p>
            <ul className="portal-list">
              <li>Massive brand visibility across all 4 regions</li>
              <li>Community &amp; government alignment</li>
              <li>NT-first legacy that actually matters</li>
            </ul>
            <a href="#contact" className="btn btn-primary">Let&apos;s Talk &rarr;</a>
          </div>

          {/* Community */}
          <div className="portal-card portal-card--community">
            <div className="portal-top">
              <div className="portal-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="portal-number">03</span>
            </div>
            <h3>For Community</h3>
            <p>You don&apos;t have to perform to be part of this. Follow the journey, spread the word, and help us build something the NT has never seen.</p>
            <ul className="portal-list">
              <li>Monthly Founder&apos;s Diary updates</li>
              <li>Talent Spotlight &amp; behind-the-scenes</li>
              <li>Be part of NT music history</li>
            </ul>
            <a href="#waitlist" className="btn btn-primary">Follow the Journey &rarr;</a>
          </div>
        </div>
      </div>
    </section>
  )
}
