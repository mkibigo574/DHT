import { NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cache the response for 60 s so every page load doesn't hit Supabase. This has
// to be the route segment config rather than a `next: { revalidate }` on the
// fetch below, because fetch caching only applies to GET and PostgREST RPC
// requires POST.
export const revalidate = 60

// Returns the sum of all donations so the client can render the progress bar.
// The sum is computed in Postgres (see the donations_total migration): fetching
// every row and adding it up here silently under-reported once the table grew
// past PostgREST's row cap.
export async function GET() {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/donations_total`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })

    if (!res.ok) throw new Error(`donations_total failed: ${res.status}`)

    const total = parseFloat(await res.text())
    return NextResponse.json({ total: Number.isFinite(total) ? total : 0 })
  } catch {
    return NextResponse.json({ total: 0 })
  }
}
