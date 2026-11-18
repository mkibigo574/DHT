import { NextRequest, NextResponse } from 'next/server'
import { getStripe, DONATIONS_OFF_MESSAGE } from '@/lib/stripe'

// Creates a PaymentIntent so the donor can pay on-site with the Stripe
// Payment Element (no redirect to Stripe's hosted checkout).
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: DONATIONS_OFF_MESSAGE }, { status: 503 })

  const { amount, name, email } = await req.json() // amount in cents, e.g. 2500 = $25.00

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 })
  }

  const cleanName = typeof name === 'string' ? name.trim().slice(0, 120) : ''
  const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 200) : ''

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
      description: 'Darwin Has Talent — Donation',
      ...(cleanEmail ? { receipt_email: cleanEmail } : {}),
      metadata: {
        source: 'website_donation',
        ...(cleanName ? { donor_name: cleanName } : {}),
      },
    })

    return NextResponse.json({ clientSecret: intent.client_secret })
  } catch {
    return NextResponse.json(
      { error: 'Could not start the payment. Please try again.' },
      { status: 500 },
    )
  }
}
