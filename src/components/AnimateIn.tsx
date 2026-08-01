'use client'
import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number  // ms
  variant?: 'up' | 'left' | 'right' | 'scale' | 'fade' | 'blur-up'
  threshold?: number
  duration?: number // ms
}

export default function AnimateIn({
  children,
  className = '',
  delay = 0,
  variant = 'up',
  threshold = 0.08,
  duration = 750,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('ai-visible')
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`ai-root ai-${variant} ${className}`}
      style={{
        '--ai-delay': `${delay}ms`,
        '--ai-dur': `${duration}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
