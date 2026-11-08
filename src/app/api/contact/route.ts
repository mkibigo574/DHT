import { NextRequest, NextResponse } from 'next/server'
import { queueNotification } from '@/lib/notify'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json() as { name?: string; email?: string; subject?: string; message?: string }
  await fetch(`${SB_URL}/rest/v1/contacts`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ ...body, status: 'new' }),
  }).catch(() => {})

  // The contact form and the sponsor-enquiry modal both post here.
  const isSponsor = body.subject === 'Sponsorship Enquiry'
  queueNotification({
    subject: isSponsor
      ? `🤝 New sponsorship enquiry from ${body.name || 'someone'}`
      : `✉️ New website message${body.subject ? ` (${body.subject})` : ''} from ${body.name || 'someone'}`,
    heading: isSponsor ? 'New sponsorship enquiry' : 'New contact message',
    replyTo: body.email,
    fields: [
      ['Name', body.name],
      ['Email', body.email],
      ['Subject', body.subject],
      ['Message', body.message],
    ],
  })

  return NextResponse.json({ ok: true })
}
