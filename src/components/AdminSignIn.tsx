/**
 * Step-up sign-in for the management forms.
 *
 * The forms name specific posts as their signatories, so a member has to say
 * which of the five they are before the app can decide what they may sign.
 */
import { useState } from 'react'
import { MEMBERS } from '../data/members'
import { unlockAdmin } from '../lib/session'

export function AdminSignIn() {
  const [memberId, setMemberId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberId) {
      setError('Select which post you hold.')
      return
    }
    if (unlockAdmin(memberId, pin)) {
      setError(null)
      // The session store notifies subscribers, so the list re-renders itself.
    } else {
      setError('That admin code is not correct.')
      setPin('')
    }
  }

  return (
    <div className="gate">
      <form className="gate__box" onSubmit={submit}>
        <div className="gate__icon" aria-hidden="true">
          🛡
        </div>
        <h2 className="gate__title">Board members only</h2>
        <p className="gate__lede">
          The management forms are restricted to the five board members. Identify yourself and
          enter the admin code.
        </p>

        <div className="field" style={{ textAlign: 'left' }}>
          <label className="field__label">Your post</label>
          <select
            className="select"
            value={memberId}
            onChange={(e) => {
              setMemberId(e.target.value)
              setError(null)
            }}
          >
            <option value="">Select…</option>
            {MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.post}
                {m.name ? ` — ${m.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ textAlign: 'left' }}>
          <label className="field__label">Admin code</label>
          <input
            className={`input gate__input${error ? ' input--invalid' : ''}`}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setError(null)
            }}
          />
        </div>

        {error && (
          <p className="gate__error" role="alert">
            {error}
          </p>
        )}

        <div className="gate__actions">
          <button className="btn btn--primary" type="submit" disabled={!memberId || !pin}>
            Unlock forms
          </button>
        </div>
      </form>
    </div>
  )
}
