import { NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Returns the sum of all donations so the client can render the progress bar.
// Cached for 60 s on the CDN edge so every page load doesn't hit Supabase.
export async function GET() {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/donations?select=amount`, {
      headers: { apikey: SB_KEY },
      next: { revalidate: 60 },
    })
    const rows = (await res.json()) as { amount: string }[]
    const total = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
    return NextResponse.json({ total })
  } catch {
    return NextResponse.json({ total: 0 })
  }
}
