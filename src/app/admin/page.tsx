'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================
//  Config
// ============================================================
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ============================================================
//  Types
// ============================================================
type Session = { access_token: string; refresh_token: string; email: string }
type Registration = {
  id: string
  name: string
  email: string
  role: string
  region: string
  created_at: string
}
type Donation = {
  id: string
  donor_name: string
  donor_email: string
  amount: string
  reference: string
  notes: string
  created_at: string
}
type Contact = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}
type Audition = {
  id: string
  name: string
  email: string
  phone: string
  region: string
  performance_type: string
  genre: string
  video_link: string
  bio: string
  status: string
  created_at: string
}
type TabId = 'overview' | 'participants' | 'auditions' | 'donations' | 'messages'

// ============================================================
//  Utility functions
// ============================================================
function timeAgo(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function shortLabel(label: string): string {
  const map: Record<string, string> = {
    'Musician / Artist': 'Musician',
    'Parent / Guardian': 'Parent',
    'Teacher / Educator': 'Teacher',
    'Potential Sponsor / Partner': 'Sponsor',
    'Community Member / Supporter': 'Community',
    'Darwin / Top End': 'Darwin',
    'Katherine / Big Rivers': 'Katherine',
    'Tennant Creek / Barkly': 'Tennant Ck',
    'Alice Springs / Red Centre': 'Alice Spgs',
    'Outside the NT': 'Outside NT',
  }
  return map[label] ?? label
}

function roleChipClass(role: string): string {
  const map: Record<string, string> = {
    'Musician / Artist': 'musician',
    'Parent / Guardian': 'parent',
    'Teacher / Educator': 'teacher',
    'Potential Sponsor / Partner': 'sponsor',
    'Community Member / Supporter': 'community',
  }
  return map[role] ?? 'community'
}

function exportCSV(data: Record<string, unknown>[], columns: string[], filename: string): void {
  const header = columns.join(',')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = String(row[col] ?? '').replace(/"/g, '""')
        return `"${val}"`
      })
      .join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================================
//  Supabase fetch helpers
// ============================================================
type SbFetchOptions = {
  method?: string
  headers?: Record<string, string>
  body?: string
}

async function sbFetch(
  path: string,
  session: Session | null,
  options: SbFetchOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = {
    apikey: SB_KEY,
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...(options.headers ?? {}),
  }
  const res = await fetch(SB_URL + path, { method: options.method, headers, body: options.body })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? res.statusText)
  }
  const text = await res.text()
  return text ? (JSON.parse(text) as unknown) : null
}

async function sbAuth(email: string, password: string): Promise<{ access_token: string; refresh_token: string; user?: { email?: string } }> {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json() as { access_token: string; refresh_token: string; user?: { email?: string }; error_description?: string; msg?: string }
  if (!res.ok) throw new Error(data.error_description ?? data.msg ?? 'Login failed')
  return data
}

async function sbRefreshSession(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  const data = await res.json() as { access_token: string; refresh_token: string; error_description?: string; msg?: string }
  if (!res.ok) throw new Error(data.error_description ?? data.msg ?? 'Refresh failed')
  return data
}

async function sbSignOut(accessToken: string): Promise<void> {
  await fetch(`${SB_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${accessToken}` },
  })
}

// ============================================================
//  Sub-components
// ============================================================

// --- Bar Chart ---
function BarChart({ counts }: { counts: Record<string, number> }) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] ?? 1
  if (sorted.length === 0) {
    return <p className="recent-empty">No data yet.</p>
  }
  return (
    <div className="bar-chart">
      {sorted.map(([label, count]) => (
        <div className="bar-row" key={label}>
          <div className="bar-label" title={label}>
            {shortLabel(label)}
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${((count / max) * 100).toFixed(1)}%` }}
            />
          </div>
          <div className="bar-count">{count}</div>
        </div>
      ))}
    </div>
  )
}

// --- Role Chip ---
function RoleChip({ role }: { role: string }) {
  const cls = roleChipClass(role)
  return <span className={`chip chip--${cls}`}>{shortLabel(role || 'Unknown')}</span>
}

// ============================================================
//  Main Component
// ============================================================
export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [auditions, setAuditions] = useState<Audition[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  // Auditions filters
  const [auditionSearch, setAuditionSearch] = useState('')
  const [auditionRegionFilter, setAuditionRegionFilter] = useState('')
  const [auditionStatusFilter, setAuditionStatusFilter] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Participants filters
  const [participantSearch, setParticipantSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')

  // Donations modal
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorAmount, setDonorAmount] = useState('')
  const [donorReference, setDonorReference] = useState('')
  const [donorNotes, setDonorNotes] = useState('')

  // Messages filters
  const [messageSearch, setMessageSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Load session from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dht_admin_session')
      if (raw) {
        const parsed = JSON.parse(raw) as Session
        setSession(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Load all data whenever session changes (and is set)
  const loadAllData = useCallback(
    async (sess: Session) => {
      // Try fetching; if JWT expired, refresh and retry once
      async function fetchWithRefresh(path: string, currentSess: Session): Promise<unknown> {
        try {
          return await sbFetch(path, currentSess)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : ''
          if (msg.includes('JWT expired') || msg.includes('token is expired') || msg === 'Unauthorized') {
            throw Object.assign(new Error(msg), { isExpired: true })
          }
          throw err
        }
      }

      const [regs, auds, dons, cons] = await Promise.allSettled([
        fetchWithRefresh('/rest/v1/registrations?select=*&order=created_at.desc', sess),
        fetchWithRefresh('/rest/v1/auditions?select=*&order=created_at.desc', sess),
        fetchWithRefresh('/rest/v1/donations?select=*&order=created_at.desc', sess),
        fetchWithRefresh('/rest/v1/contacts?select=*&order=created_at.desc', sess),
      ])

      // Check if any result indicates JWT expiry — if so, refresh and re-trigger via setSession
      const anyExpired = [regs, auds, dons, cons].some(
        (r) => r.status === 'rejected' && (r.reason as { isExpired?: boolean })?.isExpired,
      )
      if (anyExpired) {
        try {
          const refreshed = await sbRefreshSession(sess.refresh_token)
          const newSess: Session = { ...sess, access_token: refreshed.access_token, refresh_token: refreshed.refresh_token }
          sessionStorage.setItem('dht_admin_session', JSON.stringify(newSess))
          setSession(newSess) // triggers useEffect → loadAllData with fresh token
        } catch {
          // Refresh failed — force sign out
          sessionStorage.removeItem('dht_admin_session')
          setSession(null)
        }
        return
      }

      if (regs.status === 'fulfilled') setRegistrations((regs.value as Registration[]) ?? [])
      if (auds.status === 'fulfilled') setAuditions((auds.value as Audition[]) ?? [])
      else console.error('Auditions load error:', auds.reason)
      if (dons.status === 'fulfilled') setDonations((dons.value as Donation[]) ?? [])
      if (cons.status === 'fulfilled') setContacts((cons.value as Contact[]) ?? [])
    },
    [],
  )

  useEffect(() => {
    if (session) {
      loadAllData(session)
    }
  }, [session, loadAllData])

  // Close sidebar on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!sidebarOpen) return
      const target = e.target as Element
      if (!target.closest('.sidebar') && !target.closest('.mobile-menu-btn')) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [sidebarOpen])

  // --- Login ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const data = await sbAuth(loginEmail.trim(), loginPassword)
      const sess: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        email: data.user?.email ?? loginEmail.trim(),
      }
      sessionStorage.setItem('dht_admin_session', JSON.stringify(sess))
      setSession(sess)
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  // --- Sign out ---
  async function handleSignOut() {
    if (session) {
      await sbSignOut(session.access_token).catch(() => {})
    }
    sessionStorage.removeItem('dht_admin_session')
    setSession(null)
    setRegistrations([])
    setAuditions([])
    setDonations([])
    setContacts([])
  }

  // --- Computed values ---
  const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
  const avgDonation = donations.length ? totalDonated / donations.length : 0
  const newMessages = contacts.filter((c) => (c.status || 'new') === 'new').length

  const roleCounts: Record<string, number> = {}
  registrations.forEach((r) => {
    const k = r.role || 'Unknown'
    roleCounts[k] = (roleCounts[k] ?? 0) + 1
  })

  const regionCounts: Record<string, number> = {}
  registrations.forEach((r) => {
    const k = r.region || 'Not specified'
    regionCounts[k] = (regionCounts[k] ?? 0) + 1
  })

  // Filtered participants
  const filteredParticipants = registrations.filter((r) => {
    const q = participantSearch.toLowerCase()
    const matchSearch =
      !q ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q)
    const matchRole = !roleFilter || r.role === roleFilter
    const matchRegion = !regionFilter || r.region === regionFilter
    return matchSearch && matchRole && matchRegion
  })

  // Filtered messages
  const filteredMessages = contacts.filter((m) => {
    const q = messageSearch.toLowerCase()
    const matchSearch =
      !q ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q)
    const matchStatus = !statusFilter || (m.status || 'new') === statusFilter
    return matchSearch && matchStatus
  })

  // --- Log donation ---
  async function handleLogDonation(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(donorAmount)
    if (!amount || amount <= 0) return
    const payload = {
      donor_name: donorName.trim() || null,
      donor_email: donorEmail.trim() || null,
      amount,
      reference: donorReference.trim() || null,
      notes: donorNotes.trim() || null,
    }
    try {
      await sbFetch('/rest/v1/donations', session, {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      })
      setDonationModalOpen(false)
      setDonorName('')
      setDonorEmail('')
      setDonorAmount('')
      setDonorReference('')
      setDonorNotes('')
      if (session) await loadAllData(session)
    } catch (err: unknown) {
      alert('Error saving donation: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // --- Delete donation ---
  async function handleDeleteDonation(id: string) {
    if (!confirm('Delete this donation record?')) return
    try {
      await sbFetch(`/rest/v1/donations?id=eq.${id}`, session, { method: 'DELETE' })
      if (session) await loadAllData(session)
    } catch (err: unknown) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // --- Update message status ---
  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await sbFetch(`/rest/v1/contacts?id=eq.${id}`, session, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: newStatus }),
      })
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
      )
    } catch (err: unknown) {
      alert('Error updating status: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // --- Update audition status ---
  async function handleAuditionStatusChange(id: string, newStatus: string) {
    try {
      await sbFetch(`/rest/v1/auditions?id=eq.${id}`, session, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: newStatus }),
      })
      setAuditions((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    } catch (err: unknown) {
      alert('Error updating status: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Filtered auditions
  const filteredAuditions = auditions.filter((a) => {
    const q = auditionSearch.toLowerCase()
    const matchSearch = !q || (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.genre || '').toLowerCase().includes(q)
    const matchRegion = !auditionRegionFilter || a.region === auditionRegionFilter
    const matchStatus = !auditionStatusFilter || (a.status || 'pending') === auditionStatusFilter
    return matchSearch && matchRegion && matchStatus
  })

  // --- Navigate tabs ---
  function goTab(tab: TabId) {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  // ============================================================
  //  Render: Login
  // ============================================================
  if (!session) {
    return (
      <div className="admin-root">
        <div className="login-screen">
          <div className="login-card">
            <div className="login-logo">
              <img src="/assets/images/logo.jpeg" alt="DHT" className="login-logo-img" />
              <div>
                <div className="login-logo-text">
                  DARWIN<span>HAS</span>TALENT
                </div>
                <div className="login-logo-sub">Admin Portal</div>
              </div>
            </div>
            <h1>Sign In</h1>
            <p className="login-desc">Authorised staff only.</p>
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="admin@darwinhastalents.com.au"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="btn-login" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <a href="/" className="back-link">← Back to website</a>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  //  Render: Portal
  // ============================================================
  return (
    <div className="admin-root">
      <div className="portal">
        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-logo">
            <img src="/assets/images/logo.jpeg" alt="DHT" className="sidebar-logo-img" />
            <div>
              <div className="sidebar-logo-text">DHT</div>
              <div className="sidebar-logo-sub">Admin</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item${activeTab === 'overview' ? ' active' : ''}`}
              onClick={() => goTab('overview')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Overview
            </button>
            <button
              className={`nav-item${activeTab === 'participants' ? ' active' : ''}`}
              onClick={() => goTab('participants')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Participants
              {registrations.length > 0 && (
                <span className="nav-badge">{registrations.length}</span>
              )}
            </button>
            <button
              className={`nav-item${activeTab === 'auditions' ? ' active' : ''}`}
              onClick={() => goTab('auditions')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Auditions
              {auditions.filter(a => (a.status || 'pending') === 'pending').length > 0 && (
                <span className="nav-badge">{auditions.filter(a => (a.status || 'pending') === 'pending').length}</span>
              )}
            </button>
            <button
              className={`nav-item${activeTab === 'donations' ? ' active' : ''}`}
              onClick={() => goTab('donations')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Donations
            </button>
            <button
              className={`nav-item${activeTab === 'messages' ? ' active' : ''}`}
              onClick={() => goTab('messages')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Messages
              {newMessages > 0 && <span className="nav-badge">{newMessages}</span>}
            </button>
          </nav>
          <div className="sidebar-footer">
            <div className="admin-user">{session.email}</div>
            <button className="btn-signout" onClick={handleSignOut}>
              Sign Out
            </button>
            <a href="/" className="back-site-link">← View Website</a>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="mobile-title">DHT Admin</span>
        </header>

        {/* Main content */}
        <main className="main-content">

          {/* ===== OVERVIEW TAB ===== */}
          <section className={`tab-panel${activeTab === 'overview' ? ' active' : ''}`}>
            <div className="page-header">
              <h1>Overview</h1>
              <button className="btn-refresh" onClick={() => session && loadAllData(session)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Stats grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon--blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{registrations.length}</div>
                  <div className="stat-label">Total Registrations</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon--green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="18" r="3" />
                    <circle cx="19" cy="16" r="3" />
                    <polyline points="12 18 12 2 22 5" />
                  </svg>
                </div>
                <div className="stat-body">
                  <div className="stat-value">
                    {registrations.filter((r) => r.role && r.role.toLowerCase().includes('musician')).length}
                  </div>
                  <div className="stat-label">Musicians / Artists</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon--coral">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="stat-body">
                  <div className="stat-value">
                    ${totalDonated.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="stat-label">Total Donated (AUD)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon--purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{auditions.length}</div>
                  <div className="stat-label">Audition Applications</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{newMessages}</div>
                  <div className="stat-label">Unread Messages</div>
                </div>
              </div>
            </div>

            {/* Charts + recent */}
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Registrations by Role</h3>
                <BarChart counts={roleCounts} />
              </div>
              <div className="overview-card">
                <h3>Registrations by Region</h3>
                <BarChart counts={regionCounts} />
              </div>
              <div className="overview-card">
                <h3>Recent Sign-ups</h3>
                <div className="recent-list">
                  {registrations.slice(0, 5).length === 0 ? (
                    <p className="recent-empty">No registrations yet.</p>
                  ) : (
                    registrations.slice(0, 5).map((r) => (
                      <div className="recent-item" key={r.id}>
                        <div className="recent-avatar">
                          {(r.name || '?')[0].toUpperCase()}
                        </div>
                        <div className="recent-info">
                          <div className="recent-name">{r.name}</div>
                          <div className="recent-sub">{r.role || '—'}</div>
                        </div>
                        <div className="recent-time">{timeAgo(r.created_at)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="overview-card">
                <h3>Recent Donations</h3>
                <div className="recent-list">
                  {donations.slice(0, 5).length === 0 ? (
                    <p className="recent-empty">No donations recorded yet.</p>
                  ) : (
                    donations.slice(0, 5).map((d) => (
                      <div className="recent-item" key={d.id}>
                        <div
                          className="recent-avatar"
                          style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)' }}
                        >
                          $
                        </div>
                        <div className="recent-info">
                          <div className="recent-name">{d.donor_name || 'Anonymous'}</div>
                          <div className="recent-sub">
                            ${parseFloat(d.amount).toFixed(2)}
                          </div>
                        </div>
                        <div className="recent-time">{timeAgo(d.created_at)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ===== PARTICIPANTS TAB ===== */}
          <section className={`tab-panel${activeTab === 'participants' ? ' active' : ''}`}>
            <div className="page-header">
              <h1>Participants</h1>
              <button
                className="btn-export"
                onClick={() =>
                  exportCSV(
                    registrations as unknown as Record<string, unknown>[],
                    ['name', 'email', 'role', 'region', 'created_at'],
                    'dht_participants.csv',
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="table-controls">
              <input
                type="search"
                className="table-search"
                placeholder="Search name or email..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
              />
              <select
                className="table-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Musician / Artist">Musicians</option>
                <option value="Parent / Guardian">Parents</option>
                <option value="Teacher / Educator">Teachers</option>
                <option value="Potential Sponsor / Partner">Sponsors</option>
                <option value="Community Member / Supporter">Community</option>
              </select>
              <select
                className="table-filter"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                <option value="Darwin / Top End">Darwin / Top End</option>
                <option value="Katherine / Big Rivers">Katherine</option>
                <option value="Tennant Creek / Barkly">Tennant Creek</option>
                <option value="Alice Springs / Red Centre">Alice Springs</option>
                <option value="Outside the NT">Outside NT</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Region</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No registrations found.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="cell-truncate">{r.name || '—'}</span>
                        </td>
                        <td>
                          <a href={`mailto:${r.email}`} style={{ color: 'var(--primary)' }}>
                            {r.email || '—'}
                          </a>
                        </td>
                        <td>
                          <RoleChip role={r.role} />
                        </td>
                        <td>
                          <span className="cell-truncate">{r.region || '—'}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              {filteredParticipants.length} of {registrations.length} registrations
            </div>
          </section>

          {/* ===== AUDITIONS TAB ===== */}
          <section className={`tab-panel${activeTab === 'auditions' ? ' active' : ''}`}>
            <div className="page-header">
              <h1>Auditions</h1>
              <button
                className="btn-export"
                onClick={() =>
                  exportCSV(
                    auditions as unknown as Record<string, unknown>[],
                    ['name', 'email', 'phone', 'region', 'performance_type', 'genre', 'video_link', 'status', 'created_at'],
                    'dht_auditions.csv',
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="table-controls">
              <input
                type="search"
                className="table-search"
                placeholder="Search name, email or genre…"
                value={auditionSearch}
                onChange={(e) => setAuditionSearch(e.target.value)}
              />
              <select
                className="table-filter"
                value={auditionRegionFilter}
                onChange={(e) => setAuditionRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                <option value="Darwin / Top End">Darwin / Top End</option>
                <option value="Katherine / Big Rivers">Katherine</option>
                <option value="Tennant Creek / Barkly">Tennant Creek</option>
                <option value="Alice Springs / Red Centre">Alice Springs</option>
                <option value="Outside the NT">Outside NT</option>
              </select>
              <select
                className="table-filter"
                value={auditionStatusFilter}
                onChange={(e) => setAuditionStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th>Type</th>
                    <th>Genre</th>
                    <th>Video</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">No audition applications found.</td>
                    </tr>
                  ) : (
                    filteredAuditions.map((a) => (
                      <tr key={a.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.created_at)}</td>
                        <td>{a.name || '—'}</td>
                        <td>
                          <a href={`mailto:${a.email}`} style={{ color: 'var(--primary)' }}>{a.email || '—'}</a>
                        </td>
                        <td><span className="cell-truncate">{a.region || '—'}</span></td>
                        <td>{a.performance_type || '—'}</td>
                        <td>{a.genre || '—'}</td>
                        <td>
                          {a.video_link ? (
                            <a href={a.video_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                              View
                            </a>
                          ) : '—'}
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={a.status || 'pending'}
                            onChange={(e) => handleAuditionStatusChange(a.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              {filteredAuditions.length} of {auditions.length} applications ·{' '}
              {auditions.filter(a => (a.status || 'pending') === 'pending').length} pending review
            </div>
          </section>

          {/* ===== DONATIONS TAB ===== */}
          <section className={`tab-panel${activeTab === 'donations' ? ' active' : ''}`}>
            <div className="page-header">
              <h1>Donations</h1>
              <button
                className="btn-primary-action"
                onClick={() => setDonationModalOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Log Donation
              </button>
            </div>

            <div className="donation-summary">
              <div className="donation-sum-item">
                <span className="donation-sum-label">Total Raised</span>
                <span className="donation-sum-value">
                  ${totalDonated.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="donation-sum-item">
                <span className="donation-sum-label">No. of Donations</span>
                <span className="donation-sum-value">{donations.length}</span>
              </div>
              <div className="donation-sum-item">
                <span className="donation-sum-label">Average Donation</span>
                <span className="donation-sum-value">
                  ${avgDonation.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-empty">
                        No donations recorded yet. Use &quot;Log Donation&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(d.created_at)}</td>
                        <td>{d.donor_name || 'Anonymous'}</td>
                        <td>
                          {d.donor_email ? (
                            <a href={`mailto:${d.donor_email}`} style={{ color: 'var(--primary)' }}>
                              {d.donor_email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ color: 'var(--green)', fontWeight: 700 }}>
                          ${parseFloat(d.amount).toFixed(2)}
                        </td>
                        <td>{d.reference || '—'}</td>
                        <td>
                          <span className="cell-truncate">{d.notes || '—'}</span>
                        </td>
                        <td>
                          <button
                            className="btn-delete-row"
                            title="Delete"
                            onClick={() => handleDeleteDonation(d.id)}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="14">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===== MESSAGES TAB ===== */}
          <section className={`tab-panel${activeTab === 'messages' ? ' active' : ''}`}>
            <div className="page-header">
              <h1>Messages</h1>
              <button
                className="btn-export"
                onClick={() =>
                  exportCSV(
                    contacts as unknown as Record<string, unknown>[],
                    ['name', 'email', 'subject', 'message', 'status', 'created_at'],
                    'dht_messages.csv',
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="table-controls">
              <input
                type="search"
                className="table-search"
                placeholder="Search messages..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
              />
              <select
                className="table-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-empty">
                        No messages yet.
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((m) => (
                      <tr key={m.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.created_at)}</td>
                        <td>{m.name || '—'}</td>
                        <td>
                          <a href={`mailto:${m.email}`} style={{ color: 'var(--primary)' }}>
                            {m.email || '—'}
                          </a>
                        </td>
                        <td>{m.subject || '—'}</td>
                        <td>
                          <span
                            className="cell-truncate"
                            style={{ maxWidth: '220px' }}
                            title={m.message || ''}
                          >
                            {m.message || '—'}
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={m.status || 'new'}
                            onChange={(e) => handleStatusChange(m.id, e.target.value)}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ===== LOG DONATION MODAL ===== */}
      {donationModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDonationModalOpen(false)
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>Log Donation</h2>
              <button className="modal-close" onClick={() => setDonationModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleLogDonation} noValidate>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Donor Name</label>
                  <input
                    type="text"
                    placeholder="Full name (optional)"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Donor Email</label>
                  <input
                    type="email"
                    placeholder="email (optional)"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    Amount (AUD) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    value={donorAmount}
                    onChange={(e) => setDonorAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Bank Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. DHT Donation"
                    value={donorReference}
                    onChange={(e) => setDonorReference(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any additional notes..."
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setDonationModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
