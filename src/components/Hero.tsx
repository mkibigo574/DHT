'use client'
import { useState, useEffect, useRef } from 'react'

function getTimeLeft() {
  const target = new Date('2027-01-01T00:00:00').getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    secs: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  // null on the server — avoids SSR/client timestamp mismatch.
  // Populated on first client tick so the displayed value is always fresh.
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft())                             // immediate first value
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    const el = document.querySelector(target)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero">
      <video
        ref={videoRef}
        className={`hero-video${videoLoaded ? ' loaded' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        onCanPlayThrough={() => setVideoLoaded(true)}
      >
        <source src="https://d6ld87wsfjsa1dgh.public.blob.vercel-storage.com/Public/assets/videos/6013292_People_Friends_3840x2160.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-overlay" />
      <div className="hero-bg-effects">
        <div className="hero-glow hero-glow--1" />
        <div className="hero-glow hero-glow--2" />
        <div className="hero-glow hero-glow--3" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-layout">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>Auditions Now Open &mdash; Northern Territory</span>
          </div>
          <h1 className="hero-title">
            Perform.<br />
            Get Voted.<br />
            <span className="hero-title-accent">Blow Up.</span>
          </h1>
          <p className="hero-subtitle">
            NT artists — this is your moment. Compete across 4 regions, get voted through by the Territory, and win the stage, the spotlight, and the career doors that come with it.
          </p>
          <div className="hero-prizes">
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Perform live at the Darwin Grand Finale</span>
            </div>
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zm10.586 0L12 5.586v12.828l2.293 2.293A1 1 0 0016 20V10a1 1 0 00-.293-.707l-1.414-1.414z" clipRule="evenodd" />
              </svg>
              <span>Go viral &mdash; media spotlight &amp; industry deals</span>
            </div>
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm5.99 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span>Pro recording sessions &amp; real career mentorship</span>
            </div>
          </div>
          <div className="hero-cta">
            <a href="#resources" className="btn btn-primary btn-lg hero-cta-main" onClick={(e) => smoothScroll(e, '#resources')}>
              Audition Now &rarr;
            </a>
            <a href="#portals" className="btn btn-ghost btn-lg" onClick={(e) => smoothScroll(e, '#portals')}>See How It Works</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">4</span>
              <span className="hero-stat-label">Regions</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">3,000</span>
              <span className="hero-stat-label">Kilometres</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">1</span>
              <span className="hero-stat-label">Grand Finale</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-countdown-wrap">
            <p className="countdown-eyebrow">Grand Finale Countdown</p>
            <div className="countdown-grid">
              <div className="countdown-unit">
                <span className="countdown-num">{timeLeft ? timeLeft.days : '--'}</span>
                <span className="countdown-lbl">Days</span>
              </div>
              <div className="countdown-colon">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{timeLeft ? pad(timeLeft.hours) : '--'}</span>
                <span className="countdown-lbl">Hours</span>
              </div>
              <div className="countdown-colon">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{timeLeft ? pad(timeLeft.mins) : '--'}</span>
                <span className="countdown-lbl">Mins</span>
              </div>
              <div className="countdown-colon">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{timeLeft ? pad(timeLeft.secs) : '--'}</span>
                <span className="countdown-lbl">Secs</span>
              </div>
            </div>
            <p className="countdown-sub">Grand Finale &mdash; Darwin, NT &mdash; 2027</p>
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator">
        <span>Scroll to explore</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
