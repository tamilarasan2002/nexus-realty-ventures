/**
 * PIN gate for the /portal/* subtree.
 *
 * Two levels live behind it — see src/lib/session.ts. This gate handles the
 * company level; the admin step-up happens inside the documents page.
 *
 * ⚠ Client-side speed bump, not security: the codes ship in the bundle and the
 * source PDFs stay fetchable from /documents/*.pdf.
 */
import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { PortalBar } from './PortalBar'

import { getAccess, unlockCompany } from '../lib/session'

export function PortalGate() {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => getAccess() !== 'locked')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus()
  }, [unlocked])

  // Escape leaves the portal rather than trapping the visitor.
  useEffect(() => {
    if (unlocked) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlocked, navigate])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (unlockCompany(value)) {
      setUnlocked(true)
      setError(null)
      setValue('')
    } else {
      setError('That code is not correct.')
      setValue('')
      inputRef.current?.focus()
    }
  }

  if (unlocked) {
    return (
      <>
        <PortalBar />
        <Outlet />
      </>
    )
  }

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <form className="gate__box" onSubmit={submit}>
        <div className="gate__icon" aria-hidden="true">
          🔒
        </div>
        <h2 className="gate__title" id="gate-title">
          Access code required
        </h2>
        <p className="gate__lede">
          The document area is restricted. Enter the access code to continue.
        </p>

        <input
          ref={inputRef}
          className={`input gate__input${error ? ' input--invalid' : ''}`}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          aria-invalid={!!error}
          aria-describedby={error ? 'gate-error' : undefined}
        />
        {error && (
          <p className="gate__error" id="gate-error" role="alert">
            {error}
          </p>
        )}

        <div className="gate__actions">
          <button className="btn btn--primary" type="submit" disabled={!value}>
            Unlock
          </button>
          <button className="btn" type="button" onClick={() => navigate('/')}>
            Back to site
          </button>
        </div>
      </form>
    </div>
  )
}
