import { useNavigate } from 'react-router-dom'
import { MEMBERS } from '../data/members'
import { lockAll, signOutMember } from '../lib/session'
import { useSession } from '../lib/useSession'

/** Chrome for the restricted area, shown only once the gate is passed. */
export function PortalBar() {
  const navigate = useNavigate()
  const { access, memberId } = useSession()
  const me = MEMBERS.find((m) => m.id === memberId) ?? null

  return (
    <div className="portalbar">
      <span className="portalbar__tag">🔒 Restricted</span>

      {me ? (
        <span className="portalbar__who">
          {me.post}
          {me.name ? ` · ${me.name}` : ''}
        </span>
      ) : (
        <span className="portalbar__who portalbar__who--muted">Company access</span>
      )}

      <span className="topbar__spacer" />

      {access === 'admin' && (
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => {
            signOutMember()
            navigate('/portal/documents')
          }}
        >
          Leave admin
        </button>
      )}
      <button
        className="btn btn--sm btn--ghost"
        onClick={() => {
          lockAll()
          navigate('/')
        }}
      >
        Lock &amp; exit
      </button>
    </div>
  )
}
