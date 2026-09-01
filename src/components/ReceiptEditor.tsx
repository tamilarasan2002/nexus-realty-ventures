/**
 * Receipt editor: form on the left, live document preview on the right.
 *
 * Everything runs in the browser — the form state is the only source of
 * truth, the preview is the exact element that gets exported, and drafts are
 * kept in localStorage so a refresh does not lose typing.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RECEIPT_DEFAULTS, RECEIPT_FIELDS, RECEIPT_SIGNATORY } from '../lib/receiptSchema'
import type { ReceiptData, ReceiptField, ReceiptKey } from '../lib/receiptSchema'
import { deriveReceipt, validateReceipt } from '../lib/receiptDerive'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage'
import { exportElementToPdf, printElement } from '../lib/exportPdf'
import { ReceiptDocument } from './ReceiptDocument'
import { DocCrumbs, listPathFor } from './DocCrumbs'
import type { SignatureEntry } from './FormDocument'
import { SignaturePad } from './SignaturePad'
import { MEMBERS } from '../data/members'
import { getMemberId } from '../lib/session'
import type { DocumentMeta } from '../data/documents'
import { asset } from '../lib/asset'

const DRAFT_KEY = 'investment-receipt'
/** Fixed page size of the replica, in CSS px (8.5 x 11in @ 96dpi). */
const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface Props {
  meta: DocumentMeta
}

export function ReceiptEditor({ meta }: Props) {
  const navigate = useNavigate()
  const [data, setData] = useState<ReceiptData>(() => loadDraft(DRAFT_KEY, RECEIPT_DEFAULTS))
  const [signature, setSignature] = useState<SignatureEntry | undefined>(
    () => loadDraft<{ sig?: SignatureEntry }>(`${DRAFT_KEY}:sig`, {}).sig,
  )
  const [signing, setSigning] = useState(false)
  const [pendingInk, setPendingInk] = useState<string | null>(null)
  const [signerName, setSignerName] = useState('')
  const [signDate, setSignDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    saveDraft(DRAFT_KEY, data)
  }, [data])

  useEffect(() => {
    saveDraft(`${DRAFT_KEY}:sig`, { sig: signature })
  }, [signature])

  // Fit the fixed-width page into whatever space the preview panel has.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => {
      const available = stage.clientWidth - 36 // stage padding
      setScale(Math.min(1, available / PAGE_WIDTH))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  const display = useMemo(() => deriveReceipt(data), [data])
  const issues = useMemo(() => validateReceipt(data), [data])
  const issueFor = useCallback(
    (key: ReceiptKey) => issues.find((i) => i.key === key),
    [issues],
  )
  const blocking = issues.filter((i) => i.level === 'error')

  const set = (key: ReceiptKey, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const filename = `${data.receiptNo.trim() || 'investment-receipt'}.pdf`

  const handleDownload = async () => {
    const el = pageRef.current
    if (!el) return
    setBusy(true)
    setError(null)
    try {
      await exportElementToPdf(el, { filename })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate the PDF.')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = () => {
    clearDraft(DRAFT_KEY)
    clearDraft(`${DRAFT_KEY}:sig`)
    setData(RECEIPT_DEFAULTS)
    setSignature(undefined)
    setSigning(false)
    setPendingInk(null)
  }

  const me = MEMBERS.find((m) => m.id === getMemberId()) ?? null
  // The template names one signatory: the CFO.
  const maySign = !!me && RECEIPT_SIGNATORY.memberIds.includes(me.id as 'cfo')

  return (
    <>
      <DocCrumbs meta={meta} action="Fill in" />

      <div className="viewer-bar" data-export-ignore>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(listPathFor(meta))}>
          ← Back
        </button>
        <span className="viewer-bar__title">{meta.titleTa}</span>
        <a className="btn btn--sm" href={asset(meta.file)} download={meta.originalName}>
          ⬇ Original .docx
        </a>
      </div>

      <div className="editor">
        <section className="panel">
          <div className="panel__head">
            <h2>Receipt details</h2>
          </div>
          <div className="panel__body">
            {issues.length > 0 && (
              <div className="alerts">
                {issues.map((i) => (
                  <div key={i.key + i.message} className={`alert alert--${i.level}`}>
                    {i.message}
                  </div>
                ))}
              </div>
            )}

            <div className="form-section">
              <p className="form-section__title">Header details</p>
              {RECEIPT_FIELDS.filter((f) => f.table === 'header').map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={data[f.key]}
                  derived={display[f.key]}
                  issue={issueFor(f.key)}
                  onChange={set}
                />
              ))}
            </div>

            <div className="form-section">
              <p className="form-section__title">Transaction details</p>
              {RECEIPT_FIELDS.filter((f) => f.table === 'body').map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={data[f.key]}
                  derived={display[f.key]}
                  issue={issueFor(f.key)}
                  onChange={set}
                />
              ))}
            </div>

            <div className="form-section">
              <p className="form-section__title">e-Signature</p>

              <ol className="slotlist">
                <li className={`slot${signature ? ' slot--signed' : ''}${signing ? ' slot--active' : ''}`}>
                  <span className="slot__icon">{signature ? '✓' : '1'}</span>
                  <span className="slot__role">{RECEIPT_SIGNATORY.label}</span>
                  {signature ? (
                    <span className="slot__meta">
                      {signature.name}
                      {maySign ? (
                        <button
                          className="btn btn--sm btn--ghost"
                          style={{ marginLeft: 8 }}
                          onClick={() => setSignature(undefined)}
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="slot__meta--locked"> · signed, locked to you</span>
                      )}
                    </span>
                  ) : maySign ? (
                    <button
                      className={`btn btn--sm${signing ? ' btn--primary' : ''}`}
                      onClick={() => {
                        setSigning(!signing)
                        setPendingInk(null)
                        setSignerName(me?.name ?? '')
                      }}
                    >
                      {signing ? 'Signing…' : 'Sign here'}
                    </button>
                  ) : (
                    <span className="slot__meta slot__meta--locked">🔒 Only the CFO may sign</span>
                  )}
                </li>
              </ol>

              {signing && (
                <>
                  <div className="field">
                    <label className="field__label">Name</label>
                    <input
                      className="input"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Date</label>
                    <input
                      className="input"
                      type="date"
                      value={signDate}
                      onChange={(e) => setSignDate(e.target.value)}
                    />
                  </div>
                  <SignaturePad onChange={setPendingInk} />
                  <button
                    className="btn btn--primary"
                    style={{ marginTop: 12 }}
                    disabled={!pendingInk || !signerName.trim()}
                    onClick={() => {
                      if (!pendingInk) return
                      setSignature({ png: pendingInk, name: signerName.trim(), dateISO: signDate })
                      setSigning(false)
                      setPendingInk(null)
                    }}
                  >
                    ✍ Apply signature
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="editor__actions">
            <button
              className="btn btn--primary"
              onClick={handleDownload}
              disabled={busy || blocking.length > 0}
              title={
                blocking.length > 0 ? 'Fill the required fields first' : 'Download as PDF'
              }
            >
              {busy ? 'Generating…' : '⬇ Download PDF'}
            </button>
            <button className="btn" onClick={printElement} disabled={busy}>
              🖨 Print / Save as PDF
            </button>
            <button className="btn btn--ghost" onClick={handleReset} disabled={busy}>
              Reset
            </button>
            {error && <span className="field__msg field__msg--error">{error}</span>}
          </div>
        </section>

        <section className="panel">
          <div className="panel__head" data-export-ignore>
            <h2>Live preview</h2>
            <span className="topbar__spacer" />
            <span className="topbar__badge">Letter · 8.5 × 11 in</span>
          </div>
          <div className="preview-stage" ref={stageRef}>
            <div
              className="preview-scaler"
              style={{
                transform: `scale(${scale})`,
                width: PAGE_WIDTH * scale,
                height: PAGE_HEIGHT * scale,
              }}
            >
              <ReceiptDocument display={display} signature={signature} innerRef={pageRef} />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- */

interface FieldProps {
  field: ReceiptField
  value: string
  derived: string
  issue?: { message: string; level: 'error' | 'warning' }
  onChange: (key: ReceiptKey, value: string) => void
}

function Field({ field, value, derived, issue, onChange }: FieldProps) {
  const { key, label, mode, input, options, hint } = field

  const control = (() => {
    if (mode === 'derived') {
      return (
        <input className="input input--derived input--amount" value={derived} readOnly tabIndex={-1} />
      )
    }
    if (mode === 'locked') {
      return <input className="input input--readonly" value={value} readOnly tabIndex={-1} />
    }
    if (input === 'select' && options) {
      const known = options.includes(value)
      return (
        <select
          className="select"
          value={known ? value : '__custom'}
          onChange={(e) => onChange(key, e.target.value === '__custom' ? '' : e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value="__custom">Other…</option>
        </select>
      )
    }
    if (input === 'date') {
      return (
        <input
          className="input"
          type="date"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      )
    }
    if (input === 'amount') {
      return (
        <input
          className={`input input--amount${issue?.level === 'error' ? ' input--invalid' : ''}`}
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      )
    }
    return (
      <input
        className={`input${issue?.level === 'error' ? ' input--invalid' : ''}`}
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
      />
    )
  })()

  return (
    <div className="field">
      <label className="field__label">
        {label}
        {mode === 'locked' && <span className="field__lock">🔒 Fixed</span>}
        {mode === 'derived' && <span className="field__lock">∑ Auto</span>}
      </label>
      {control}
      {mode === 'edit' && input === 'amount' && derived && (
        <div className="field__hint">{derived}</div>
      )}
      {hint && <div className="field__hint">{hint}</div>}
      {issue && <div className={`field__msg field__msg--${issue.level}`}>{issue.message}</div>}
    </div>
  )
}
