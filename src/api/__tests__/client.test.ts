import { afterEach, describe, expect, it } from 'vitest'
import { ApiError, apiFetch, setApiActiveProfileId } from '../client'
import { jsonResponse, mockFetch } from '../../test/fetch'

function sentHeaders(fetchMock: ReturnType<typeof mockFetch>): Record<string, string> {
  return fetchMock.mock.calls[0][1]?.headers as Record<string, string>
}

describe('apiFetch', () => {
  afterEach(() => setApiActiveProfileId(null))

  it('sends the active profile in the X-Profile-Id header', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}))
    setApiActiveProfileId(42)

    await apiFetch('/incomes')

    expect(sentHeaders(fetchMock)['X-Profile-Id']).toBe('42')
  })

  it('omits the header when no profile is active', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}))

    await apiFetch('/profiles')

    expect(sentHeaders(fetchMock)).not.toHaveProperty('X-Profile-Id')
  })

  it('lets the caller override default headers', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}))

    await apiFetch('/profiles/1', { method: 'PATCH', headers: { 'Content-Type': 'application/merge-patch+json' } })

    expect(sentHeaders(fetchMock)['Content-Type']).toBe('application/merge-patch+json')
  })

  it('returns the decoded body', async () => {
    mockFetch(() => jsonResponse({ id: 1 }))

    await expect(apiFetch('/profiles/1')).resolves.toEqual({ id: 1 })
  })

  it('returns undefined on 204', async () => {
    mockFetch(() => new Response(null, { status: 204 }))

    await expect(apiFetch('/profiles/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws an ApiError carrying the status on failure', async () => {
    mockFetch(() => jsonResponse({}, 422))

    await expect(apiFetch('/profiles/1', { method: 'DELETE' })).rejects.toMatchObject({
      constructor: ApiError,
      status: 422,
    })
  })
})
