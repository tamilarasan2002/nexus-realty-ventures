/**
 * Draft persistence. Frontend-only, so drafts live in this browser's
 * localStorage — they survive reloads but are not shared across devices.
 * Every read/write is guarded: private windows and blocked-site-data
 * settings make localStorage throw rather than return null.
 */

const PREFIX = 'nexus-docs:'

export function loadDraft<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage unavailable or full — the editor keeps working in memory.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
