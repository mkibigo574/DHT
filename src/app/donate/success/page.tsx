import Link from 'next/link'
import Stripe from 'stripe'
import ConfettiLaunch from './ConfettiLaunch'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function DonateSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  let amountDisplay = ''
  let donorFirst = ''

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const cents = session.amount_total ?? 0
      amountDisplay = `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`
      const fullName = session.customer_details?.name ?? ''
      donorFirst = fullName.split(' ')[0]
    } catch {
      // Non-fatal — still show the page
    }
  }

  return (
    <>
      <ConfettiLaunch />
      <main className="ds-page">
        <div className="ds-card">

          {/* Animated check ring */}
          <div className="ds-check-ring" aria-hidden="true">
            <svg className="ds-check-svg" viewBox="0 0 52 52">
              <circle className="ds-check-circle" cx="26" cy="26" r="24" fill="none" />
              <polyline className="ds-check-tick" points="14 27 22 35 38 19" fill="none" />
            </svg>
          </div>

          <p className="ds-eyebrow">Donation received</p>

          <h1 className="ds-heading">
            {donorFirst ? `Thank you, ${donorFirst}!` : 'Thank you!'}
          </h1>

          {amountDisplay && (
            <p className="ds-amount-line">
              Your <span className="ds-amount">{amountDisplay}</span> donation is going
              straight to Territory music.
            </p>
          )}

          <p className="ds-body">
            You&apos;re helping young musicians from Alice Springs, Katherine, and Tennant Creek
            stay home and be heard. A receipt has been sent to your email.
          </p>

          {/* Impact strip */}
          <div className="ds-impact-strip">
            {[
              { emoji: '🎪', text: 'Regional heats' },
              { emoji: '🎓', text: 'Mentorship' },
              { emoji: '🎬', text: 'Media exposure' },
            ].map(item => (
              <div key={item.text} className="ds-impact-item">
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="ds-actions">
            <Link href="/#donate" className="ds-btn ds-btn--gold">
              Donate again
            </Link>
            <Link href="/" className="ds-btn ds-btn--ghost">
              Back to home
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}
