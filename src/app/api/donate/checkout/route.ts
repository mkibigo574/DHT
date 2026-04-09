import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { amount } = await req.json() // expects cents, e.g. 2500 = $25.00

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: amount,
          product_data: {
            name: 'Darwin Has Talent — Donation',
            description:
              "Supporting the NT's premier music competition — regional heats, artist mentorship & youth development.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#donate`,
    billing_address_collection: 'auto',
    metadata: { source: 'website_donation' },
  })

  return NextResponse.json({ url: session.url })
}
