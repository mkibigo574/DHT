'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(target)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <a href="#" className="nav-logo" onClick={(e) => smoothScroll(e, '#hero')}>
          <Image src="/assets/images/logo.jpeg" alt="Darwin Has Talent" width={38} height={38} className="logo-img" />
          <span className="logo-text">DARWIN<span className="logo-accent">HAS</span>TALENT</span>
        </a>
        <button
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`nav-links${menuOpen ? ' open' : ''}`} id="navLinks">
          <li><a href="#vision" onClick={(e) => smoothScroll(e, '#vision')}>Vision</a></li>
          <li><a href="#roadmap" onClick={(e) => smoothScroll(e, '#roadmap')}>Roadmap</a></li>
          <li><a href="#portals" onClick={(e) => smoothScroll(e, '#portals')}>Get Involved</a></li>
          <li><a href="#story" onClick={(e) => smoothScroll(e, '#story')}>Our Story</a></li>
          <li><a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a></li>
          <li><a href="#donate" onClick={(e) => smoothScroll(e, '#donate')}>Donate</a></li>
          <li>
            <a href="#waitlist" className="btn btn-primary btn-nav" onClick={(e) => smoothScroll(e, '#waitlist')}>
              Join Waitlist
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
