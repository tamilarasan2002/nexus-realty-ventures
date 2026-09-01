import { useEffect, useState } from 'react'
import { NEXT_MODE, applyMode, readMode, resolveMode } from '../lib/theme'
import type { ThemeMode } from '../lib/theme'

const ICON: Record<ThemeMode, string> = { light: '☀', dark: '☾', auto: '◐' }
const LABEL: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark', auto: 'Auto' }

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(readMode)

  useEffect(() => {
    applyMode(mode)
  }, [mode])

  // In auto mode, follow the OS if it changes while the page is open.
  useEffect(() => {
    if (mode !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyMode('auto')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const next = NEXT_MODE[mode]

  return (
    <button
      className="theme-toggle"
      onClick={() => setMode(next)}
      title={`Theme: ${LABEL[mode]}${mode === 'auto' ? ` (${resolveMode('auto')})` : ''} — switch to ${LABEL[next]}`}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}.`}
    >
      <span className="theme-toggle__icon">{ICON[mode]}</span>
      <span className="theme-toggle__text">{LABEL[mode]}</span>
    </button>
  )
}
