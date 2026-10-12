/** Thrown for any non-2xx answer. `errors` carries Laravel's per-field messages on a 422. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(message)
  }
}

function xsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

type Query = Record<string, string | number | boolean | null | undefined>

function withQuery(path: string, query?: Query): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  // A FormData body (file upload) is sent as multipart: the browser sets the Content-Type with its boundary.
  const isForm = body instanceof FormData
  const response = await fetch(withQuery(path, query), {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-XSRF-TOKEN': xsrfToken(),
      ...(body === undefined || isForm ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    // The session ended (or the page sat open too long): back to the login page instead of a broken screen.
    if (response.status === 401 || response.status === 419) window.location.assign('/login')
    throw new ApiError(payload.message ?? `Request failed (${response.status})`, response.status, payload.errors ?? {})
  }
  return payload as T
}

/** Same-origin JSON calls to the Laravel API, with the CSRF token and session cookie handled. */
export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  /** Multipart POST for a file; put the file (and any other fields) in the FormData. */
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, form),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

/** A message safe to show a person: the first field error if there is one, otherwise the error's own message. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return Object.values(error.errors)[0]?.[0] ?? error.message
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

/** The first message per field of a 422, for showing next to the matching input (`errors.name`). */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {}
  return Object.fromEntries(Object.entries(error.errors).map(([field, messages]) => [field, messages[0] ?? '']))
}
