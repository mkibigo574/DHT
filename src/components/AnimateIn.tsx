import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  // Kept so existing call sites don't need changing; entrance animations
  // were removed (content simply appears), so these are ignored.
  delay?: number
  variant?: 'up' | 'left' | 'right' | 'scale' | 'fade' | 'blur-up'
  threshold?: number
  duration?: number
}

// Plain wrapper. The .ai-root class is kept because grid layouts style it
// (see "When .ai-root is a grid/flex child" in globals.css).
export default function AnimateIn({ children, className = '' }: Props) {
  return <div className={`ai-root ${className}`.trim()}>{children}</div>
}
