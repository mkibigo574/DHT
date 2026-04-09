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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
          {/* Social icons — visible only in the mobile menu */}
          <li className="nav-social-row">
            <a href="https://www.instagram.com/darwinhastalent_nt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="nav-social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href="https://www.tiktok.com/@darwinhastalent" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="nav-social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
            </a>
            <a href="https://www.facebook.com/share/18DV43Hfcp/?mibextid=wwXlfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="nav-social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/darwin-has-talents" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="nav-social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
