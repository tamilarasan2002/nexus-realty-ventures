/**
 * Editor for any management form: inputs on the left, live page preview on the
 * right, e-signature for the posts the template names, PDF download.
 *
 * Signing eligibility comes straight from the template. A signature pad is
 * offered only where the signed-in member's post appears in that line's
 * `memberIds`, so nobody can e-sign a line their form does not name them on.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DocumentMeta } from '../data/documents'
import { MEMBERS } from '../data/members'
import { getMemberId } from '../lib/session'
import {
  initialTables,
  initialValues,
  resolveValues,
  tablesOf,
} from '../lib/formSchema'
import type { FormDefinition, FormTables, FormValues } from '../lib/formSchema'
import { exportElementToPdf, printElement } from '../lib/exportPdf'
import { loadDraft, saveDraft, clearDraft } from '../lib/storage'
import { FormDocument, SHEET_GAP, SHEET_H } from './FormDocument'
import { DocCrumbs, listPathFor } from './DocCrumbs'
import type { SignatureEntry } from './FormDocument'
import { SignaturePad } from './SignaturePad'

const PAGE_WIDTH = 816

interface Props {
  meta: DocumentMeta
  def: FormDefinition
}

interface Draft {
  values: FormValues
  tables: FormTables
  signatures: Record<number, SignatureEntry>
}

export function FormEditor({ meta, def }: Props) {
  const navigate = useNavigate()
  const draftKey = `form:${def.id}`

  const blank = useMemo<Draft>(
    () => ({ values: initialValues(def), tables: initialTables(def), signatures: {} }),
    [def],
  )
  const [draft, setDraft] = useState<Draft>(() => loadDraft(draftKey, blank))
  const [signingIndex, setSigningIndex] = useState<number | null>(null)
  const [pendingInk, setPendingInk] = useState<string | null>(null)
  const [signerName, setSignerName] = useState('')
  const [signDate, setSignDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  /** Sheets in the document, reported by the renderer after it paginates. */
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    saveDraft(draftKey, draft)
  }, [draftKey, draft])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => setScale(Math.min(1, (stage.clientWidth - 36) / PAGE_WIDTH))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  const me = MEMBERS.find((m) => m.id === getMemberId()) ?? null
  const resolved = useMemo(() => resolveValues(def, draft.values), [def, draft.values])

  const setValue = (key: string, v: string) =>
    setDraft((d) => ({ ...d, values: { ...d.values, [key]: v } }))

  const setCell = (tableKey: string, row: number, col: string, v: string) =>
    setDraft((d) => {
      const rows = [...(d.tables[tableKey] ?? [])]
      rows[row] = { ...rows[row], [col]: v }
      return { ...d, tables: { ...d.tables, [tableKey]: rows } }
    })

  const removeRow = (tableKey: string, row: number) =>
    setDraft((d) => {
      const rows = [...(d.tables[tableKey] ?? [])]
      rows.splice(row, 1)
      return { ...d, tables: { ...d.tables, [tableKey]: rows } }
    })

  const addRow = (tableKey: string) =>
    setDraft((d) => {
      const t = tablesOf(def).find((x) => x.key === tableKey)
      if (!t) return d
      const empty = Object.fromEntries(t.columns.map((c) => [c.key, '']))
      return { ...d, tables: { ...d.tables, [tableKey]: [...(d.tables[tableKey] ?? []), empty] } }
    })

  /** Does this line name the signed-in member? */
  const isNamedOn = useCallback(
    (index: number) => (me ? (def.signatories[index]?.memberIds.includes(me.id) ?? false) : false),
    [def.signatories, me],
  )

  /**
   * These templates are signed in order — the CFO prepares and the CEO/COO
   * then authorises or confirms. So a line stays closed until every line above
   * it is signed; this returns the caption of the first line still waiting.
   */
  const blockedBy = useCallback(
    (index: number): string | null => {
      for (let i = 0; i < index; i += 1) {
        // Lines signed off-portal cannot gate the chain, or nobody after an
        // investor or contractor line could ever sign.
        if (def.signatories[i].memberIds.length === 0) continue
        if (!draft.signatures[i]) return def.signatories[i].label
      }
      return null
    },
    [def.signatories, draft.signatures],
  )

  const canSign = useCallback(
    (index: number) => isNamedOn(index) && blockedBy(index) === null,
    [isNamedOn, blockedBy],
  )

  // If the open line stops being signable (a signature above it was removed),
  // close the pad rather than leaving a form that cannot be submitted.
  useEffect(() => {
    if (signingIndex !== null && !canSign(signingIndex)) {
      setSigningIndex(null)
      setPendingInk(null)
    }
  }, [signingIndex, canSign])

  /**
   * A signature can only be withdrawn while nothing below it is signed —
   * otherwise the chain would claim a later approval of an unsigned document.
   */
  const laterSigned = useCallback(
    (index: number): string | null => {
      for (let i = index + 1; i < def.signatories.length; i += 1) {
        if (draft.signatures[i]) return def.signatories[i].label
      }
      return null
    },
    [def.signatories, draft.signatures],
  )

  const applySignature = () => {
    if (signingIndex === null || !pendingInk || !signerName.trim()) return
    setDraft((d) => ({
      ...d,
      signatures: {
        ...d.signatures,
        [signingIndex]: { png: pendingInk, name: signerName.trim(), dateISO: signDate },
      },
    }))
    setSigningIndex(null)
    setPendingInk(null)
  }

  const removeSignature = (index: number) =>
    setDraft((d) => {
      const next = { ...d.signatures }
      delete next[index]
      return { ...d, signatures: next }
    })

  const filename = `${def.id}-${resolved.projectCode || resolved.voucherNo || 'draft'}.pdf`
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')

  const download = async () => {
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

  return (
    <>
      <DocCrumbs meta={meta} action="Fill in" />

      <div className="viewer-bar" data-export-ignore>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(listPathFor(meta))}>
          ← Back
        </button>
        <span className="viewer-bar__title">{meta.titleEn}</span>
        <span className="chip">{def.sourcePages}</span>
      </div>

      <div className="editor">
        <section className="panel">
          <div className="panel__head">
            <h2>{def.titleEn.replace(/^\(|\)$/g, '')}</h2>
          </div>

          <div className="panel__body">
            {error && <div className="alert alert--error">{error}</div>}

            {def.blocks.map((block, bi) => {
              if (block.type === 'note') return null

              if (block.type === 'fields') {
                return (
                  <div className="form-section" key={`f${bi}`}>
                    <p className="form-section__title">{block.heading ?? 'Details'}</p>
                    {block.fields.map((f) => (
                      <div className="field" key={f.key}>
                        <label className="field__label">
                          {f.label}
                          {f.kind === 'derived' && <span className="field__lock">∑ Auto</span>}
                        </label>
                        {f.kind === 'derived' ? (
                          <input
                            className="input input--derived input--amount"
                            value={resolved[f.key] ?? ''}
                            readOnly
                            tabIndex={-1}
                          />
                        ) : f.kind === 'select' ? (
                          <select
                            className="select"
                            value={draft.values[f.key] ?? ''}
                            onChange={(e) => setValue(f.key, e.target.value)}
                          >
                            <option value="">Select…</option>
                            {(f.options ?? []).map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : f.kind === 'textarea' ? (
                          <textarea
                            className="input"
                            rows={3}
                            value={draft.values[f.key] ?? ''}
                            onChange={(e) => setValue(f.key, e.target.value)}
                          />
                        ) : (
                          <input
                            className={`input${f.kind === 'amount' ? ' input--amount' : ''}`}
                            type={f.kind === 'date' ? 'date' : 'text'}
                            inputMode={f.kind === 'amount' ? 'decimal' : undefined}
                            placeholder={f.kind === 'amount' ? '0' : undefined}
                            value={draft.values[f.key] ?? ''}
                            onChange={(e) => setValue(f.key, e.target.value)}
                          />
                        )}
                        {f.hint && <div className="field__hint">{f.hint}</div>}
                      </div>
                    ))}
                  </div>
                )
              }

              const t = block.table
              const rows = draft.tables[t.key] ?? []
              return (
                <div className="form-section" key={`t${bi}`}>
                  <p className="form-section__title">{block.heading ?? 'Rows'}</p>
                  <div className="rowedit">
                    {rows.map((row, ri) => (
                      <div className="rowedit__row" key={ri}>
                        <span className="rowedit__n">{ri + 1}</span>
                        <div className="rowedit__cells">
                          {t.columns.map((c) => (
                            <label className="rowedit__cell" key={c.key}>
                              <span>{c.label}</span>
                              {c.kind === 'select' ? (
                                <select
                                  className="select"
                                  value={row[c.key] ?? ''}
                                  onChange={(e) => setCell(t.key, ri, c.key, e.target.value)}
                                >
                                  <option value="">—</option>
                                  {(c.options ?? []).map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  className={`input${c.kind === 'amount' ? ' input--amount' : ''}`}
                                  type={c.kind === 'date' ? 'date' : 'text'}
                                  inputMode={c.kind === 'amount' ? 'decimal' : undefined}
                                  value={row[c.key] ?? ''}
                                  onChange={(e) => setCell(t.key, ri, c.key, e.target.value)}
                                />
                              )}
                            </label>
                          ))}
                        </div>
                        {rows.length > 1 && (
                          <button
                            className="rowedit__del"
                            aria-label={`Remove row ${ri + 1}`}
                            onClick={() => removeRow(t.key, ri)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn--sm" onClick={() => addRow(t.key)}>
                    + Add row
                  </button>
                </div>
              )
            })}

            {/* ---- e-signature ---- */}
            <div className="form-section">
              <p className="form-section__title">e-Signature</p>

              {def.signatories.length === 0 ? (
                <p className="field__hint">
                  This template prints no signature block, so there is nothing to e-sign.
                </p>
              ) : (
                <>
                  {def.signatories.length > 1 && (
                    <p className="field__hint" style={{ marginBottom: 10 }}>
                      Signed in order — each line opens once the one above it is signed.
                    </p>
                  )}
                <ol className="slotlist">
                  {def.signatories.map((sig, i) => {
                    const signed = draft.signatures[i]
                    const named = isNamedOn(i)
                    const waitingFor = blockedBy(i)
                    const blocker = laterSigned(i)
                    return (
                      <li
                        className={`slot${signed ? ' slot--signed' : ''}${
                          signingIndex === i ? ' slot--active' : ''
                        }`}
                        key={sig.label}
                      >
                        <span className="slot__icon">{signed ? '✓' : `${i + 1}`}</span>
                        <span className="slot__role">{sig.label}</span>

                        {signed ? (
                          <span className="slot__meta">
                            {signed.name}
                            {!named ? (
                              <span className="slot__meta--locked"> · signed, locked to you</span>
                            ) : blocker ? (
                              <span className="slot__meta--locked">
                                {' '}
                                · remove “{blocker}” first
                              </span>
                            ) : (
                              <button
                                className="btn btn--sm btn--ghost"
                                style={{ marginLeft: 8 }}
                                onClick={() => removeSignature(i)}
                              >
                                Remove
                              </button>
                            )}
                          </span>
                        ) : sig.memberIds.length === 0 ? (
                          // Contractor, investor or witness — not a portal user.
                          <span className="slot__meta slot__meta--locked">
                            ✍ Signed in person
                          </span>
                        ) : !named ? (
                          <span className="slot__meta slot__meta--locked">
                            🔒 Only {sig.memberIds.map((id) => postOf(id)).join(' or ')} may sign
                          </span>
                        ) : waitingFor ? (
                          <span className="slot__meta slot__meta--locked">
                            ⏳ Waiting for “{waitingFor}”
                          </span>
                        ) : (
                          <button
                            className={`btn btn--sm${signingIndex === i ? ' btn--primary' : ''}`}
                            onClick={() => {
                              setSigningIndex(signingIndex === i ? null : i)
                              setPendingInk(null)
                              setSignerName(me?.name ?? '')
                            }}
                          >
                            {signingIndex === i ? 'Signing…' : 'Sign here'}
                          </button>
                        )}
                      </li>
                    )
                  })}
                  </ol>
                </>
              )}

              {signingIndex !== null && (
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
                    onClick={applySignature}
                    disabled={!pendingInk || !signerName.trim()}
                  >
                    ✍ Apply signature
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="editor__actions">
            <button className="btn btn--primary" onClick={download} disabled={busy}>
              {busy ? 'Generating…' : '⬇ Download PDF'}
            </button>
            <button className="btn" onClick={printElement} disabled={busy}>
              🖨 Print / Save as PDF
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                clearDraft(draftKey)
                setDraft(blank)
                setSigningIndex(null)
              }}
              disabled={busy}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head" data-export-ignore>
            <h2>Live preview</h2>
            <span className="topbar__spacer" />
            <span className="topbar__badge">
              Letter · 8.5 × 11 in · {pageCount} page{pageCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="preview-stage" ref={stageRef}>
            <div
              className="preview-scaler"
              style={{
                transform: `scale(${scale})`,
                width: PAGE_WIDTH * scale,
                height: (SHEET_H * pageCount + SHEET_GAP * (pageCount - 1)) * scale,
              }}
            >
              <FormDocument
                def={def}
                values={resolved}
                tables={draft.tables}
                signatures={draft.signatures}
                innerRef={pageRef}
                onPageCount={setPageCount}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function postOf(id: string): string {
  return MEMBERS.find((m) => m.id === id)?.post ?? id
}
