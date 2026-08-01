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

  // Record the completed donation in Supabase, keyed on the PaymentIntent so a
  // repeat delivery is ignored by the database rather than counted twice.
  // Throws on failure so the caller can ask Stripe to retry.
  async function recordDonation(
    donorName: string | null,
    cents: number,
    notes: string,
    paymentIntentId: string,
  ) {
    const res = await fetch(
      `${SB_URL}/rest/v1/donations?on_conflict=stripe_payment_intent_id`,
      {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal,resolution=ignore-duplicates',
        },
        body: JSON.stringify({
          donor_name: donorName,
          amount: cents / 100,
          method: 'stripe',
          notes,
          stripe_payment_intent_id: paymentIntentId,
        }),
      },
    )

    if (!res.ok) {
      throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`)
    }
  }

  try {
    // On-site donations pay via a PaymentIntent (Payment Element).
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      await recordDonation(
        pi.metadata?.donor_name ?? null,
        pi.amount_received || pi.amount,
        `Stripe payment ${pi.id}`,
        pi.id,
      )
    }

    // Legacy hosted-checkout donations (kept for backward compatibility).
    // This fires alongside payment_intent.succeeded for the same payment, so it
    // keys on the same PaymentIntent id to avoid recording the donation twice.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? session.id

      await recordDonation(
        session.customer_details?.name ?? null,
        session.amount_total ?? 0,
        `Stripe session ${session.id}`,
        paymentIntentId,
      )
    }
  } catch (err) {
    // The payment itself succeeded — only the bookkeeping failed. Ask Stripe to
    // redeliver; the unique constraint makes the retry safe to repeat.
    console.error('[donate/webhook] failed to record donation', event.id, err)
    return NextResponse.json({ error: 'Could not record donation' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
