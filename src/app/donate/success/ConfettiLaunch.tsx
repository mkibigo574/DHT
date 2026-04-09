'use client'
import { useEffect } from 'react'

export default function ConfettiLaunch() {
  useEffect(() => {
    import('canvas-confetti').then((m) =>
      m.default({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff4d94', '#ffd700', '#ffffff', '#FF9A8B', '#a855f7'],
      }),
    )
  }, [])
  return null
}
