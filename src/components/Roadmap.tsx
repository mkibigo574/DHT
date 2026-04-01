'use client'
import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

const stops = [
  { num: '04', region: 'Red Centre', city: 'Alice Springs', desc: 'Where the journey begins. The ancient heart of Australia holds stories and sounds that the world hasn\'t heard yet.', tag: 'Opening Heat', isFinal: false },
  { num: '03', region: 'Barkly Region', city: 'Tennant Creek', desc: 'The crossroads of the Territory. Where the highway meets heritage, we\'ll find voices that deserve to be heard.', tag: 'Regional Heat', isFinal: false },
  { num: '02', region: 'Big Rivers Region', city: 'Katherine', desc: 'The gorge country backdrop sets the scene for raw, unfiltered Territory talent.', tag: 'Regional Heat', isFinal: false },
  { num: '01', region: 'Top End', city: 'Darwin', desc: 'The journey ends where the Territory\'s heart beats strongest. Our Grand Finale brings 3,000 kilometres of music to one electrifying night.', tag: 'Grand Finale', isFinal: true },
]

function BusSVG() {
  return (
    <svg viewBox="0 0 80 40" width="80" height="40">
      <rect x="2" y="8" width="76" height="24" rx="6" fill="#FF6B6B" />
      <rect x="8" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="22" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="36" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="50" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
      <circle cx="18" cy="34" r="6" fill="#1F2A44" />
      <circle cx="18" cy="34" r="3" fill="#9CA3AF" />
      <circle cx="60" cy="34" r="6" fill="#1F2A44" />
      <circle cx="60" cy="34" r="3" fill="#9CA3AF" />
      <text x="40" y="26" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">DHT TOUR</text>
    </svg>
  )
}

export default function Roadmap() {
  const sectionRef = useRef<HTMLElement>(null)
  const [confettiFired, setConfettiFired] = useState(false)
  const [activeStop, setActiveStop] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Map scroll progress to x position (as percentage, 0–100%)
  const vehicleX = useTransform(scrollYProgress, [0.1, 0.9], ['2%', '96%'])
  // Map scroll progress to y position for vertical layout
  const vehicleY = useTransform(scrollYProgress, [0.1, 0.9], ['2%', '96%'])

  // Subtle bounce
  const vehicleBounce = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    [0, -3, 0, -3, 0, -3, 0, -3, 0, -3, 0]
  )

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      // Update active stop based on progress
      if (v < 0.3) setActiveStop(0)
      else if (v < 0.5) setActiveStop(1)
      else if (v < 0.7) setActiveStop(2)
      else setActiveStop(3)

      // Fire confetti when reaching Darwin
      if (v > 0.82 && !confettiFired) {
        setConfettiFired(true)
        import('canvas-confetti').then((m) => m.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FF6B6B', '#FF9A8B', '#FFD700', '#ffffff'],
        }))
      }
    })
    return unsubscribe
  }, [scrollYProgress, confettiFired])

  // Stop positions as percentages across the road (0=Alice Springs, 100=Darwin)
  const stopPositions = [3, 34, 66, 97]

  return (
    <section className="section roadmap section--dark" id="roadmap" ref={sectionRef}>
      <div className="roadmap-bg-glow" />
      <div className="container">
        <div className="section-header on-dark">
          <p className="section-tag">The Journey</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            4 Regions. 3,000 Kilometres.<br />
            <span className="gradient-text">One Grand Finale.</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted-dark)' }}>
            From the Top End to the Red Centre — we&apos;re bringing the stage to every corner of the Territory.
          </p>
        </div>

        {/* ===== DESKTOP HORIZONTAL ROAD ===== */}
        <div className="road-container">
          {/* Labels above (stops 1 & 3: Alice Springs, Katherine) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
            {stops.map((stop, i) => (
              <div key={stop.city} style={{ flex: 1, textAlign: 'center' }}>
                {i % 2 === 0 ? (
                  <div className="road-stop-label-above">
                    <div className={`road-stop-region`}>{stop.region}</div>
                    <div className={`road-stop-city${activeStop === i ? ' active-city' : ''}`}>{stop.city}</div>
                    <div className="road-stop-desc">{stop.desc}</div>
                    <span className={`road-stop-tag${stop.isFinal ? ' final' : ''}`}>{stop.tag}</span>
                  </div>
                ) : (
                  <div style={{ minHeight: 100 }} />
                )}
              </div>
            ))}
          </div>

          {/* Road with markers */}
          <div className="road-track-wrap" style={{ position: 'relative' }}>
            {/* Stop markers positioned on track */}
            {stops.map((stop, i) => (
              <div
                key={stop.city}
                className="road-marker-wrap"
                style={{
                  position: 'absolute',
                  left: `${stopPositions[i]}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              >
                <div className={`road-stop-marker${activeStop === i ? ' active' : ''}`}>
                  <div className="road-stop-pulse" />
                </div>
              </div>
            ))}

            <div className="road-track">
              <div className="road-dashes" />
            </div>

            {/* Animated vehicle */}
            <motion.div
              className="road-vehicle"
              style={{ left: vehicleX, top: vehicleBounce }}
            >
              <BusSVG />
            </motion.div>
          </div>

          {/* Labels below (stops 2 & 4: Tennant Creek, Darwin) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 0 }}>
            {stops.map((stop, i) => (
              <div key={stop.city} style={{ flex: 1, textAlign: 'center' }}>
                {i % 2 === 1 ? (
                  <div className="road-stop-label-below">
                    <div className="road-stop-region">{stop.region}</div>
                    <div className={`road-stop-city${activeStop === i ? ' active-city' : ''}`}>{stop.city}</div>
                    <div className="road-stop-desc">{stop.desc}</div>
                    <span className={`road-stop-tag${stop.isFinal ? ' final' : ''}`}>{stop.tag}</span>
                  </div>
                ) : (
                  <div style={{ minHeight: 100 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== MOBILE VERTICAL ROAD ===== */}
        <div className="road-vertical-container">
          <div className="road-vertical-line" />
          <div className="road-vertical-dashes" />

          {/* Animated vehicle (vertical) */}
          <motion.div
            className="road-vertical-vehicle"
            style={{ top: vehicleY }}
          >
            <BusSVG />
          </motion.div>

          <div className="road-vertical-stops">
            {stops.map((stop, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={stop.city} className="road-vertical-stop" style={{ position: 'relative', minHeight: 100, display: 'flex', alignItems: 'center' }}>
                  {isLeft ? (
                    <>
                      <div className="road-vertical-stop-content road-vertical-stop-left" style={{ width: 'calc(50% - 30px)', textAlign: 'right', paddingRight: 20 }}>
                        <div className="road-stop-region">{stop.region}</div>
                        <div className={`road-stop-city${activeStop === i ? ' active-city' : ''}`}>{stop.city}</div>
                        <div className="road-stop-desc" style={{ marginLeft: 'auto' }}>{stop.desc}</div>
                        <span className={`road-stop-tag${stop.isFinal ? ' final' : ''}`}>{stop.tag}</span>
                      </div>
                      <div style={{ width: 60, display: 'flex', justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        <div className={`road-vertical-marker${activeStop === i ? ' active' : ''}`} />
                      </div>
                      <div style={{ width: 'calc(50% - 30px)', marginLeft: 'auto' }} />
                    </>
                  ) : (
                    <>
                      <div style={{ width: 'calc(50% - 30px)' }} />
                      <div style={{ width: 60, display: 'flex', justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        <div className={`road-vertical-marker${activeStop === i ? ' active' : ''}`} />
                      </div>
                      <div className="road-vertical-stop-content road-vertical-stop-right" style={{ width: 'calc(50% - 30px)', textAlign: 'left', paddingLeft: 20, marginLeft: 'auto' }}>
                        <div className="road-stop-region">{stop.region}</div>
                        <div className={`road-stop-city${activeStop === i ? ' active-city' : ''}`}>{stop.city}</div>
                        <div className="road-stop-desc">{stop.desc}</div>
                        <span className={`road-stop-tag${stop.isFinal ? ' final' : ''}`}>{stop.tag}</span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
