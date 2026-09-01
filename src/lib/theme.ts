/**
 * Theme handling.
 *
 * Three states: 'light', 'dark', and 'auto' (follow the OS). An explicit
 * choice is written to `data-theme` on <html> and persisted; 'auto' removes
 * the attribute so the `prefers-color-scheme` media query in the stylesheet
 * takes over. index.html applies the stored value before first paint, so
 * there is no flash of the wrong theme.
 */

export type ThemeMode = 'light' | 'dark' | 'auto'

const KEY = 'nexus-theme'

export function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function applyMode(mode: ThemeMode): void {
  const root = document.documentElement
  if (mode === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)
  try {
    if (mode === 'auto') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, mode)
  } catch {
    /* storage blocked — the theme still applies for this page view */
  }
}

/** What the user would actually see right now. */
export function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') return mode
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  auto: 'light',
  light: 'dark',
  dark: 'auto',
}
