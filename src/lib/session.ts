/**
 * Portal access levels.
 *
 *   locked   — nothing in /portal is reachable
 *   company  — the two company documents (charter, governance policy).
 *              Anyone holding the portal code gets this.
 *   admin    — additionally the management forms. Restricted to the five
 *              board members, who identify themselves so that e-signing
 *              can be limited to the signatories each form actually names.
 *
 * ⚠ Both codes ship in the JavaScript bundle, so this is an access *gate*,
 * not security. Anyone with devtools can read them or set the session keys
 * directly, and the source PDFs remain fetchable from /documents/*.pdf.
 * Real protection needs the files served from behind server-side auth.
 */

export type Access = 'locked' | 'company' | 'admin'

/** Hard-coded, as requested. */
export const COMPANY_PIN = '1234'
export const ADMIN_PIN = '5678'

const K_COMPANY = 'nexus-portal-unlocked'
const K_MEMBER = 'nexus-admin-member'

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* storage blocked — access still applies for this page view */
  }
}
function drop(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------
   Change notification. sessionStorage fires no event in the tab that
   wrote it, so components that show access state would otherwise keep
   rendering a stale level until something else re-rendered them.
   ------------------------------------------------------------------ */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeSession(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(): void {
  for (const fn of listeners) fn()
}

export function getAccess(): Access {
  if (read(K_MEMBER)) return 'admin'
  return read(K_COMPANY) === 'yes' ? 'company' : 'locked'
}

/** Which of the five members is signed in, if any. */
export function getMemberId(): string | null {
  return read(K_MEMBER)
}

export function unlockCompany(pin: string): boolean {
  if (pin !== COMPANY_PIN) return false
  write(K_COMPANY, 'yes')
  notify()
  return true
}

/** Admin needs both a member identity and the admin code. */
export function unlockAdmin(memberId: string, pin: string): boolean {
  if (pin !== ADMIN_PIN || !memberId) return false
  write(K_COMPANY, 'yes')
  write(K_MEMBER, memberId)
  notify()
  return true
}

/** Steps back down to company level, keeping the portal open. */
export function signOutMember(): void {
  drop(K_MEMBER)
  notify()
}

export function lockAll(): void {
  drop(K_MEMBER)
  drop(K_COMPANY)
  notify()
}
