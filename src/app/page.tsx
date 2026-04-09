import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import Vision from '@/components/Vision'
import Roadmap from '@/components/Roadmap'
import Portals from '@/components/Portals'
import Story from '@/components/Story'
import Waitlist from '@/components/Waitlist'
import Donate from '@/components/Donate'
import Resources from '@/components/Resources'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/darwinhastalent_nt',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@darwinhastalent',
    cls: 'tiktok',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/18DV43Hfcp/?mibextid=wwXlfr',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/darwin-has-talents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Floating social sidebar — desktop only */}
      <aside className="social-float" aria-label="Social media links">
        {SOCIALS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            aria-label={s.label} className={s.cls ?? ''}>
            {s.icon}
          </a>
        ))}
      </aside>
      <Hero />
      <Ticker />
      <Vision />
      <Roadmap />
      <Portals />
      <Story />
      <Waitlist />
      <Donate />
      <Resources />
      <Contact />
      <Footer />
    </>
  )
}
