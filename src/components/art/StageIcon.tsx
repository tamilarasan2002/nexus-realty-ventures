/**
 * Line icons for the five build stages. Single stroke colour so they read
 * correctly in both themes.
 */
import type { ReactElement } from 'react'

export type StageKey = 'land' | 'design' | 'build' | 'inspect' | 'handover'

const PATHS: Record<StageKey, ReactElement> = {
  // surveyed plot
  land: (
    <>
      <path d="M3 17.5 12 21l9-3.5V8L12 4.5 3 8z" />
      <path d="M3 8l9 3.5L21 8M12 11.5V21" />
      <circle cx="12" cy="7" r="1.3" />
    </>
  ),
  // drawing / plan
  design: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 9h18M9 9v11M14 13h7M14 16.5h4" />
    </>
  ),
  // construction
  build: (
    <>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M4 21h16M9 21v-6h6v6" />
      <path d="M12 4v5" />
    </>
  ),
  // quality check
  inspect: (
    <>
      <path d="M12 3l7.5 3v6c0 4.2-3 7.6-7.5 9-4.5-1.4-7.5-4.8-7.5-9V6z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </>
  ),
  // keys / handover
  handover: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l8 8M16.5 16.5l2 2M14 14l2 2" />
    </>
  ),
}

export function StageIcon({ name, className }: { name: StageKey; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
