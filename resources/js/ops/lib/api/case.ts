/**
 * The Laravel API speaks snake_case; the ops UI speaks camelCase (and string ids). These two converters sit at the service
 * boundary so a service can hand the UI the same shape as `types/domain.ts` without a hand-written mapper per entity.
 *
 * Reading (`camelizeKeys`): keys become camelCase, `null` fields are dropped (the UI types use optional fields), and numeric
 * `id` / `*Id` / `*Ids` values become strings. Pass `keep` to leave the subtree under a key untouched, for objects whose keys
 * are data (for example a map keyed by pay frequency) and not field names.
 */
const toCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export function camelizeKeys<T>(value: unknown, keep: readonly string[] = []): T {
  if (Array.isArray(value)) return value.map((item) => camelizeKeys(item, keep)) as T
  if (!isPlainObject(value)) return value as T

  const out: Record<string, unknown> = {}
  for (const [rawKey, raw] of Object.entries(value)) {
    if (raw === null) continue
    const key = toCamel(rawKey)
    if (keep.includes(key)) out[key] = raw
    else if ((key === 'id' || key.endsWith('Id')) && typeof raw === 'number') out[key] = String(raw)
    else if (key.endsWith('Ids') && Array.isArray(raw)) out[key] = raw.map(String)
    else out[key] = camelizeKeys(raw, keep)
  }
  return out as T
}

/** Writing: camelCase keys become snake_case (recursively). `undefined` values are left out of the JSON body by `JSON.stringify`. */
export function snakeizeKeys<T = unknown>(value: unknown, keep: readonly string[] = []): T {
  if (Array.isArray(value)) return value.map((item) => snakeizeKeys(item, keep)) as T
  if (!isPlainObject(value)) return value as T

  const out: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(value)) out[toSnake(key)] = keep.includes(key) ? raw : snakeizeKeys(raw, keep)
  return out as T
}
