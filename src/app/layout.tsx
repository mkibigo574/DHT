import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const poppins = Poppins({ weight: ['300','400','500','600','700','800','900'], subsets: ['latin'], variable: '--font-poppins', display: 'swap' })

export const metadata: Metadata = {
  title: 'Darwin Has Talent — The Stage is Being Set for 2027',
  description: "Darwin Has Talent — Building the Northern Territory's premier pathway for the next generation of musical talent. Launching 2027.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  )
}
