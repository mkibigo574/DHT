import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { POST } = await import('./route')

function req(body: unknown) {
  return new NextRequest('http://localhost:3000/api/audition', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function inserted() {
  const call = vi.mocked(fetch).mock.calls.find(([u]) => String(u).includes('/rest/v1/auditions'))
  return call ? JSON.parse(String(call[1]?.body)) : undefined
}

const base = { name: 'Ada Lovelace', email: 'ada@example.com', region: 'Darwin / Top End' }

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}), text: async () => '' }))
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('POST /api/audition', () => {
  it('accepts an uploaded video', async () => {
    const res = await POST(req({
      ...base,
      video_path: '2026/1b4e28ba-2fa1-11d2-883f-0016d3cca427-ada-lovelace.mp4',
      video_name: 'my song.mp4',
      video_size: 12345678,
    }))
    expect(res.status).toBe(200)
    expect(inserted()).toMatchObject({
      name: 'Ada Lovelace',
      video_path: '2026/1b4e28ba-2fa1-11d2-883f-0016d3cca427-ada-lovelace.mp4',
      video_name: 'my song.mp4',
      video_size: 12345678,
      video_link: null,
    })
  })

  it('still accepts a video link on its own', async () => {
    const res = await POST(req({ ...base, video_link: 'https://youtube.com/watch?v=abc' }))
    expect(res.status).toBe(200)
    expect(inserted()).toMatchObject({ video_link: 'https://youtube.com/watch?v=abc', video_path: null })
  })

  it('rejects a submission with no video at all', async () => {
    const res = await POST(req(base))
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects a missing or invalid email', async () => {
    const res = await POST(req({ ...base, email: 'nope', video_link: 'https://youtube.com/x' }))
    expect(res.status).toBe(400)
  })

  it('rejects a storage path it did not generate', async () => {
    const res = await POST(req({ ...base, video_path: '../../other-bucket/secret.mp4' }))
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('only writes whitelisted columns (an applicant cannot set their own status)', async () => {
    await POST(req({ ...base, video_link: 'https://youtube.com/x', status: 'accepted', id: 'hijack' }))
    const row = inserted()
    expect(row.status).toBeUndefined()
    expect(row.id).toBeUndefined()
  })

  it('reports a database failure to the applicant', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ message: 'boom' }) } as Response)
    const res = await POST(req({ ...base, video_link: 'https://youtube.com/x' }))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'boom' })
  })
})
