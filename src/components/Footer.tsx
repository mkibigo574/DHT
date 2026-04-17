import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo footer-logo">
              <Image src="/assets/images/logo.jpeg" alt="Darwin Has Talent" width={38} height={38} className="logo-img" />
              <span className="logo-text">DARWIN<span className="logo-accent">HAS</span>TALENT</span>
            </a>
            <p>Building the Northern Territory&apos;s premier pathway for the next generation of musical talent.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/darwinhastalent_nt" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@darwinhastalent" target="_blank" rel="noopener" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a href="https://www.facebook.com/share/18DV43Hfcp/?mibextid=wwXlfr" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/darwin-has-talents" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Navigate</h4>
              <ul>
                <li><a href="#vision">Our Vision</a></li>
                <li><a href="#roadmap">Regional Roadmap</a></li>
                <li><a href="#portals">Get Involved</a></li>
                <li><a href="#story">Our Story</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Get Involved</h4>
              <ul>
                <li><a href="#waitlist">Join Waitlist</a></li>
                <li><a href="#portals">For Musicians</a></li>
                <li><a href="#portals">For Sponsors</a></li>
                <li><a href="#portals">For Community</a></li>
                <li><a href="#donate">Donate</a></li>
                <li><a href="#resources">Forms &amp; Docs</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            ABN: 23 372 902 339 &nbsp;&bull;&nbsp;{' '}
            <a href="mailto:admin@darwinhastalents.com.au">admin@darwinhastalents.com.au</a>{' '}
            {/* &nbsp;&bull;&nbsp; <a href="tel:0416941973">0416 941 973</a> */}
          </p>
          <p>&copy; 2026 Darwin Has Talent. All rights reserved.</p>

          <p>
          Developed by{" "}
          <a href="https://michaelkibigo.com"
            target="_blank"
            rel="noopener noreferrer"
            >
              Michael
          </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
