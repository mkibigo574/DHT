'use client'

const stops = [
  {
    region: 'Red Centre',
    city: 'Alice Springs',
    desc: "Where the journey begins. The ancient heart of Australia holds stories and sounds the world hasn't heard yet.",
    tag: 'Opening Heat',
    isFinal: false,
    cx: 243, cy: 453,
  },
  {
    region: 'Barkly Region',
    city: 'Tennant Creek',
    desc: 'The crossroads of the Territory. Where the highway meets heritage, voices that deserve to be heard.',
    tag: 'Regional Heat',
    isFinal: false,
    cx: 258, cy: 318,
  },
  {
    region: 'Big Rivers Region',
    city: 'Katherine',
    desc: 'Gorge country sets the scene for raw, unfiltered Territory talent. Known for resilience — and now, music.',
    tag: 'Regional Heat',
    isFinal: false,
    cx: 166, cy: 146,
  },
  {
    region: 'Top End',
    city: 'Darwin',
    desc: "The journey ends where the Territory's heart beats strongest. 3,000 km of music. One electrifying night.",
    tag: 'Grand Finale ★',
    isFinal: true,
    cx: 98, cy: 79,
  },
]

// Route path: Alice Springs → Tennant Creek → Katherine → Darwin
const routePath =
  'M 243,453 C 248,390 260,350 258,318 C 255,275 200,205 166,146 C 155,120 120,100 98,79'

// Simplified Northern Territory outline
const ntOutline =
  'M 10,47 Q 82,22 200,20 Q 300,20 368,47 L 408,165 L 408,523 L 10,523 Z'

export default function Roadmap() {
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
            From the Red Centre to the Top End — we&apos;re bringing the stage to every corner of
            the Territory.
          </p>
        </div>

        {/* SVG Territory Map */}
        <div className="rm-map-wrap">
          <svg
            viewBox="0 0 450 560"
            xmlns="http://www.w3.org/2000/svg"
            className="rm-map-svg"
            aria-label="DHT journey map: Alice Springs to Darwin across the Northern Territory"
          >
            <defs>
              <linearGradient id="rmRouteGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ff4d94" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
              <filter id="rmGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="rmSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* NT territory silhouette */}
            <path
              d={ntOutline}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Route glow shadow */}
            <path
              d={routePath}
              fill="none"
              stroke="rgba(255,77,148,0.18)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Route dashed line */}
            <path
              d={routePath}
              fill="none"
              stroke="url(#rmRouteGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="9 5"
              filter="url(#rmSoftGlow)"
            />

            {/* Animated travelling dot */}
            <circle r="5" fill="#ffffff" filter="url(#rmGlow)">
              <animateMotion dur="7s" repeatCount="indefinite" path={routePath} />
            </circle>

            {/* Stop markers + labels */}
            {stops.map((s) => (
              <g key={s.city}>
                {/* Darwin pulse rings */}
                {s.isFinal && (
                  <>
                    <circle cx={s.cx} cy={s.cy} r="10" fill="none" stroke="#ffd700" strokeWidth="1.5">
                      <animate attributeName="r" values="10;26" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={s.cx} cy={s.cy} r="10" fill="none" stroke="#ffd700" strokeWidth="1">
                      <animate attributeName="r" values="10;26" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Outer dot */}
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.isFinal ? 9 : 6}
                  fill={s.isFinal ? '#ffd700' : '#ff4d94'}
                  filter="url(#rmSoftGlow)"
                />
                {/* Inner white dot */}
                <circle cx={s.cx} cy={s.cy} r={s.isFinal ? 4 : 2.5} fill="#fff" />

                {/* City label */}
                <text
                  x={s.cx + 15}
                  y={s.cy - 3}
                  fill={s.isFinal ? '#ffd700' : '#ffffff'}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="inherit"
                >
                  {s.city}
                </text>
                <text
                  x={s.cx + 15}
                  y={s.cy + 11}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="10"
                  fontFamily="inherit"
                >
                  {s.region}
                </text>
                <text
                  x={s.cx + 15}
                  y={s.cy + 24}
                  fill={s.isFinal ? '#ffd700' : '#ff4d94'}
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="inherit"
                >
                  {s.tag}
                </text>
              </g>
            ))}

            {/* Footer note */}
            <text
              x="225"
              y="548"
              fill="rgba(255,255,255,0.25)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="inherit"
            >
              ≈ 3,000 km · Northern Territory, Australia
            </text>
          </svg>
        </div>

        {/* Description cards */}
        <div className="rm-cards-scroll">
          <div className="rm-cards">
            {stops.map((s) => (
              <div key={s.city} className={`rm-card${s.isFinal ? ' rm-card--final' : ''}`}>
                <div className="rm-card-city">{s.city}</div>
                <span className={`tc-tag${s.isFinal ? ' final-tag' : ''}`}>{s.tag}</span>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
