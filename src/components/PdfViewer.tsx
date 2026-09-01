/**
 * In-app PDF viewer built on pdf.js via react-pdf, with the e-sign workflow
 * attached for documents that have signature slots.
 *
 * The worker is bundled from the local `pdfjs-dist` package rather than a CDN
 * so the site stays a self-contained static build.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { DocumentMeta } from '../data/documents'
import { asset } from '../lib/asset'
import { getLayout } from '../lib/signatureSlots'
import { DocCrumbs, listPathFor } from './DocCrumbs'
import { getCurrent } from '../lib/documentStore'
import { toPdfBlob } from '../lib/signPdf'
import { SignPanel } from './SignPanel'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

interface Props {
  meta: DocumentMeta
}

export function PdfViewer({ meta }: Props) {
  const navigate = useNavigate()
  const [numPages, setNumPages] = useState(meta.pages ?? 0)
  const [page, setPage] = useState(1)
  const [zoomIdx, setZoomIdx] = useState(2)
  const [fitWidth, setFitWidth] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [signMode, setSignMode] = useState(false)
  /**
   * Signed document held as a blob: URL rather than raw bytes. react-pdf hands
   * a `data` array to the pdf.js worker, which *transfers* (detaches) the
   * buffer — so re-using the same array on any later load throws
   * "ArrayBuffer is already detached". A URL string is a stable primitive that
   * pdf.js re-fetches on every load, which sidesteps that entirely.
   */
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  /** Progress label for the stored version, e.g. "3 / 5 signed". */
  const [storedLabel, setStoredLabel] = useState<string | null>(null)

  const stageRef = useRef<HTMLDivElement>(null)
  const url = asset(meta.file)
  const layout = getLayout(meta.id)

  useEffect(() => {
    setPage(1)
    setLoadError(null)
    setNumPages(meta.pages ?? 0)
    setSignedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setStoredLabel(null)
    setSignMode(false)
  }, [meta.id, meta.pages])

  // Release the last blob URL when leaving the viewer.
  useEffect(
    () => () => {
      setSignedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    },
    [],
  )

  /**
   * If this browser holds a signed version of the document, show that instead
   * of the bundled original — signing "replaces" the document for whoever did
   * it, and that must survive a reload.
   */
  useEffect(() => {
    let alive = true
    void getCurrent(meta.id).then((stored) => {
      if (!alive || !stored) return
      const url = URL.createObjectURL(toPdfBlob(new Uint8Array(stored.bytes)))
      setSignedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setStoredLabel(`${stored.signedCount} / ${stored.totalSlots} signed`)
    })
    return () => {
      alive = false
    }
  }, [meta.id])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => setFitWidth(stage.clientWidth - 40)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [signMode])

  const go = useCallback(
    (delta: number) => setPage((p) => Math.min(Math.max(1, p + delta), numPages || 1)),
    [numPages],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const fileProp = signedUrl ?? url

  const enterSignMode = () => {
    setSignMode(true)
    if (layout) setPage(layout.pageIndex + 1)
  }

  const onSignedDocument = useCallback(
    (bytes: Uint8Array | null) => {
      setSignedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return bytes ? URL.createObjectURL(toPdfBlob(bytes)) : null
      })
      if (!bytes) setStoredLabel(null)
      else void getCurrent(meta.id).then((s) => s && setStoredLabel(`${s.signedCount} / ${s.totalSlots} signed`))
      if (layout) setPage(layout.pageIndex + 1)
    },
    [layout, meta.id],
  )

  const zoom = ZOOM_STEPS[zoomIdx]
  const maxPageWidth = signMode ? 640 : 900
  const pageWidth = zoomIdx === 2 && fitWidth ? Math.min(fitWidth, maxPageWidth) : undefined

  const viewer = (
    <div className="pdf-stage" ref={stageRef}>
      {loadError ? (
        <div className="state state--error">
          Could not load the document: {loadError}
          <br />
          <a href={url} target="_blank" rel="noreferrer">
            Try opening it in a new tab
          </a>
        </div>
      ) : (
        <Document
          file={fileProp}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={(e) => setLoadError(e.message)}
          loading={<div className="state">Loading…</div>}
          error={<div className="state state--error">Failed to load.</div>}
        >
          <Page
            pageNumber={page}
            width={pageWidth}
            scale={pageWidth ? undefined : zoom}
            renderTextLayer
            renderAnnotationLayer
            loading={<div className="state">Rendering page…</div>}
          />
        </Document>
      )}
    </div>
  )

  return (
    <>
      <DocCrumbs meta={meta} />

      <div className="viewer-bar">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(listPathFor(meta))}>
          ← Back
        </button>
        <span className="viewer-bar__title">
          {meta.titleTa}
          {signedUrl && (
            <span className="chip chip--done" style={{ marginLeft: 8 }}>
              {storedLabel ?? 'Signed'}
            </span>
          )}
        </span>

        <button className="btn btn--sm" onClick={() => go(-1)} disabled={page <= 1}>
          ‹
        </button>
        <span className="viewer-bar__pages">
          {page} / {numPages || '–'}
        </span>
        <button className="btn btn--sm" onClick={() => go(1)} disabled={page >= numPages}>
          ›
        </button>

        <button
          className="btn btn--sm"
          onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
          disabled={zoomIdx === 0}
        >
          −
        </button>
        <span className="viewer-bar__pages">{Math.round(zoom * 100)}%</span>
        <button
          className="btn btn--sm"
          onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
          disabled={zoomIdx === ZOOM_STEPS.length - 1}
        >
          +
        </button>

        {layout &&
          (signMode ? (
            <button className="btn btn--sm" onClick={() => setSignMode(false)}>
              ✕ Close signing panel
            </button>
          ) : (
            <button className="btn btn--sm btn--primary" onClick={enterSignMode}>
              ✍ e-Sign
            </button>
          ))}

        <a className="btn btn--sm" href={url} target="_blank" rel="noreferrer">
          ↗ New tab
        </a>
        <a className="btn btn--sm" href={url} download={meta.originalName}>
          ⬇ Original
        </a>
      </div>

      {signMode && layout ? (
        <div className="editor">
          <SignPanel meta={meta} layout={layout} onDocumentChange={onSignedDocument} />
          {viewer}
        </div>
      ) : (
        viewer
      )}
    </>
  )
}
