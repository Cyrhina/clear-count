/** A few seconds of memory for the read helpers that several reports call at once, so one screen does not ask the server for the same list five times. */
const cache = new Map<string, { at: number; value: Promise<unknown> }>()

const TTL_MS = 10_000

export function memoRead<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>
  const value = load()
  cache.set(key, { at: Date.now(), value })
  // A failed read is not kept: the next call asks again.
  value.catch(() => cache.delete(key))
  return value
}
