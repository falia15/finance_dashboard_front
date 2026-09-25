import { vi } from 'vitest'

export const API_URL = 'http://api.test/api'

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/ld+json' } })
}

type Handler = (request: { method: string; path: string; init?: RequestInit }) => Response | Promise<Response>

/**
 * Replaces the global fetch. `path` is relative to the API URL
 * (e.g. '/profiles/1'). Returns the mock to assert on the calls.
 */
export function mockFetch(handler: Handler) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const path = url.startsWith(API_URL) ? url.slice(API_URL.length) : url
    return handler({ method: init?.method ?? 'GET', path, init })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Calls made with the given method, as [path, init] pairs. */
export function callsWith(fetchMock: ReturnType<typeof mockFetch>, method: string) {
  return fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? 'GET') === method)
    .map(([input, init]) => [String(input).slice(API_URL.length), init] as const)
}
