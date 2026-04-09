import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; email?: string; document?: string }

    if (!body.name || !body.email || !body.document) {
      return NextResponse.json({ ok: false, error: 'Name, email and document are required.' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/document_requests`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        document: body.document,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string }
      return NextResponse.json({ ok: false, error: err.message ?? 'Request failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
