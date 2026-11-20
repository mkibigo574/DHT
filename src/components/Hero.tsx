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
          <p className="hero-kicker">Northern Territory, 2027</p>
          <h1 className="hero-title">
            This Is Your<br />
            <span className="hero-title-accent">Shot. Take It.</span>
          </h1>
          <p className="hero-subtitle">
            Darwin Has Talent is the NT&apos;s first territory-wide music competition. Audition. Get voted. Stand on the biggest stage the Territory has ever seen.
          </p>
          <ul className="hero-prizes">
            <li>Live grand finale in Darwin</li>
            <li>Industry exposure, media spotlight, go viral</li>
            <li>Pro mentorship, recording &amp; real career doors</li>
          </ul>
          <div className="hero-cta">
            <a href="#waitlist" className="btn btn-primary btn-lg" onClick={(e) => smoothScroll(e, '#waitlist')}>
              I Want In
            </a>
            <a href="#portals" className="btn btn-ghost btn-lg" onClick={(e) => smoothScroll(e, '#portals')}>How It Works</a>
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
    </section>
  )
}
