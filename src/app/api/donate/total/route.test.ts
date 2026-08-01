import { describe, it, expect, vi, beforeEach } from 'vitest'

const { GET } = await import('./route')

function respondWith(body: string, ok = true, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status, text: async () => body }))
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('GET /api/donate/total', () => {
  it('returns the total summed by the database', async () => {
    respondWith('110.50')

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ total: 110.5 })
  })

  it('aggregates in Postgres rather than fetching every donation row', async () => {
    // Summing client-side silently under-reports past PostgREST's row cap.
    respondWith('42')

    await GET()

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/rest/v1/rpc/donations_total')
    expect(init?.method).toBe('POST')
    expect(String(url)).not.toContain('select=amount')
  })

  it('returns 0 when there are no donations yet', async () => {
    respondWith('0')

    await expect((await GET()).json()).resolves.toEqual({ total: 0 })
  })

  it('falls back to 0 when the response is not a number', async () => {
    respondWith('null')

    await expect((await GET()).json()).resolves.toEqual({ total: 0 })
  })

  it('falls back to 0 when the RPC returns an error status', async () => {
    respondWith('{"message":"permission denied"}', false, 401)

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ total: 0 })
  })

  it('falls back to 0 when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect((await GET()).json()).resolves.toEqual({ total: 0 })
  })
})
