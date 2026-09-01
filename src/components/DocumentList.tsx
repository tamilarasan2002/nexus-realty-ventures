import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ADMIN_CATEGORIES, documentsInGroup, documentsInSection } from '../data/documents'
import type { AdminCategory, DocumentGroup, DocumentMeta } from '../data/documents'
import { MEMBERS } from '../data/members'
import { useSession } from '../lib/useSession'
import { getAllStatus } from '../lib/documentStore'
import type { StoredDocument } from '../lib/documentStore'
import { asset } from '../lib/asset'
import { AdminSignIn } from './AdminSignIn'

const TABS: { group: DocumentGroup; label: string }[] = [
  { group: 'company', label: 'Company documents' },
  { group: 'admin', label: 'Admin documents' },
]

const COMPANY_BLURB =
  'The two governing documents. Open them in the viewer, e-sign the witness page, or download the original.'

export function DocumentList() {
  const navigate = useNavigate()
  /*
   * Tab and category are held in the URL rather than component state: opening
   * a document and coming back re-mounts this list, and local state would drop
   * the reader on the default tab instead of where they were.
   */
  const [params, setParams] = useSearchParams()
  const tab: DocumentGroup = params.get('tab') === 'admin' ? 'admin' : 'company'
  const section = (params.get('section') as AdminCategory | null) ?? null

  const goto = (nextTab: DocumentGroup, nextSection: AdminCategory | null) => {
    const next = new URLSearchParams({ tab: nextTab })
    if (nextSection) next.set('section', nextSection)
    setParams(next, { replace: true })
  }

  const { access, memberId } = useSession()
  const [stored, setStored] = useState<Record<string, StoredDocument>>({})

  useEffect(() => {
    let alive = true
    void getAllStatus().then((s) => alive && setStored(s))
    return () => {
      alive = false
    }
  }, [access])

  const me = MEMBERS.find((m) => m.id === memberId) ?? null
  const openDoc = (doc: DocumentMeta) =>
    navigate(doc.kind === 'edit' ? `/portal/edit/${doc.id}` : `/portal/view/${doc.id}`)

  const activeSection = section ? ADMIN_CATEGORIES.find((c) => c.id === section) : null
  const docs =
    tab === 'company' ? documentsInGroup('company') : section ? documentsInSection(section) : []

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Document portal</p>
        <h1>
          Company <span className="grad">documents</span>
        </h1>
        <p>Everything is processed in your browser — nothing is uploaded.</p>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.group}
            role="tab"
            aria-selected={tab === t.group}
            className={`tabs__tab${tab === t.group ? ' is-active' : ''}`}
            onClick={() => goto(t.group, null)}
          >
            {t.label}
            {t.group === 'admin' && access !== 'admin' && (
              <span className="tabs__lock" aria-hidden="true">
                🔒
              </span>
            )}
            <span className="tabs__count">
              {t.group === 'company'
                ? documentsInGroup('company').length
                : ADMIN_CATEGORIES.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'admin' && access !== 'admin' ? (
        <AdminSignIn />
      ) : (
        <>
          {tab === 'admin' && (
            <div className="crumbs">
              <button
                className={`crumbs__link${section ? '' : ' is-current'}`}
                onClick={() => goto('admin', null)}
                disabled={!section}
              >
                Categories
              </button>
              {activeSection && (
                <>
                  <span className="crumbs__sep" aria-hidden="true">
                    /
                  </span>
                  <span className="crumbs__link is-current">{activeSection.label}</span>
                </>
              )}
              {me && (
                <span className="crumbs__who">
                  Signed in as <strong>{me.post}</strong> — {me.name}
                </span>
              )}
            </div>
          )}

          <p className="tabs__blurb">
            {tab === 'company' ? COMPANY_BLURB : (activeSection?.blurb ?? 'Choose a category.')}
          </p>

          {/* Admin landing: one card per category */}
          {tab === 'admin' && !section ? (
            <div className="doc-grid">
              {ADMIN_CATEGORIES.map((cat) => {
                const inCat = documentsInSection(cat.id)
                const signedCount = inCat.filter((d) => stored[d.id]).length
                return (
                  <article className="doc-card cat-card" key={cat.id}>
                    <div className="doc-card__top">
                      <span className="doc-card__icon" aria-hidden="true">
                        {cat.icon}
                      </span>
                      <div className="doc-card__titles">
                        <h2 className="doc-card__title">{cat.label}</h2>
                        <p className="doc-card__title-ta">
                          {inCat.length} document{inCat.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <p className="doc-card__summary">{cat.blurb}</p>

                    <div className="doc-card__meta">
                      <span className="chip chip--edit">Editable · e-sign</span>
                      {signedCount > 0 && (
                        <span className="chip chip--done">✍ {signedCount} in progress</span>
                      )}
                    </div>

                    <div className="doc-card__actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => goto('admin', cat.id)}
                        disabled={inCat.length === 0}
                      >
                        {inCat.length === 0 ? 'Coming soon' : 'Open'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="doc-grid">
              {docs.map((doc) => (
                <article className="doc-card" key={doc.id}>
                  <div className="doc-card__top">
                    <span
                      className={`doc-card__icon${doc.kind === 'edit' ? ' doc-card__icon--edit' : ''}`}
                      aria-hidden="true"
                    >
                      {doc.kind === 'edit' ? '✎' : '📄'}
                    </span>
                    <div className="doc-card__titles">
                      <h2 className="doc-card__title">{doc.titleEn}</h2>
                      <p className="doc-card__title-ta">{doc.titleTa}</p>
                    </div>
                  </div>

                  <p className="doc-card__summary">{doc.summaryTa}</p>

                  <div className="doc-card__meta">
                    <span className={`chip chip--${doc.hasForm || doc.kind === 'edit' ? 'edit' : 'view'}`}>
                      {doc.kind === 'edit'
                        ? 'Editable form'
                        : doc.hasForm
                          ? 'Editable · e-sign'
                          : 'Read-only'}
                    </span>
                    <span className="chip">{doc.category}</span>
                    {stored[doc.id] && (
                      <span
                        className={`chip${
                          stored[doc.id].signedCount >= stored[doc.id].totalSlots
                            ? ' chip--done'
                            : ''
                        }`}
                      >
                        ✍ {stored[doc.id].signedCount} / {stored[doc.id].totalSlots}
                      </span>
                    )}
                    {doc.pages && <span className="doc-card__pages">{doc.pages} pages</span>}
                  </div>

                  <div className="doc-card__actions">
                    <button className="btn btn--primary btn--sm" onClick={() => openDoc(doc)}>
                      {doc.kind === 'edit' ? 'Fill in' : 'Open'}
                    </button>
                    {/* A prose contract is read in the viewer and filled in a
                        separate particulars form, so it offers both. */}
                    {doc.hasForm && doc.kind !== 'edit' && (
                      <button
                        className="btn btn--sm"
                        onClick={() => navigate(`/portal/edit/${doc.id}`)}
                      >
                        ✎ Fill in
                      </button>
                    )}
                    <a className="btn btn--sm" href={asset(doc.file)} download={doc.originalName}>
                      ⬇ Original
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
