'use client'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dht-theme'
type Theme = 'dark' | 'light'

// The theme lives on <html data-theme="light">; no attribute = dark (the default).
// A small inline script in the root layout applies a saved choice before paint.
function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export default function ThemeToggle() {
  // Server render always assumes dark, matching the default.
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => 'dark')

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    if (next === 'light') document.documentElement.dataset.theme = 'light'
    else delete document.documentElement.dataset.theme
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode: still switches for this visit */ }
  }

  const toLight = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={toLight ? 'Switch to light mode' : 'Switch to dark mode'}
      title={toLight ? 'Light mode' : 'Dark mode'}
    >
      {toLight ? (
        // Sun
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Moon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
