'use client'

const stops = [
  {
    region: 'Red Centre',
    city: 'Alice Springs',
    desc: "Where the journey begins. The ancient heart of Australia holds stories and sounds the world hasn't heard yet.",
    tag: 'Opening Heat',
    isFinal: false,
  },
  {
    region: 'Barkly Region',
    city: 'Tennant Creek',
    desc: 'The crossroads of the Territory. Where the highway meets heritage, voices that deserve to be heard.',
    tag: 'Regional Heat',
    isFinal: false,
  },
  {
    region: 'Big Rivers Region',
    city: 'Katherine',
    desc: 'Gorge country sets the scene for raw, unfiltered Territory talent. Known for resilience — and now, music.',
    tag: 'Regional Heat',
    isFinal: false,
  },
  {
    region: 'Top End',
    city: 'Darwin',
    desc: "The journey ends where the Territory's heart beats strongest. 3,000 km of music. One electrifying night.",
    tag: 'Grand Finale ★',
    isFinal: true,
  },
]

export default function Roadmap() {
  return (
    <section className="section roadmap section--dark" id="roadmap">
      <div className="roadmap-bg-glow" />

      {/* Section heading — inside container */}
      <div className="container">
        <div className="section-header on-dark">
          <p className="section-tag">The Journey</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            4 Regions. 3,000 Kilometres.
            <br />
            <span className="gradient-text">One Grand Finale.</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted-dark)' }}>
            From the Red Centre to the Top End — we&apos;re bringing the stage to every corner of
            the Territory.
          </p>
        </div>
      </div>

      {/*
        ===== DESKTOP: Three.js 3D scene =====
        Sits outside .container for full-bleed width.
        .rm-scene--3d applies ::before/::after gradient fades that blend the
        scene's dark background (#0B0F1A) into the section background (#1F2A44),
        so there's no visible iframe box edge.
      */}
      <div className="rm-scene rm-scene--3d">
        <iframe
          src="/roadmap-3d.html"
          title="DHT 3D Journey Map — 4 regions across the Northern Territory"
          className="rm-iframe"
          allowFullScreen
        />
      </div>

      {/* Description cards + mobile timeline — back inside container */}
      <div className="container">
        <div className="rm-cards">
          {stops.map((s) => (
            <div key={s.city} className={`rm-card${s.isFinal ? ' rm-card--final' : ''}`}>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ===== MOBILE: vertical timeline ===== */}
        <div className="rm-mobile">
          {stops.map((s, i) => (
            <div key={s.city} className="rm-mobile-stop">
              <div className="rm-mobile-spine">
                <div className={`rm-mobile-dot${s.isFinal ? ' final' : ''}`} />
                {i < stops.length - 1 && <div className="rm-mobile-line" />}
              </div>
              <div className={`rm-mobile-card glass-card${s.isFinal ? ' rm-mobile-card--final' : ''}`}>
                <div className="tc-region">{s.region}</div>
                <h3 className="rm-city-name">{s.city}</h3>
                <p className="rm-city-desc">{s.desc}</p>
                <span className={`tc-tag${s.isFinal ? ' final-tag' : ''}`}>{s.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
