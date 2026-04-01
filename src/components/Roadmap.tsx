'use client'
import { useEffect } from 'react'

const PATH =
  'M 40,170 C 160,118 240,224 380,166 C 492,118 572,212 720,158 C 842,116 932,202 1062,156 C 1122,138 1158,148 1192,145'

const DURATION = 13 // seconds per loop
const VIEWBOX_W = 1240
const VIEWBOX_H = 320

const stops = [
  {
    region: 'Red Centre',
    city: 'Alice Springs',
    desc: 'Where the journey begins. The ancient heart of Australia holds stories and sounds the world hasn\'t heard yet.',
    tag: 'Opening Heat',
    isFinal: false,
    cx: 40,
    cy: 170,
    above: false,
  },
  {
    region: 'Barkly Region',
    city: 'Tennant Creek',
    desc: 'The crossroads of the Territory. Where the highway meets heritage, voices that deserve to be heard.',
    tag: 'Regional Heat',
    isFinal: false,
    cx: 380,
    cy: 166,
    above: true,
  },
  {
    region: 'Big Rivers Region',
    city: 'Katherine',
    desc: 'Gorge country sets the scene for raw, unfiltered Territory talent. Known for resilience — and now, music.',
    tag: 'Regional Heat',
    isFinal: false,
    cx: 720,
    cy: 158,
    above: false,
  },
  {
    region: 'Top End',
    city: 'Darwin',
    desc: 'The journey ends where the Territory\'s heart beats strongest. 3,000 km of music. One electrifying night.',
    tag: 'Grand Finale',
    isFinal: true,
    cx: 1192,
    cy: 145,
    above: true,
  },
]

export default function Roadmap() {
  // Fire confetti once when the bus first reaches Darwin (~88% through)
  useEffect(() => {
    const t = setTimeout(() => {
      import('canvas-confetti').then((m) =>
        m.default({
          particleCount: 160,
          spread: 110,
          origin: { y: 0.45 },
          colors: ['#FF6B6B', '#FF9A8B', '#FFD700', '#ffffff', '#FF6B6B'],
        })
      )
    }, DURATION * 0.88 * 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="section roadmap section--dark" id="roadmap">
      <div className="roadmap-bg-glow" />
      <div className="container">
        <div className="section-header on-dark">
          <p className="section-tag">The Journey</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            4 Regions. 3,000 Kilometres.
            <br />
            <span className="gradient-text">One Grand Finale.</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted-dark)' }}>
            From the Red Centre to the Top End — we&apos;re bringing the stage to every corner of the Territory.
          </p>
        </div>

        {/* ===== DESKTOP: animated winding road ===== */}
        <div className="rm-scene">
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            width="100%"
            className="rm-svg"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="rm-glow">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="rm-dot-glow">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="rm-road-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a2540" />
                <stop offset="100%" stopColor="#1e2e50" />
              </linearGradient>
            </defs>

            {/* ——— Road layers ——— */}
            {/* Drop shadow */}
            <path d={PATH} stroke="rgba(0,0,0,0.45)" strokeWidth="36" fill="none" strokeLinecap="round" />
            {/* Road base (dark asphalt) */}
            <path d={PATH} stroke="url(#rm-road-grad)" strokeWidth="28" fill="none" strokeLinecap="round" />
            {/* Road surface highlight */}
            <path d={PATH} stroke="#2d3f66" strokeWidth="22" fill="none" strokeLinecap="round" />
            {/* Edge markings */}
            <path d={PATH} stroke="rgba(255,220,80,0.18)" strokeWidth="22" fill="none" strokeLinecap="round" strokeDasharray="40 20" />
            {/* White centre dashes */}
            <path d={PATH} stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" fill="none" strokeDasharray="22 16" strokeLinecap="round" />

            {/* ——— Stop markers ——— */}
            {stops.map((s) => {
              const R = s.isFinal ? 10 : 7
              const connY1 = s.above ? s.cy - R : s.cy + R
              const connY2 = s.above ? s.cy - 32 : s.cy + 32
              const labelY = s.above
                ? [s.cy - 88, s.cy - 68, s.cy - 50]   // region, city, tag
                : [s.cy + 48, s.cy + 66, s.cy + 82]

              return (
                <g key={s.city}>
                  {/* Outer pulse ring */}
                  <circle cx={s.cx} cy={s.cy} r={R + 10} fill="rgba(255,107,107,0.08)" filter="url(#rm-glow)" />
                  <circle cx={s.cx} cy={s.cy} r={R + 5} fill="none" stroke="rgba(255,107,107,0.22)" strokeWidth="1.5" />
                  {/* Dot */}
                  <circle cx={s.cx} cy={s.cy} r={R} fill="#FF6B6B" filter="url(#rm-dot-glow)" />
                  <circle cx={s.cx} cy={s.cy} r={R * 0.38} fill="#fff" />

                  {/* Connector line */}
                  <line
                    x1={s.cx} y1={connY1}
                    x2={s.cx} y2={connY2}
                    stroke="rgba(255,107,107,0.28)" strokeWidth="1.5" strokeDasharray="4 3"
                  />

                  {/* Labels */}
                  <text x={s.cx} y={labelY[0]} textAnchor="middle" fill="rgba(255,107,107,0.75)"
                    fontSize="9" fontWeight="700" fontFamily="Poppins,sans-serif" letterSpacing="2.5">
                    {s.region.toUpperCase()}
                  </text>
                  <text x={s.cx} y={labelY[1]} textAnchor="middle" fill="#fff"
                    fontSize={s.isFinal ? 18 : 14} fontWeight="900" fontFamily="Poppins,sans-serif" letterSpacing="-0.3">
                    {s.city}
                  </text>
                  <text x={s.cx} y={labelY[2]} textAnchor="middle"
                    fill={s.isFinal ? '#FF6B6B' : 'rgba(234,234,234,0.4)'}
                    fontSize="8" fontWeight="600" fontFamily="Poppins,sans-serif" letterSpacing="2">
                    {s.tag.toUpperCase()}
                  </text>

                  {/* Star badge for Darwin */}
                  {s.isFinal && (
                    <text x={s.cx + 18} y={labelY[1] + 2} fill="#FFD700" fontSize="13">★</text>
                  )}
                </g>
              )
            })}

            {/* ——— Hidden reference path for animateMotion ——— */}
            <path id="rm-route" d={PATH} fill="none" stroke="none" />

            {/* ——— Animated Bus ——— */}
            <g>
              {/* Offset so bus body centre rides on the path */}
              <g transform="translate(-46, -24)">
                {/* Wheel shadow */}
                <ellipse cx="46" cy="52" rx="40" ry="5" fill="rgba(0,0,0,0.28)" />

                {/* Roof cap */}
                <rect x="6" y="1" width="78" height="12" rx="5" fill="#cc4444" />

                {/* Bus body */}
                <rect x="2" y="6" width="86" height="32" rx="7" fill="#FF6B6B" />

                {/* Body bottom stripe */}
                <rect x="2" y="30" width="86" height="8" rx="3" fill="#e55555" />

                {/* Windows */}
                <rect x="9"  y="12" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="27" y="12" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="45" y="12" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="63" y="12" width="13" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />

                {/* Windscreen */}
                <rect x="78" y="10" width="9" height="18" rx="3" fill="rgba(160,215,255,0.9)" />

                {/* Front bumper */}
                <rect x="76" y="30" width="12" height="5" rx="2" fill="#aa3333" />

                {/* Text on bus */}
                <text x="41" y="23" textAnchor="middle" fill="rgba(255,255,255,0.95)"
                  fontSize="6.5" fontWeight="800" fontFamily="Poppins,sans-serif">DHT TOUR</text>
                <text x="41" y="32" textAnchor="middle" fill="rgba(255,220,90,0.65)"
                  fontSize="5" fontFamily="sans-serif">★  ★  ★</text>

                {/* Wheels */}
                <circle cx="21" cy="42" r="9" fill="#141e30" />
                <circle cx="21" cy="42" r="6" fill="#2a3a55" />
                <circle cx="21" cy="42" r="2.5" fill="#5a6a8a" />
                <circle cx="65" cy="42" r="9" fill="#141e30" />
                <circle cx="65" cy="42" r="6" fill="#2a3a55" />
                <circle cx="65" cy="42" r="2.5" fill="#5a6a8a" />
              </g>

              <animateMotion dur={`${DURATION}s`} repeatCount="indefinite" rotate="auto">
                <mpath href="#rm-route" />
              </animateMotion>
            </g>
          </svg>

          {/* Description cards beneath the road */}
          <div className="rm-cards">
            {stops.map((s) => (
              <div key={s.city} className={`rm-card${s.isFinal ? ' rm-card--final' : ''}`}>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== MOBILE: vertical timeline ===== */}
        <div className="rm-mobile">
          {stops.map((s, i) => (
            <div key={s.city} className="rm-mobile-stop">
              <div className="rm-mobile-spine">
                <div className={`rm-mobile-dot${s.isFinal ? ' final' : ''}`} />
                {i < stops.length - 1 && <div className="rm-mobile-line" />}
              </div>
              <div className="rm-mobile-card glass-card">
                <div className="tc-region">{s.region}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: '#fff', margin: '4px 0 8px', letterSpacing: '-0.02em' }}>{s.city}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-muted-dark)', lineHeight: 1.72, marginBottom: 12 }}>{s.desc}</p>
                <span className={`tc-tag${s.isFinal ? ' final-tag' : ''}`}>{s.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
