'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Load Stripe once, outside the component, so it isn't re-created on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Match the dark, pink-accented donate card.
const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#ff4d94',
    colorBackground: '#171319',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.55)',
    colorDanger: '#ff8080',
    borderRadius: '10px',
    fontSizeBase: '15px',
    spacingUnit: '3px',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1.5px solid rgba(255,255,255,0.1)',
    },
    '.Input:focus': {
      border: '1.5px solid rgba(255,77,148,0.55)',
      boxShadow: '0 0 0 3px rgba(255,77,148,0.14)',
    },
    '.Label': {
      color: 'rgba(255,255,255,0.6)',
      fontWeight: '600',
    },
  },
}

type Props = {
  amountCents: number
  displayAmt: string
  onBack: () => void
}

// Inner form — must live inside <Elements> to use the Stripe hooks.
function CheckoutForm({ amountCents, displayAmt, onBack }: Props) {
  const stripe = useStripe()
  const elements = useElements()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setError('')
    setLoading(true)

    // Validate the Payment Element fields before creating the intent.
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Please check your card details.')
      setLoading(false)
      return
    }

    // Create the PaymentIntent on the server for the chosen amount.
    let clientSecret: string
    try {
      const res = await fetch('/api/donate/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents, name, email }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      clientSecret = data.clientSecret
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
      return
    }

    // Confirm on-site. Stripe only redirects if the card requires extra
    // authentication (e.g. 3-D Secure); otherwise we navigate manually.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/donate/success`,
        payment_method_data: {
          billing_details: {
            ...(name ? { name } : {}),
            ...(email ? { email } : {}),
          },
        },
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment could not be completed.')
      setLoading(false)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      window.location.href = `/donate/success?payment_intent=${paymentIntent.id}`
    } else {
      // Rare fallback — payment is processing.
      window.location.href = `/donate/success`
    }
  }

  return (
    <form className="donate-pay-form" onSubmit={handleSubmit}>
      <div className="donate-pay-fields">
        <input
          type="text"
          className="donate-text-input"
          placeholder="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="donate-text-input"
          placeholder="Email (for your receipt)"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />

      {error && <p className="donate-error" role="alert">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary donate-cta-btn"
        disabled={loading || !stripe}
      >
        {loading ? (
          <><span className="donate-spinner" aria-hidden="true" /> Processing…</>
        ) : (
          <>
            Donate {displayAmt} to DHT
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" aria-hidden="true" style={{ marginLeft: 6, flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      <button type="button" className="donate-back-link" onClick={onBack} disabled={loading}>
        ← Change amount
      </button>

      <div className="donate-trust-row">
        <svg viewBox="0 0 20 20" fill="currentColor" width="12" aria-hidden="true">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>256-bit SSL · Powered by Stripe</span>
      </div>
    </form>
  )
}

export default function DonatePaymentForm(props: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: props.amountCents,
        currency: 'aud',
        appearance,
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  )
}
