import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  // Stripe requires the raw request body for signature verification.
  // In Next.js App Router, req.text() gives us the raw string — do NOT use req.json().
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Record in Supabase donations table
    await fetch(`${SB_URL}/rest/v1/donations`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        donor_name: session.customer_details?.name ?? null,
        amount: (session.amount_total ?? 0) / 100,
        method: 'stripe',
        notes: `Stripe session ${session.id}`,
      }),
    }).catch(() => {}) // non-fatal — payment still succeeded
  }

  return NextResponse.json({ received: true })
}
