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

function okFetch() {
  return vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '' })
}

/** The Supabase request the route made: [url, parsed body, headers]. */
function insert() {
  const call = vi.mocked(fetch).mock.calls[0]
  if (!call) return undefined
  return {
    url: String(call[0]),
    row: JSON.parse(String(call[1]?.body)),
    headers: call[1]?.headers as Record<string, string>,
  }
}

beforeEach(() => {
  constructEvent.mockReset()
  vi.stubGlobal('fetch', okFetch())
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
    expect(insert()!.row).toEqual({
      donor_name: 'Ada Lovelace',
      amount: 25, // cents converted to dollars
      method: 'stripe',
      notes: 'Stripe payment pi_123',
      stripe_payment_intent_id: 'pi_123',
    })
  })

  // Stripe delivers at least once and retries on timeout. The database rejects
  // the repeat via a unique constraint on stripe_payment_intent_id.
  it('asks the database to ignore a payment it has already recorded', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123', amount: 2500, amount_received: 2500 } },
    })

    await POST(webhookRequest('{}'))

    const { url, headers, row } = insert()!
    expect(url).toContain('on_conflict=stripe_payment_intent_id')
    expect(headers.Prefer).toContain('resolution=ignore-duplicates')
    expect(row.stripe_payment_intent_id).toBe('pi_123')
  })

  // A hosted-checkout payment emits BOTH events, so keying on the event id
  // would still record the same donation twice.
  it('keys a checkout session on its PaymentIntent, not the session id', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_4',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          payment_intent: 'pi_123',
          amount_total: 7500,
          customer_details: { name: 'Grace Hopper' },
        },
      },
    })

    await POST(webhookRequest('{}'))

    expect(insert()!.row).toEqual({
      donor_name: 'Grace Hopper',
      amount: 75,
      method: 'stripe',
      notes: 'Stripe session cs_123',
      stripe_payment_intent_id: 'pi_123', // same key the PaymentIntent event uses
    })
  })

  it('accepts an expanded PaymentIntent object on the session', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_4b',
      type: 'checkout.session.completed',
      data: {
        object: { id: 'cs_9', payment_intent: { id: 'pi_expanded' }, amount_total: 1000 },
      },
    })

    await POST(webhookRequest('{}'))

    expect(insert()!.row.stripe_payment_intent_id).toBe('pi_expanded')
  })

  it('falls back to the session id when a session has no PaymentIntent', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_4c',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_nopi', payment_intent: null, amount_total: 1000 } },
    })

    await POST(webhookRequest('{}'))

    expect(insert()!.row.stripe_payment_intent_id).toBe('cs_nopi')
  })

  it('prefers amount_received over the authorized amount', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_2',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_partial', amount: 5000, amount_received: 2500, metadata: {} } },
    })

    await POST(webhookRequest('{}'))

    expect(insert()!.row).toMatchObject({ amount: 25 })
  })

  it('records an anonymous donation when no donor name is present', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_3',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_anon', amount: 1000, amount_received: 1000 } },
    })

    await POST(webhookRequest('{}'))

    expect(insert()!.row).toMatchObject({ donor_name: null, amount: 10 })
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

  // Returning 500 makes Stripe redeliver. That is safe now that the insert is
  // idempotent, and beats silently losing the record of a real payment.
  it('returns 500 so Stripe retries when the insert fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => 'unavailable' }),
    )
    constructEvent.mockReturnValue({
      id: 'evt_6',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_x', amount: 2500, amount_received: 2500 } },
    })

    const res = await POST(webhookRequest('{}'))

    expect(res.status).toBe(500)
  })

  it('returns 500 so Stripe retries when the database is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('supabase down')))
    constructEvent.mockReturnValue({
      id: 'evt_7',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_y', amount: 2500, amount_received: 2500 } },
    })

    const res = await POST(webhookRequest('{}'))

    expect(res.status).toBe(500)
  })
})
