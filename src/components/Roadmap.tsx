'use client'
import { useEffect, useRef } from 'react'

const PATH_D =
  'M 40,170 C 160,118 240,224 380,166 C 492,118 572,212 720,158 C 842,116 932,202 1062,156 C 1122,138 1158,148 1192,145'

const DURATION = 18000 // ms per loop
const VW = 1240
const VH = 320

const stops = [
  {
    region: 'Red Centre',
    city: 'Alice Springs',
    desc: "Where the journey begins. The ancient heart of Australia holds stories and sounds the world hasn't heard yet.",
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
    desc: "The journey ends where the Territory's heart beats strongest. 3,000 km of music. One electrifying night.",
    tag: 'Grand Finale',
    isFinal: true,
    cx: 1192,
    cy: 145,
    above: true,
  },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

// Full camera state that we interpolate every frame
type Cam = {
  rotX: number   // tilt up/down  (aerial = high +value, ground = 0)
  rotY: number   // yaw left/right (front-ish = negative, celebration = slight positive)
  transY: number // vertical shift on the container (px, used during aerial)
  vbx: number    // SVG viewBox origin x
  vby: number    // SVG viewBox origin y
  vbw: number    // SVG viewBox width
  vbh: number    // SVG viewBox height
}

function lerpCam(a: Cam, b: Cam, t: number): Cam {
  return {
    rotX:   lerp(a.rotX,   b.rotX,   t),
    rotY:   lerp(a.rotY,   b.rotY,   t),
    transY: lerp(a.transY, b.transY, t),
    vbx:    lerp(a.vbx,    b.vbx,    t),
    vby:    lerp(a.vby,    b.vby,    t),
    vbw:    lerp(a.vbw,    b.vbw,    t),
    vbh:    lerp(a.vbh,    b.vbh,    t),
  }
}

export default function Roadmap() {
  const svgRef     = useRef<SVGSVGElement>(null)
  const pathRef    = useRef<SVGPathElement>(null)
  const busRef     = useRef<SVGGElement>(null)
  const canvasRef  = useRef<HTMLDivElement>(null) // receives CSS 3D transform
  const camRef     = useRef<Cam>({
    rotX: 52, rotY: 0, transY: -24,
    vbx: 0, vby: -10, vbw: VW, vbh: VH + 20,
  })
  const prevTRef   = useRef(0)

  useEffect(() => {
    const svg    = svgRef.current
    const path   = pathRef.current
    const bus    = busRef.current
    const canvas = canvasRef.current
    if (!svg || !path || !bus || !canvas) return

    const totalLen = path.getTotalLength()
    let startTime: number | null = null
    let confettiFired = false
    let rafId: number

    // Capture as non-null locals — TS can't narrow through the rAF closure boundary
    const svgEl    = svg
    const pathEl   = path
    const busEl    = bus
    const canvasEl = canvas

    function animate(now: number) {
      if (!startTime) startTime = now
      const elapsed = (now - startTime) % DURATION
      const t = elapsed / DURATION

      // ── Loop reset: snap camera back to aerial instantly ──
      if (t < prevTRef.current - 0.5) {
        camRef.current = {
          rotX: 52, rotY: 0, transY: -24,
          vbx: 0, vby: -10, vbw: VW, vbh: VH + 20,
        }
        confettiFired = false
      }
      prevTRef.current = t

      // ── Bus position & heading ──
      const dist  = t * totalLen
      const pt    = pathEl.getPointAtLength(dist)
      const ahead = pathEl.getPointAtLength(Math.min(dist + 2, totalLen))
      const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * (180 / Math.PI)
      // (0,0) in bus coords = road contact point; wheel centres at cy=−9 r=9 → bottom y=0
      busEl.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`)

      // ── Target camera for this moment ──
      //
      // 0.00–0.63 │ AERIAL      – high angle bird's-eye, full road visible
      // 0.63–0.76 │ TRANSITION  – camera swoops down and in to side position
      // 0.76–0.87 │ SIDE        – tight follow-cam from the side, flat
      // 0.87–0.93 │ FRONT       – camera swings ahead, slight rotateY so bus faces us
      // 0.93–1.00 │ CELEBRATE   – pulls back, rotates to side celebration shot

      let target: Cam

      if (t < 0.63) {
        // Aerial: gently pan right as bus moves; slight pull-in near end of phase
        const panProgress = smoothstep(t / 0.63)
        const pullIn = 1 + panProgress * 0.15
        target = {
          rotX:   52,
          rotY:   0,
          transY: -24,
          vbx:    lerp(0, Math.max(0, pt.x - VW * 0.38), panProgress),
          vby:    -10,
          vbw:    VW / pullIn,
          vbh:    (VH + 20) / pullIn,
        }

      } else if (t < 0.76) {
        // Swoop down: aerial → side
        const alpha = smoothstep((t - 0.63) / 0.13)
        const aerialSnap: Cam = {
          rotX:   52, rotY: 0, transY: -24,
          vbx: Math.max(0, pt.x - VW * 0.38),
          vby: -10,
          vbw: VW * 0.84,
          vbh: (VH + 20) * 0.84,
        }
        const sideTarget: Cam = {
          rotX:   0, rotY: 0, transY: 0,
          vbx: Math.max(0, pt.x - 145),
          vby: pt.y - 78,
          vbw: 340,
          vbh: 188,
        }
        target = lerpCam(aerialSnap, sideTarget, alpha)

      } else if (t < 0.87) {
        // Side follow-cam: flat, tracks bus closely
        target = {
          rotX: 0, rotY: 0, transY: 0,
          vbx: Math.max(0, pt.x - 145),
          vby: pt.y - 78,
          vbw: 340,
          vbh: 188,
        }

      } else if (t < 0.93) {
        // Front: camera swings to be slightly ahead of the bus; rotateY pulls
        // the scene so the bus front faces towards the viewer
        const alpha = smoothstep((t - 0.87) / 0.06)
        const sideSnap: Cam = {
          rotX: 0, rotY: 0, transY: 0,
          vbx: Math.max(0, pt.x - 145),
          vby: pt.y - 78,
          vbw: 340,
          vbh: 188,
        }
        const frontTarget: Cam = {
          rotX: 0, rotY: -22, transY: 0,
          vbx: pt.x - 80,
          vby: pt.y - 65,
          vbw: 160,
          vbh: 120,
        }
        target = lerpCam(sideSnap, frontTarget, alpha)

      } else {
        // Celebration: camera eases back and rotates to a wide side-angle shot
        const alpha = smoothstep((t - 0.93) / 0.07)
        const frontSnap: Cam = {
          rotX: 0, rotY: -22, transY: 0,
          vbx: pt.x - 80,
          vby: pt.y - 65,
          vbw: 160,
          vbh: 120,
        }
        const celebTarget: Cam = {
          rotX: 0, rotY: 12, transY: 0,
          vbx: Math.max(0, pt.x - 220),
          vby: pt.y - 90,
          vbw: 500,
          vbh: 235,
        }
        target = lerpCam(frontSnap, celebTarget, alpha)
      }

      // ── Smooth camera toward target ──
      const k = t < 0.04 ? 0.20 : 0.05          // snap on loop reset, ease otherwise
      const cam = camRef.current
      const next: Cam = {
        rotX:   lerp(cam.rotX,   target.rotX,   k),
        rotY:   lerp(cam.rotY,   target.rotY,   k),
        transY: lerp(cam.transY, target.transY, k),
        vbx:    lerp(cam.vbx,    target.vbx,    k),
        vby:    lerp(cam.vby,    target.vby,    k),
        vbw:    lerp(cam.vbw,    target.vbw,    k),
        vbh:    lerp(cam.vbh,    target.vbh,    k),
      }
      camRef.current = next

      // ── Apply CSS 3D transform (camera tilt / yaw) ──
      canvasEl.style.transform =
        `perspective(900px) rotateX(${next.rotX}deg) rotateY(${next.rotY}deg) translateY(${next.transY}px)`

      // ── Apply SVG viewBox (zoom / pan) ──
      svgEl.setAttribute('viewBox', `${next.vbx} ${next.vby} ${next.vbw} ${next.vbh}`)

      // ── Confetti at Darwin ──
      if (t > 0.87 && !confettiFired) {
        confettiFired = true
        import('canvas-confetti').then((m) =>
          m.default({
            particleCount: 200,
            spread: 130,
            origin: { y: 0.45 },
            colors: ['#FF6B6B', '#FF9A8B', '#FFD700', '#ffffff'],
          }),
        )
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
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
            From the Red Centre to the Top End — we&apos;re bringing the stage to every corner of
            the Territory.
          </p>
        </div>

        {/* ===== DESKTOP: animated winding road ===== */}
        <div className="rm-scene">
          {/* rm-canvas receives the CSS 3D camera transform */}
          <div ref={canvasRef} className="rm-canvas">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VW} ${VH}`}
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
              <path d={PATH_D} stroke="rgba(0,0,0,0.45)" strokeWidth="36" fill="none" strokeLinecap="round" />
              <path d={PATH_D} stroke="url(#rm-road-grad)" strokeWidth="28" fill="none" strokeLinecap="round" />
              <path d={PATH_D} stroke="#2d3f66" strokeWidth="22" fill="none" strokeLinecap="round" />
              <path d={PATH_D} stroke="rgba(255,220,80,0.18)" strokeWidth="22" fill="none" strokeLinecap="round" strokeDasharray="40 20" />
              <path d={PATH_D} stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" fill="none" strokeDasharray="22 16" strokeLinecap="round" />

              {/* ——— Stop markers ——— */}
              {stops.map((s) => {
                const R = s.isFinal ? 10 : 7
                const connY1 = s.above ? s.cy - R : s.cy + R
                const connY2 = s.above ? s.cy - 32 : s.cy + 32
                const labelY = s.above
                  ? [s.cy - 88, s.cy - 68, s.cy - 50]
                  : [s.cy + 48, s.cy + 66, s.cy + 82]
                return (
                  <g key={s.city}>
                    <circle cx={s.cx} cy={s.cy} r={R + 10} fill="rgba(255,107,107,0.08)" filter="url(#rm-glow)" />
                    <circle cx={s.cx} cy={s.cy} r={R + 5} fill="none" stroke="rgba(255,107,107,0.22)" strokeWidth="1.5" />
                    <circle cx={s.cx} cy={s.cy} r={R} fill="#FF6B6B" filter="url(#rm-dot-glow)" />
                    <circle cx={s.cx} cy={s.cy} r={R * 0.38} fill="#fff" />
                    <line x1={s.cx} y1={connY1} x2={s.cx} y2={connY2} stroke="rgba(255,107,107,0.28)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <text x={s.cx} y={labelY[0]} textAnchor="middle" fill="rgba(255,107,107,0.75)" fontSize="9" fontWeight="700" fontFamily="Poppins,sans-serif" letterSpacing="2.5">
                      {s.region.toUpperCase()}
                    </text>
                    <text x={s.cx} y={labelY[1]} textAnchor="middle" fill="#fff" fontSize={s.isFinal ? 18 : 14} fontWeight="900" fontFamily="Poppins,sans-serif" letterSpacing="-0.3">
                      {s.city}
                    </text>
                    <text x={s.cx} y={labelY[2]} textAnchor="middle" fill={s.isFinal ? '#FF6B6B' : 'rgba(234,234,234,0.4)'} fontSize="8" fontWeight="600" fontFamily="Poppins,sans-serif" letterSpacing="2">
                      {s.tag.toUpperCase()}
                    </text>
                    {s.isFinal && (
                      <text x={s.cx + 18} y={labelY[1] + 2} fill="#FFD700" fontSize="13">★</text>
                    )}
                  </g>
                )
              })}

              {/* ——— Measurement path (invisible) ——— */}
              <path ref={pathRef} id="rm-route" d={PATH_D} fill="none" stroke="none" />

              {/* ——— Bus — single side-view shape, always consistent ———
                  Transform is set by JS each frame:
                    translate(roadX, roadY) rotate(pathAngle)
                  Within that local space (0,0) = road contact point.
                  Wheel centres at cy=−9, radius 9 → bottom y=0 (touches road). */}
              <g ref={busRef}>
                {/* Ground shadow */}
                <ellipse cx="0" cy="5" rx="44" ry="5" fill="rgba(0,0,0,0.28)" />
                {/* Roof cap */}
                <rect x="-40" y="-50" width="78" height="12" rx="5" fill="#cc4444" />
                {/* Bus body */}
                <rect x="-44" y="-45" width="86" height="32" rx="7" fill="#FF6B6B" />
                {/* Body bottom stripe */}
                <rect x="-44" y="-21" width="86" height="8" rx="3" fill="#e55555" />
                {/* Windows */}
                <rect x="-37" y="-39" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="-19" y="-39" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="-1"  y="-39" width="14" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                <rect x="17"  y="-39" width="13" height="13" rx="2.5" fill="rgba(180,225,255,0.85)" />
                {/* Windscreen */}
                <rect x="32"  y="-41" width="9"  height="18" rx="3" fill="rgba(160,215,255,0.9)" />
                {/* Front bumper */}
                <rect x="30"  y="-21" width="12" height="5" rx="2" fill="#aa3333" />
                {/* Headlight */}
                <circle cx="40" cy="-19" r="2.5" fill="#FFE066" opacity="0.9" />
                {/* Label */}
                <text x="-5" y="-28" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="6.5" fontWeight="800" fontFamily="Poppins,sans-serif">DHT TOUR</text>
                <text x="-5" y="-19" textAnchor="middle" fill="rgba(255,220,90,0.65)" fontSize="5" fontFamily="sans-serif">★  ★  ★</text>
                {/* Left wheel */}
                <circle cx="-25" cy="-9" r="9" fill="#141e30" />
                <circle cx="-25" cy="-9" r="6" fill="#2a3a55" />
                <circle cx="-25" cy="-9" r="2.5" fill="#5a6a8a" />
                {/* Right wheel */}
                <circle cx="19"  cy="-9" r="9" fill="#141e30" />
                <circle cx="19"  cy="-9" r="6" fill="#2a3a55" />
                <circle cx="19"  cy="-9" r="2.5" fill="#5a6a8a" />
              </g>
            </svg>
          </div>

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
