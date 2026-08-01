import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Stripe is mocked so tests never touch the network or a real account.
const create = vi.fn()
vi.mock('stripe', () => ({
  default: class {
    paymentIntents = { create }
  },
}))

// Imported after the mock so the route picks up the fake client.
const { POST } = await import('./route')

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/donate/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  create.mockReset()
  create.mockResolvedValue({ client_secret: 'pi_123_secret_abc' })
})

describe('POST /api/donate/intent', () => {
  it('creates a PaymentIntent and returns the client secret', async () => {
    const res = await POST(postRequest({ amount: 2500 }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ clientSecret: 'pi_123_secret_abc' })
    expect(create).toHaveBeenCalledOnce()
    expect(create.mock.calls[0][0]).toMatchObject({
      amount: 2500,
      currency: 'aud',
    })
  })

  it('passes the donor name and receipt email through to Stripe', async () => {
    await POST(postRequest({ amount: 5000, name: 'Ada Lovelace', email: 'ada@example.com' }))

    expect(create.mock.calls[0][0]).toMatchObject({
      receipt_email: 'ada@example.com',
      metadata: { source: 'website_donation', donor_name: 'Ada Lovelace' },
    })
  })

  it('trims whitespace and omits blank name/email rather than sending empty strings', async () => {
    await POST(postRequest({ amount: 1000, name: '   ', email: '  ' }))

    const args = create.mock.calls[0][0]
    expect(args).not.toHaveProperty('receipt_email')
    expect(args.metadata).not.toHaveProperty('donor_name')
  })

  it('truncates an over-long name to 120 characters', async () => {
    await POST(postRequest({ amount: 1000, name: 'x'.repeat(500) }))

    expect(create.mock.calls[0][0].metadata.donor_name).toHaveLength(120)
  })

  it('rounds a fractional amount to whole cents', async () => {
    await POST(postRequest({ amount: 2500.6 }))

    expect(create.mock.calls[0][0].amount).toBe(2501)
  })

  // $1.00 is the documented floor, and Stripe itself rejects sub-minimum charges.
  it.each([
    ['below the minimum', 99],
    ['zero', 0],
    ['negative', -500],
    ['a numeric string', '2500'],
    ['missing', undefined],
    ['not a number', NaN],
  ])('rejects %s with a 400 and does not call Stripe', async (_label, amount) => {
    const res = await POST(postRequest({ amount }))

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Minimum donation is $1' })
    expect(create).not.toHaveBeenCalled()
  })

  it('accepts exactly the $1 minimum', async () => {
    const res = await POST(postRequest({ amount: 100 }))

    expect(res.status).toBe(200)
    expect(create.mock.calls[0][0].amount).toBe(100)
  })

  it('returns a 500 with a generic message when Stripe fails', async () => {
    create.mockRejectedValue(new Error('Invalid API Key provided: sk_live_secret'))

    const res = await POST(postRequest({ amount: 2500 }))

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual({ error: 'Could not start the payment. Please try again.' })
    // The upstream message can carry key material — it must not reach the client.
    expect(JSON.stringify(body)).not.toContain('sk_live')
  })
})
