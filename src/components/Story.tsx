export default function Story() {
  return (
    <section className="section story section--darker" id="story">
      <div className="container">
        <div className="story-layout">
          <div className="story-visual">
            <div className="story-image-placeholder">
              <div className="placeholder-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="rgba(255,107,107,0.5)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="24" cy="18" r="10" />
                  <path d="M8 42c0-9 7-16 16-16s16 7 16 16" />
                </svg>
              </div>
              <span>Founder Photo</span>
              <p>Territory-grown family initiative</p>
            </div>
            <div className="story-quote-card">
              <p>&ldquo;The NT shouldn&apos;t just be a place where talent is born — it should be a place where talent thrives.&rdquo;</p>
            </div>
          </div>

          <div className="story-content">
            <p className="section-tag">Our Story</p>
            <h2 className="section-title">From a Parent&apos;s Vision<br />to a Territory Stage</h2>
            <div className="story-text">
              <p>Darwin Has Talent wasn&apos;t born in a boardroom; it was born at the kitchen table and in the front row of school concerts.</p>
              <p>As a parent of a talented Year 12 music student in Darwin, I saw firsthand the incredible raw talent our young people possess. But I also saw the &ldquo;cliff&rdquo; they face after graduation.</p>
              <p>I watched my daughter and her peers wonder: <em>&ldquo;Do I have to move to the southern states to be heard?&rdquo;</em></p>
              <p>My answer was a definitive <strong className="coral-text">&ldquo;No.&rdquo;</strong></p>
              <p>I believe that the Northern Territory shouldn&apos;t just be a place where talent is born — it should be a place where talent thrives.</p>
              <p className="story-highlight">Darwin Has Talent is that bridge.</p>
              <p>Launching in 2027, we are taking a stage across 3,000 kilometres — from the Red Centre to the Top End — to find, mentor, and elevate the next generation of Territory stars.</p>
              <p className="story-sign-off">Join us as we find the sound of the Territory.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
