import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const constructEvent = vi.fn()
vi.mock('stripe', () => ({
  default: class {
    webhooks = { constructEvent }
  },
}))

const { POST } = await import('./route')

function webhookRequest(body: string, sig: string | null = 'sig_abc') {
  return new NextRequest('http://localhost:3000/api/donate/webhook', {
    method: 'POST',
    headers: sig ? { 'stripe-signature': sig } : {},
    body,
  })
}

/** The Supabase insert the route makes, or undefined if it never inserted. */
function insertedRow() {
  const call = vi.mocked(fetch).mock.calls[0]
  if (!call) return undefined
  return JSON.parse(String(call[1]?.body))
}

beforeEach(() => {
  constructEvent.mockReset()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
})

describe('POST /api/donate/webhook', () => {
  it('rejects a request with no stripe-signature header', async () => {
    const res = await POST(webhookRequest('{}', null))

    expect(res.status).toBe(400)
    expect(constructEvent).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects an event whose signature does not verify', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature')
    })

    const res = await POST(webhookRequest('{"forged":true}'))

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Webhook signature verification failed' })
    // A forged event must never reach the database.
    expect(fetch).not.toHaveBeenCalled()
  })

  it('verifies against the raw body, not a re-serialized copy', async () => {
    // Stripe signs the exact bytes sent; re-encoding the JSON breaks verification.
    const raw = '{"id":"evt_1",  "type":"ping"}'
    constructEvent.mockReturnValue({ id: 'evt_1', type: 'ping', data: { object: {} } })

    await POST(webhookRequest(raw))

    expect(constructEvent).toHaveBeenCalledWith(raw, 'sig_abc', 'whsec_dummy')
  })

  it('records a donation when a PaymentIntent succeeds', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 2500,
          amount_received: 2500,
          metadata: { donor_name: 'Ada Lovelace' },
        },
      },
    })

    const res = await POST(webhookRequest('{}'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ received: true })
    expect(insertedRow()).toEqual({
      donor_name: 'Ada Lovelace',
      amount: 25, // cents converted to dollars
      method: 'stripe',
      notes: 'Stripe payment pi_123',
    })
  })

  it('prefers amount_received over the authorized amount', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_2',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_partial', amount: 5000, amount_received: 2500, metadata: {} } },
    })

    await POST(webhookRequest('{}'))

    expect(insertedRow()).toMatchObject({ amount: 25 })
  })

  it('records an anonymous donation when no donor name is present', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_3',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_anon', amount: 1000, amount_received: 1000 } },
    })

    await POST(webhookRequest('{}'))

    expect(insertedRow()).toMatchObject({ donor_name: null, amount: 10 })
  })

  it('records legacy hosted-checkout donations', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_4',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          amount_total: 7500,
          customer_details: { name: 'Grace Hopper' },
        },
      },
    })

    await POST(webhookRequest('{}'))

    expect(insertedRow()).toEqual({
      donor_name: 'Grace Hopper',
      amount: 75,
      method: 'stripe',
      notes: 'Stripe session cs_123',
    })
  })

  it('ignores event types it does not handle', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_5',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_failed', amount: 2500 } },
    })

    const res = await POST(webhookRequest('{}'))

    expect(res.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('still acknowledges the event when recording the donation fails', async () => {
    // Returning non-2xx would make Stripe retry a payment that already succeeded.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('supabase down')))
    constructEvent.mockReturnValue({
      id: 'evt_6',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_x', amount: 2500, amount_received: 2500 } },
    })

    const res = await POST(webhookRequest('{}'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ received: true })
  })
})
