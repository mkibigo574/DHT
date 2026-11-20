'use client'
import { useState, useRef, useSyncExternalStore } from 'react'

// Applications open at 9:00 am on Monday 23 November 2026, Darwin time (ACST, UTC+09:30).
// The explicit offset means every visitor counts down to the same moment, wherever they are.
const APPLICATIONS_OPEN = new Date('2026-11-23T09:00:00+09:30').getTime()

// The homepage is pre-rendered at deploy time, so the countdown must never be
// computed on the server (it would show the build-time numbers). Instead the
// browser reads the clock once a second; the server renders placeholders.
function subscribeToSeconds(onTick: () => void) {
  const timer = setInterval(onTick, 1000)
  return () => clearInterval(timer)
}
const currentSecond = () => Math.floor(Date.now() / 1000)
const noSecondOnServer = () => null

function getTimeLeft(nowMs: number) {
  const diff = Math.max(0, APPLICATIONS_OPEN - nowMs)
  return {
    open: diff === 0,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    secs: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const second = useSyncExternalStore(subscribeToSeconds, currentSecond, noSecondOnServer)
  const timeLeft = second === null ? null : getTimeLeft(second * 1000)
  const videoRef = useRef<HTMLVideoElement>(null)

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
        <source src="public\assets\videos\6013292_People_Friends_3840x2160.mp4" type="video/mp4" />
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
            <span>Northern Territory &mdash; The Countdown Is On</span>
          </div>
          <h1 className="hero-title">
            This Is Your<br />
            <span className="hero-title-accent">Shot. Take It.</span>
          </h1>
          <p className="hero-subtitle">
            Darwin Has Talent is the NT&apos;s first territory-wide music competition. Audition. Get voted. Stand on the biggest stage the Territory has ever seen.
          </p>
          <div className="hero-prizes">
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Live Grand Finale &mdash; Darwin, NT</span>
            </div>
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Industry exposure, media spotlight, go viral</span>
            </div>
            <div className="hero-prize-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Pro mentorship, recording &amp; real career doors</span>
            </div>
          </div>
          <div className="hero-cta">
            <a href="#waitlist" className="btn btn-primary btn-lg" onClick={(e) => smoothScroll(e, '#waitlist')}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="18">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              I Want In &rarr;
            </a>
            <a href="#portals" className="btn btn-ghost btn-lg" onClick={(e) => smoothScroll(e, '#portals')}>How It Works</a>
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
            <p className="countdown-eyebrow">
              {timeLeft?.open ? 'Applications are now open' : 'Applications open in'}
            </p>
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
            <p className="countdown-sub">Monday 23 November 2026, 9:00 am Darwin time</p>
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
