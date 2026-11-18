import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

// Simulates a deployment with no Stripe keys configured (e.g. a preview site).
delete process.env.STRIPE_SECRET_KEY
const { POST } = await import('./route')

describe('POST /api/donate/intent without Stripe configured', () => {
  it('switches donations off with a clear message instead of crashing', async () => {
    const res = await POST(new NextRequest('http://localhost:3000/api/donate/intent', {
      method: 'POST',
      body: JSON.stringify({ amount: 2500 }),
    }))
    expect(res.status).toBe(503)
    const data = await res.json() as { error: string }
    expect(data.error).toMatch(/bank transfer/)
  })
})
