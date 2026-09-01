/**
 * Per-browser store for the *current* version of each document.
 *
 * Signing produces a new PDF. Rather than keeping it in memory (lost on
 * reload), the signed bytes are written here and become the version the app
 * serves from then on — the bundled file in `public/documents/` stays
 * untouched as the pristine original that can always be restored.
 *
 * Scope note: IndexedDB is per browser, per device. This makes "download and
 * replace" real for the person doing the signing, but it does not publish the
 * new version to anyone else — that would need a server.
 */

const DB_NAME = 'nexus-docs'
const DB_VERSION = 1
const STORE = 'documents'

export interface StoredDocument {
  docId: string
  bytes: ArrayBuffer
  /** Slot ids already signed, mirrored from the PDF metadata for quick reads. */
  signedSlots: string[]
  signedCount: number
  totalSlots: number
  filename: string
  updatedAt: string
}

/**
 * IndexedDB can stall indefinitely — an `open` blocks while another tab holds
 * an older version, and a pending deleteDatabase blocks every opener. Racing
 * each access against a timeout means a stalled store degrades to "no stored
 * version" instead of leaving the UI waiting on a promise that never settles.
 */
const IDB_TIMEOUT_MS = 3000

function withTimeout<T>(work: Promise<T>, fallbackLabel: string): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`IndexedDB ${fallbackLabel} timed out`)), IDB_TIMEOUT_MS),
    ),
  ])
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'docId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onblocked = () => reject(new Error('IndexedDB open blocked'))
  })
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return withTimeout(
    openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
        t.oncomplete = () => db.close()
      }),
    ),
    mode,
  )
}

/** Returns the stored current version, or null when the original is still in force. */
export async function getCurrent(docId: string): Promise<StoredDocument | null> {
  try {
    const found = await tx<StoredDocument | undefined>('readonly', (s) => s.get(docId))
    return found ?? null
  } catch {
    // Private windows and blocked site-data settings make IndexedDB throw;
    // the app then simply keeps using the bundled original.
    return null
  }
}

/**
 * Returns false when the write did not land — a private window, blocked site
 * data, a full quota or a stalled store. Callers must surface that, because
 * the whole point of "replace" is that it persists; silently doing nothing
 * would leave someone believing the document had been updated.
 */
export async function putCurrent(doc: StoredDocument): Promise<boolean> {
  try {
    await tx('readwrite', (s) => s.put(doc))
    return true
  } catch {
    return false
  }
}

export async function clearCurrent(docId: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(docId))
  } catch {
    /* ignore */
  }
}

/** Status for every stored document, for the document list badges. */
export async function getAllStatus(): Promise<Record<string, StoredDocument>> {
  try {
    const all = await tx<StoredDocument[]>('readonly', (s) => s.getAll())
    return Object.fromEntries(all.map((d) => [d.docId, d]))
  } catch {
    return {}
  }
}
