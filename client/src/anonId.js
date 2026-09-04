const ANON_ID_KEY = 'tenali-anon-id'

export function getOrCreateAnonymousId() {
  try {
    const existing = localStorage.getItem(ANON_ID_KEY)
    if (existing) return existing
    const id = `anon_${crypto.randomUUID()}`
    localStorage.setItem(ANON_ID_KEY, id)
    return id
  } catch {
    return `anon_${crypto.randomUUID()}`
  }
}
