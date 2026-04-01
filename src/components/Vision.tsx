export default function Vision() {
  return (
    <section className="section vision section--white" id="vision">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">The Movement</p>
          <h2 className="section-title">The NT Is Done Being Slept On.</h2>
          <p className="section-subtitle">
            Too many NT artists had to leave home just to be heard. That ends in 2027. Darwin Has Talent is the stage they never had — built right here, for all of them.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Stay Home. Blow Up.</h3>
            <p>No more moving interstate just to be heard. DHT gives NT artists a professional platform, real industry exposure, and a pathway to a music career — without leaving the Territory.</p>
          </div>
          <div className="pillar-card pillar-card--featured">
            <div className="pillar-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            </div>
            <h3>Every Corner. Every Voice.</h3>
            <p>From Alice Springs to Darwin — talent doesn&apos;t care about postcode. We&apos;re taking the stage to all four regions so no one gets left behind because of where they grew up.</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>This Is the Real Deal.</h3>
            <p>Professional production. Real mentors. Actual industry connections. DHT isn&apos;t a school concert — it&apos;s a launchpad built to the same standard as the national stage.</p>
          </div>
        </div>

        <div className="mission-block">
          <div className="mission-quote-mark">&ldquo;</div>
          <blockquote>
            To empower the next generation of Northern Territory musicians by bridging the gap
            between education and industry. Through a territory-wide search for excellence,
            Darwin Has Talent provides a professional platform, mentorship, and regional pathways
            that celebrate local voices, retain our talent, and place the NT at the heart of the
            Australian music map.
          </blockquote>
          <p className="mission-attr">— Darwin Has Talent Mission Statement</p>
        </div>

        <div className="documentary-teaser">
          <div className="doc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div className="doc-content">
            <span className="documentary-badge">Coming Soon</span>
            <h3>Sound of the Territory</h3>
            <p>Follow our journey from concept to stage in our upcoming documentary series, capturing the stories, sounds, and spirit of Territory musicians.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
