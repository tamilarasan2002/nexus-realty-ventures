import { useEffect, useState } from 'react'
import { getAccess, getMemberId, subscribeSession } from './session'
import type { Access } from './session'

/** Re-renders the caller whenever the portal access level changes. */
export function useSession(): { access: Access; memberId: string | null } {
  const [tick, setTick] = useState(0)
  useEffect(() => subscribeSession(() => setTick((t) => t + 1)), [])
  // `tick` is the dependency that forces the re-read.
  void tick
  return { access: getAccess(), memberId: getMemberId() }
}
