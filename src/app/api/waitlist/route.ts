import { NextRequest, NextResponse } from 'next/server'
import { queueNotification } from '@/lib/notify'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json() as { name?: string; email?: string; role?: string; region?: string }
  await fetch(`${SB_URL}/rest/v1/registrations`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  }).catch(() => {})

  queueNotification({
    subject: `⭐ New waitlist sign-up: ${body.name || 'Someone'}${body.role ? ` (${body.role})` : ''}`,
    heading: 'New waitlist registration',
    replyTo: body.email,
    fields: [
      ['Name', body.name],
      ['Email', body.email],
      ['Role', body.role],
      ['Region', body.region],
    ],
  })

  return NextResponse.json({ ok: true })
}
