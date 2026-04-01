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

export default function Home() {
  return (
    <>
      <Navbar />
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
