import type { Metadata } from 'next'
import { Archivo, Big_Shoulders } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import PremiumAnimations from '@/components/PremiumAnimations'

// Territory Night type: condensed gig-poster display + a sturdy grotesk for reading
const bigShoulders = Big_Shoulders({ subsets: ['latin'], variable: '--font-big-shoulders', display: 'swap', axes: ['opsz'] })
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', display: 'swap', axes: ['wdth'] })

export const metadata: Metadata = {
  title: 'Darwin Has Talent — The Stage is Being Set for 2027',
  description: "Darwin Has Talent — Building the Northern Territory's premier pathway for the next generation of musical talent. Launching 2027.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${archivo.variable}`} suppressHydrationWarning>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> before hydration */}
      <body suppressHydrationWarning>
        <PremiumAnimations />
        {children}
      </body>
    </html>
  )
}
