import type { ApiErrorBody } from './types'

/**
 * Small typed fetch wrapper. Build your query functions on top of this.
 *
 * MSW intercepts these requests in the browser and in tests, so the same
 * `/api/...` paths work locally and in the deployed demo.
 */
const BASE_URL = import.meta.env.BASE_URL

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly meta?: Record<string, unknown>

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.error.message ?? `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.error.code ?? 'UNKNOWN'
    this.fields = body?.error.fields
    this.meta = body?.error.meta
  }
}

// Demo hooks from the API contract (`?scenario=error`, `?delay=1500`). When
// they're on the page URL they're forwarded to API requests, so reviewers can
// see the error, empty and loading states on the deployed site.
const DEMO_PARAM = { Scenario: 'scenario', Delay: 'delay' } as const

function withDemoParams(path: string): string {
  const [pathname, query = ''] = path.split('?')
  const params = new URLSearchParams(query)
  const page = new URLSearchParams(window.location.search)

  for (const name of Object.values(DEMO_PARAM)) {
    const value = page.get(name)
    if (value !== null) params.set(name, value)
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${withDemoParams(path).replace(/^\//, '')}`
  const response = await fetch(url, init)
  const body = (await response.json().catch(() => null)) as
    | T
    | ApiErrorBody
    | null

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody | null)
  }

  return body as T
}
