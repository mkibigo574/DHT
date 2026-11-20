import Stripe from 'stripe'

// Stripe is optional: when STRIPE_SECRET_KEY isn't set (e.g. a preview
// deployment), online donations are switched off instead of the whole site
// failing to build. Everything else keeps working.
let client: Stripe | null | undefined

export function getStripe(): Stripe | null {
  if (client === undefined) {
    const key = process.env.STRIPE_SECRET_KEY
    client = key ? new Stripe(key) : null
  }
  return client
}

export const DONATIONS_OFF_MESSAGE =
  'Online donations aren’t available right now. Please use the bank transfer details below.'
