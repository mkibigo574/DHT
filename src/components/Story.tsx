import Image from 'next/image'
import AnimateIn from './AnimateIn'

export default function Story() {
  return (
    <section className="section story section--darker" id="story">
      <div className="container">
        <div className="story-layout">

          <AnimateIn variant="left" threshold={0.06}>
            <div className="story-visual">
              <div className="story-image">
                <Image
                  src="/assets/images/founder.jpg"
                  alt="Founder of Darwin Has Talent"
                  fill
                  sizes="450px"
                  className="story-image-photo"
                />
              </div>
              <div className="story-quote-card">
                <p>&ldquo;The NT shouldn&apos;t just be a place where talent is born — it should be a place where talent thrives.&rdquo;</p>
              </div>
            </div>
          </AnimateIn>

          <AnimateIn variant="right" delay={100} threshold={0.06}>
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
          </AnimateIn>

        </div>
      </div>
    </section>
  )
}
