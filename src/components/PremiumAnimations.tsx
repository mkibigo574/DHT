'use client'
import { useEffect } from 'react'

// Deliberately small: the only scripted motion left on the page is the
// donation progress bar filling in when it scrolls into view, because it
// shows something real. (Floating particles, magnetic buttons, 3-D card tilt,
// click ripples and stat counters were removed: decoration, not information.)
export default function PremiumAnimations() {
  useEffect(() => {
    const progressFill = document.querySelector('.donate-progress-fill') as HTMLElement | null
    if (!progressFill) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targetW = progressFill.style.width
    progressFill.style.width = '0%'
    const barObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => { progressFill.style.width = targetW }, 150)
          barObs.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    barObs.observe(progressFill)
    return () => barObs.disconnect()
  }, [])

  return null
}
