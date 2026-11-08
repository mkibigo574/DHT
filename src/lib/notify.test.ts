import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderNotification, sendNotification } from './notify'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{}' }))
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  delete process.env.RESEND_API_KEY
  delete process.env.NOTIFY_TO
  delete process.env.NOTIFY_FROM
  vi.restoreAllMocks()
})

describe('renderNotification', () => {
  it('escapes HTML in submitted values', () => {
    const { html } = renderNotification({
      subject: 's', heading: 'h',
      fields: [['Name', '<script>alert(1)</script>']],
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('leaves out empty fields', () => {
    const { text } = renderNotification({
      subject: 's', heading: 'h',
      fields: [['Name', 'Ada'], ['Phone', null], ['Region', '']],
    })
    expect(text).toContain('Name: Ada')
    expect(text).not.toContain('Phone')
    expect(text).not.toContain('Region')
  })
})

describe('sendNotification', () => {
  it('skips quietly when not configured, so submissions keep working', async () => {
    await expect(sendNotification({ subject: 's', heading: 'h', fields: [] })).resolves.toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends to every NOTIFY_TO address with reply-to set to the submitter', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.NOTIFY_TO = 'a@dht.test, b@dht.test'

    await expect(sendNotification({
      subject: 'New audition', heading: 'h', fields: [], replyTo: 'artist@example.com',
    })).resolves.toBe(true)

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
    const body = JSON.parse(String(init?.body))
    expect(body.to).toEqual(['a@dht.test', 'b@dht.test'])
    expect(body.reply_to).toBe('artist@example.com')
    expect(body.subject).toBe('New audition')
  })

  it('ignores an invalid reply-to address', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.NOTIFY_TO = 'a@dht.test'
    await sendNotification({ subject: 's', heading: 'h', fields: [], replyTo: 'not-an-email' })
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).reply_to).toBeUndefined()
  })

  it('never throws when the email provider fails', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.NOTIFY_TO = 'a@dht.test'
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'))
    await expect(sendNotification({ subject: 's', heading: 'h', fields: [] })).resolves.toBe(false)
  })
})
