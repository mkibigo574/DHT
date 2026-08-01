'use client'
import { useEffect } from 'react'

export default function PremiumAnimations() {
  useEffect(() => {
    /* ── Floating particles in hero ─────────────────── */
    const heroBg = document.querySelector('.hero-bg-effects')
    const particles: HTMLElement[] = []
    if (heroBg) {
      for (let i = 0; i < 28; i++) {
        const p = document.createElement('div')
        p.className = 'hero-particle'
        const x = Math.random() * 100
        const y = 20 + Math.random() * 70
        const tx = (Math.random() - 0.5) * 80
        const ty = -(40 + Math.random() * 100)
        const size = 1.5 + Math.random() * 2.5
        const dur = 8 + Math.random() * 10
        const delay = -(Math.random() * 15)
        Object.assign(p.style, {
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          '--p-tx': `${tx}px`,
          '--p-ty': `${ty}px`,
          '--p-dur': `${dur}s`,
          '--p-delay': `${delay}s`,
        })
        heroBg.appendChild(p)
        particles.push(p)
      }
    }

    /* ── Magnetic buttons ───────────────────────────── */
    const MAX_PULL = 9

    function onDocMove(e: MouseEvent) {
      const btn = (e.target as Element).closest('.btn') as HTMLElement | null
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const mx = Math.min(Math.max(cx * 0.28, -MAX_PULL), MAX_PULL)
      const my = Math.min(Math.max(cy * 0.28, -MAX_PULL), MAX_PULL)
      btn.style.transform = `translate(${mx}px, ${my - 2}px)`
    }

    function onDocLeave(e: MouseEvent) {
      const btn = (e.target as Element).closest('.btn') as HTMLElement | null
      if (btn) btn.style.transform = ''
    }

    document.addEventListener('mousemove', onDocMove)
    document.addEventListener('mouseleave', onDocLeave, true)

    /* ── 3-D card tilt ──────────────────────────────── */
    const TILT_SEL =
      '.pillar-card, .portal-card, .resource-card, .rm-card, .glass-card, .contact-info-card, .donate-preset'

    function onCardMove(e: MouseEvent) {
      const card = (e.target as Element).closest(TILT_SEL) as HTMLElement | null
      if (!card) return
      const rect = card.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      const maxDeg = card.classList.contains('glass-card') ? 6 : 10
      card.style.transform =
        `perspective(900px) rotateX(${-py * maxDeg}deg) rotateY(${px * maxDeg}deg) translateY(-4px)`
    }

    function onCardLeave(e: MouseEvent) {
      const card = (e.target as Element).closest(TILT_SEL) as HTMLElement | null
      if (card) card.style.transform = ''
    }

    document.addEventListener('mousemove', onCardMove)
    document.addEventListener('mouseleave', onCardLeave, true)

    /* ── Number counter for hero stats ─────────────── */
    const statEls = document.querySelectorAll('.hero-stat-number')
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          if (el.dataset.counted) return
          el.dataset.counted = '1'

          const raw = el.textContent ?? '0'
          const suffix = raw.replace(/[\d,]/g, '')
          const num = parseInt(raw.replace(/[^\d]/g, ''), 10) || 0
          if (num === 0) return

          const dur = 1800
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1)
            const e = 1 - (1 - t) ** 4
            el.textContent = Math.round(e * num).toLocaleString() + suffix
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          counterObs.unobserve(el)
        })
      },
      { threshold: 0.5 }
    )
    statEls.forEach((el) => counterObs.observe(el))

    /* ── Animate progress bar fill on scroll ────────── */
    const progressFill = document.querySelector('.donate-progress-fill') as HTMLElement | null
    if (progressFill) {
      const targetW = progressFill.style.width
      progressFill.style.width = '0%'
      const barObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => { if (progressFill) progressFill.style.width = targetW }, 150)
            barObs.disconnect()
          }
        },
        { threshold: 0.3 }
      )
      barObs.observe(progressFill)
    }

    /* ── Ripple on button click ──────────────────────── */
    function onBtnClick(e: MouseEvent) {
      const btn = (e.target as Element).closest('.btn') as HTMLElement | null
      if (!btn) return
      const circle = document.createElement('span')
      const rect = btn.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      circle.className = 'btn-ripple'
      Object.assign(circle.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${e.clientX - rect.left - size / 2}px`,
        top: `${e.clientY - rect.top - size / 2}px`,
      })
      btn.appendChild(circle)
      circle.addEventListener('animationend', () => circle.remove())
    }
    document.addEventListener('click', onBtnClick)

    return () => {
      particles.forEach((p) => p.remove())
      document.removeEventListener('mousemove', onDocMove)
      document.removeEventListener('mouseleave', onDocLeave, true)
      document.removeEventListener('mousemove', onCardMove)
      document.removeEventListener('mouseleave', onCardLeave, true)
      document.removeEventListener('click', onBtnClick)
      counterObs.disconnect()
    }
  }, [])

  return null
}
