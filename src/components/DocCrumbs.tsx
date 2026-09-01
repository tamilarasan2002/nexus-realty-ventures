/**
 * Breadcrumb trail for an open document.
 *
 * The list's tab and category live in the URL, so this links straight back to
 * the category the document was opened from instead of dropping the reader on
 * the default tab.
 */
import { Link } from 'react-router-dom'
import { ADMIN_CATEGORIES } from '../data/documents'
import type { DocumentMeta } from '../data/documents'

/** The list URL that shows this document's own tab and category. */
export function listPathFor(meta: DocumentMeta): string {
  const params = new URLSearchParams({ tab: meta.group })
  if (meta.group === 'admin' && meta.section) params.set('section', meta.section)
  return `/portal/documents?${params.toString()}`
}

interface Props {
  meta: DocumentMeta
  /** Appended after the document title, e.g. "Fill in". */
  action?: string
}

export function DocCrumbs({ meta, action }: Props) {
  const category =
    meta.group === 'admin' && meta.section
      ? ADMIN_CATEGORIES.find((c) => c.id === meta.section)
      : null

  return (
    <nav className="doccrumbs" aria-label="Breadcrumb">
      <Link to={`/portal/documents?tab=${meta.group}`}>
        {meta.group === 'admin' ? 'Admin documents' : 'Company documents'}
      </Link>
      {category && (
        <>
          <span className="doccrumbs__sep" aria-hidden="true">
            /
          </span>
          <Link to={listPathFor(meta)}>{category.label}</Link>
        </>
      )}
      <span className="doccrumbs__sep" aria-hidden="true">
        /
      </span>
      <span className="doccrumbs__current">{meta.titleEn}</span>
      {action && (
        <>
          <span className="doccrumbs__sep" aria-hidden="true">
            /
          </span>
          <span className="doccrumbs__current">{action}</span>
        </>
      )}
    </nav>
  )
}
