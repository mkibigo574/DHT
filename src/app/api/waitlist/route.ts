import { NextRequest, NextResponse } from 'next/server'

const SB_URL = 'https://mxaezkfyowvotzfrnfil.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YWV6a2Z5b3d2b3R6ZnJuZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzA2MzAsImV4cCI6MjA4NzQ0NjYzMH0.ueMC6olfg0oR7mG_UtdcRCk61YRdMGzkUdqiHvmirT4'

export async function POST(req: NextRequest) {
  const body = await req.json()
  await fetch(`${SB_URL}/rest/v1/registrations`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  }).catch(() => {})
  return NextResponse.json({ ok: true })
}
