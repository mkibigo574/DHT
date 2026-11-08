import { after } from 'next/server'

// ─────────────────────────────────────────────────────────────
//  Email notifications for website submissions (via Resend).
//
//  Env vars (set in Vercel → Project → Settings → Environment Variables):
//    RESEND_API_KEY  required — from resend.com → API Keys
//    NOTIFY_TO       required — comma-separated recipients
//    NOTIFY_FROM     optional — e.g. "DHT Website <noreply@darwinhastalents.com.au>"
//                    (domain must be verified in Resend; defaults to Resend's test sender)
//    SITE_URL        optional — e.g. https://darwinhastalents.com.au (adds an admin-portal link)
//
//  If RESEND_API_KEY or NOTIFY_TO is missing, notifications are skipped and
//  submissions still work exactly as before.
// ─────────────────────────────────────────────────────────────

export type NotifyField = [label: string, value: unknown]

export interface Notification {
  subject: string
  heading: string
  fields: NotifyField[]
  replyTo?: string | null
  /** Optional call-to-action button. */
  button?: { href: string; label: string }
}

const RESEND_URL = 'https://api.resend.com/emails'

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function renderNotification(n: Notification): { html: string; text: string } {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')
  const shown = n.fields.filter(([, v]) => v !== null && v !== undefined && v !== '')

  const rows = shown
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6B7280;vertical-align:top;white-space:nowrap">${esc(label)}</td>` +
        `<td style="padding:6px 0;color:#1F2A44">${esc(value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')

  const button = n.button
    ? `<p style="margin:22px 0"><a href="${esc(n.button.href)}" style="background:#FF6B6B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">${esc(n.button.label)}</a></p>`
    : ''

  const admin = siteUrl
    ? `<p style="margin-top:26px;font-size:13px;color:#6B7280">View everything in the <a href="${esc(siteUrl)}/admin" style="color:#FF6B6B">admin portal</a>.</p>`
    : ''

  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
  <div style="font-weight:800;color:#FF6B6B;letter-spacing:1px;font-size:12px;text-transform:uppercase">Darwin Has Talent</div>
  <h2 style="color:#1F2A44;margin:6px 0 18px">${esc(n.heading)}</h2>
  <table style="border-collapse:collapse;font-size:14px">${rows}</table>
  ${button}${admin}
</div>`

  const text = [
    n.heading,
    '',
    ...shown.map(([l, v]) => `${l}: ${String(v)}`),
    ...(n.button ? ['', `${n.button.label}: ${n.button.href}`] : []),
    ...(siteUrl ? ['', `Admin portal: ${siteUrl}/admin`] : []),
  ].join('\n')

  return { html, text }
}

/** Send a notification email now. Never throws — failures are logged. */
export async function sendNotification(n: Notification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = (process.env.NOTIFY_TO ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!apiKey || to.length === 0) {
    console.warn('[notify] RESEND_API_KEY / NOTIFY_TO not set — skipping email:', n.subject)
    return false
  }

  const { html, text } = renderNotification(n)
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'DHT Website <onboarding@resend.dev>',
        to,
        subject: n.subject,
        html,
        text,
        ...(isEmail(n.replyTo) ? { reply_to: n.replyTo } : {}),
      }),
    })
    if (!res.ok) {
      console.error('[notify] Resend error', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[notify] failed to send', err)
    return false
  }
}

/**
 * Send a notification after the response has gone back to the visitor, so a
 * slow or failing mail provider never delays or breaks a submission.
 * Falls back to fire-and-forget outside a request (e.g. unit tests).
 */
export function queueNotification(n: Notification): void {
  try {
    after(() => sendNotification(n))
  } catch {
    void sendNotification(n)
  }
}
