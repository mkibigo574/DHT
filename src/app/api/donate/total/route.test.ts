import { describe, it, expect, vi, beforeEach } from 'vitest'

const { GET } = await import('./route')

function respondWith(rows: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => rows }))
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('GET /api/donate/total', () => {
  it('sums the donation amounts', async () => {
    respondWith([{ amount: '25.00' }, { amount: '75.50' }, { amount: '10' }])

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ total: 110.5 })
  })

  it('returns 0 when there are no donations yet', async () => {
    respondWith([])

    await expect((await GET()).json()).resolves.toEqual({ total: 0 })
  })

  it('skips rows whose amount will not parse instead of returning NaN', async () => {
    respondWith([{ amount: '25.00' }, { amount: null }, { amount: 'not-a-number' }])

    await expect((await GET()).json()).resolves.toEqual({ total: 25 })
  })

  it('falls back to 0 when Supabase returns an error object rather than rows', async () => {
    respondWith({ message: 'permission denied for table donations' })

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ total: 0 })
  })

  it('falls back to 0 when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect((await GET()).json()).resolves.toEqual({ total: 0 })
  })
})
