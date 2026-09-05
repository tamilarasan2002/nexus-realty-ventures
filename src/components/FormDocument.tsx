/**
 * Paginating printable renderer for the management forms.
 *
 * The content is flattened into a list of flow items — headings, label/value
 * rows, table header/body/total rows, notes and the signature block — each of
 * which is measured once, then packed into fixed 816 x 1056 px sheets (US
 * Letter at 96 dpi). Adding rows therefore spills onto a second sheet rather
 * than stretching one long page, and a table that straddles a break repeats
 * its header on the next sheet.
 *
 * Each sheet carries `data-page`, which is what the PDF exporter rasterises —
 * one sheet, one PDF page, so no row is ever sliced in half.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { FormDefinition, FormTable, FormTables, FormValues } from '../lib/formSchema'
import { resolveTables } from '../lib/formSchema'
import { formatDate } from '../lib/receiptDerive'
import { formatRupees, parseAmount } from '../lib/amountWords'
import { asset } from '../lib/asset'
import { Letterhead } from './Letterhead'

export interface SignatureEntry {
  /** Trimmed ink as a PNG data URL. */
  png: string
  name: string
  dateISO: string
}

interface Props {
  def: FormDefinition
  values: FormValues
  tables: FormTables
  /** Signature index -> entry, for lines that have been signed. */
  signatures: Record<number, SignatureEntry>
  innerRef?: Ref<HTMLDivElement>
  /**
   * Called whenever the sheet count changes. The editor needs it to reserve
   * the right height for the scaled preview — reading the height back with a
   * ResizeObserver races the two-pass measure/layout and reports stale values.
   */
  onPageCount?: (pages: number) => void
}

/* ---------------- geometry ---------------- */

const PAGE_H = 1056
const PAD_TOP = 48
const PAD_BOTTOM = 67.2
/** Room the "Page n of m" line takes at the foot of every sheet. */
const FOOTER_H = 20
/** Gap between sheets in the preview; mirrored by .formdoc-book's row-gap. */
export const SHEET_GAP = 20
export const SHEET_H = PAGE_H

const usableHeight = PAGE_H - PAD_TOP - PAD_BOTTOM - FOOTER_H

/* ---------------- flow items ---------------- */

type Flow =
  | { kind: 'heading'; key: string; text: string }
  | { kind: 'note'; key: string; text: string }
  | { kind: 'fieldrow'; key: string; group: string; label: string; value: string }
  | { kind: 'gridhead'; key: string; group: string; table: FormTable }
  | { kind: 'gridrow'; key: string; group: string; table: FormTable; n: number; row: FormValues }
  | { kind: 'gridtotal'; key: string; group: string; table: FormTable; total: string }
  | { kind: 'signs'; key: string }

function display(kind: string, raw: string): string {
  if (!raw) return ''
  if (kind === 'date') return formatDate(raw)
  if (kind === 'amount') {
    const n = parseAmount(raw)
    return n === null ? raw : formatRupees(n)
  }
  return raw
}

function buildFlow(def: FormDefinition, values: FormValues, tables: FormTables): Flow[] {
  const out: Flow[] = []
  def.blocks.forEach((block, bi) => {
    if (block.type === 'note') {
      out.push({ kind: 'note', key: `n${bi}`, text: block.text })
      return
    }
    if (block.type === 'fields') {
      if (block.heading) out.push({ kind: 'heading', key: `h${bi}`, text: block.heading })
      block.fields.forEach((f) =>
        out.push({
          kind: 'fieldrow',
          key: `f${bi}-${f.key}`,
          group: `g${bi}`,
          label: f.label,
          value: display(f.kind, values[f.key] ?? ''),
        }),
      )
      return
    }
    const t = block.table
    if (block.heading) out.push({ kind: 'heading', key: `h${bi}`, text: block.heading })
    out.push({ kind: 'gridhead', key: `gh${bi}`, group: `t${bi}`, table: t })
    ;(tables[t.key] ?? []).forEach((row, ri) =>
      out.push({ kind: 'gridrow', key: `gr${bi}-${ri}`, group: `t${bi}`, table: t, n: ri + 1, row }),
    )
    if (t.totalOf) {
      out.push({
        kind: 'gridtotal',
        key: `gt${bi}`,
        group: `t${bi}`,
        table: t,
        total: totalFor(tables[t.key] ?? [], t.totalOf),
      })
    }
  })
  if (def.signatories.length > 0) out.push({ kind: 'signs', key: 'signs' })
  return out
}

/* ---------------- pagination ---------------- */

function paginate(items: Flow[], heights: Record<string, number>, firstPageOffset: number): Flow[][] {
  const pages: Flow[][] = []
  let page: Flow[] = []
  let used = firstPageOffset

  const flush = () => {
    if (page.length) pages.push(page)
    page = []
    used = 0
  }

  for (const item of items) {
    const h = heights[item.key] ?? 0

    if (used + h > usableHeight && page.length) {
      flush()
      // A table continuing onto a new sheet repeats its header there.
      if (item.kind === 'gridrow' || item.kind === 'gridtotal') {
        const head = items.find((i) => i.kind === 'gridhead' && i.group === item.group)
        if (head) {
          page.push(head)
          used += heights[head.key] ?? 0
        }
      }
    }
    page.push(item)
    used += h
  }
  flush()
  return pages.length ? pages : [[]]
}

/* ---------------- rendering ---------------- */

/** Groups consecutive same-group rows so they render inside one <table>. */
function renderRuns(items: Flow[]): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let i = 0
  while (i < items.length) {
    const item = items[i]

    if (item.kind === 'heading') {
      out.push(
        <p className="formdoc__heading" key={item.key}>
          {item.text}
        </p>,
      )
      i += 1
      continue
    }
    if (item.kind === 'note') {
      out.push(
        <p className="receipt__disclaimer" key={item.key}>
          {item.text}
        </p>,
      )
      i += 1
      continue
    }
    if (item.kind === 'signs') {
      out.push(<SignBlockPlaceholder key={item.key} />)
      i += 1
      continue
    }

    if (item.kind === 'fieldrow') {
      const run: Flow[] = []
      // Indexing an array does not narrow the union, so bind then test.
      for (;;) {
        const nxt = items[i]
        if (!nxt || nxt.kind !== 'fieldrow' || nxt.group !== item.group) break
        run.push(nxt)
        i += 1
      }
      out.push(
        <table className="receipt-table" key={`run-${item.key}`}>
          <colgroup>
            <col className="label" />
            <col className="value" />
          </colgroup>
          <tbody>
            {run.map((r) =>
              r.kind === 'fieldrow' ? (
                <tr key={r.key}>
                  <th scope="row">{r.label}</th>
                  <td className={r.value ? undefined : 'is-empty'}>{r.value}</td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>,
      )
      continue
    }

    // grid head / rows / total
    const table = item.table
    const run: Flow[] = []
    for (;;) {
      const nxt = items[i]
      if (!nxt) break
      if (nxt.kind !== 'gridhead' && nxt.kind !== 'gridrow' && nxt.kind !== 'gridtotal') break
      if (nxt.group !== item.group) break
      run.push(nxt)
      i += 1
    }
    out.push(
      <table className="receipt-table formdoc__grid" key={`grid-${item.key}`}>
        <colgroup>
          <col style={{ width: '7%' }} />
          {table.columns.map((c) => (
            <col key={c.key} style={{ width: `${c.width ?? 93 / table.columns.length}%` }} />
          ))}
        </colgroup>
        {run.some((r) => r.kind === 'gridhead') && (
          <thead>
            <tr>
              <th>வ.எண்</th>
              {table.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {run.map((r) => {
            if (r.kind === 'gridrow') {
              return (
                <tr key={r.key}>
                  <td className="formdoc__num">{r.n}</td>
                  {table.columns.map((c) => {
                    const v = display(c.kind, r.row[c.key] ?? '')
                    return (
                      <td key={c.key} className={v ? undefined : 'is-empty'}>
                        {v}
                      </td>
                    )
                  })}
                </tr>
              )
            }
            if (r.kind === 'gridtotal') {
              return (
                <tr className="formdoc__total" key={r.key}>
                  <td />
                  {table.columns.map((c, ci) => (
                    <td key={c.key}>
                      {ci === 0
                        ? (table.totalLabel ?? 'மொத்தம்')
                        : c.key === table.totalOf
                          ? r.total
                          : ''}
                    </td>
                  ))}
                </tr>
              )
            }
            return null
          })}
        </tbody>
      </table>,
    )
  }
  return out
}

/** Stand-in used while measuring; the real block needs the signature data. */
function SignBlockPlaceholder() {
  return null
}

export function FormDocument({ def, values, tables, signatures, innerRef, onPageCount }: Props) {
  // Resolved here as well as in the editor, so a saved draft rendered straight
  // to PDF gets the same computed cells the editor showed.
  const rows = useMemo(() => resolveTables(def, tables), [def, tables])
  const items = useMemo(() => buildFlow(def, values, rows), [def, values, rows])
  const [heights, setHeights] = useState<Record<string, number> | null>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const [headH, setHeadH] = useState(0)

  // Signature block height depends on whether anything is signed.
  const signKey = Object.keys(signatures).sort().join(',')

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const next: Record<string, number> = {}
    el.querySelectorAll<HTMLElement>('[data-flow]').forEach((n) => {
      next[n.dataset.flow!] = n.offsetHeight
    })
    setHeights(next)
    if (headRef.current) setHeadH(headRef.current.offsetHeight)
  }, [items, signKey])

  const measured = heights !== null
  const pages = measured ? paginate(items, heights, headH) : [items]
  const total = pages.length

  /*
   * Report only once the flow has actually been measured. Until then the
   * single fallback sheet holds every item and overflows its box, so the
   * editor must not offer an export of it.
   */
  useLayoutEffect(() => {
    onPageCount?.(measured ? total : 0)
  }, [measured, total, onPageCount])

  return (
    <div className="formdoc-book" ref={innerRef} data-print-root>
      {/* Off-screen measuring pass — one node per flow item, at page width. */}
      <div className="formdoc-measure" ref={measureRef} aria-hidden="true">
        <div className="receipt formdoc formdoc--measure">
          <div ref={headRef}>
            <DocHead def={def} />
          </div>
          {items.map((item) => (
            <div data-flow={item.key} key={item.key}>
              {item.kind === 'signs' ? (
                <SignBlock def={def} signatures={signatures} />
              ) : (
                renderRuns([item])
              )}
            </div>
          ))}
        </div>
      </div>

      {pages.map((pageItems, pi) => (
        <div
          className="receipt formdoc"
          /* Only a settled sheet is exportable — see onPageCount above. */
          {...(measured ? { 'data-page': pi + 1 } : {})}
          key={pi}
        >
          {pi === 0 ? (
            <DocHead def={def} />
          ) : (
            <p className="formdoc__runhead">
              {def.titleTa} <span>{def.titleEn}</span>
            </p>
          )}

          {renderRuns(pageItems.filter((it) => it.kind !== 'signs'))}
          {pageItems.some((it) => it.kind === 'signs') && (
            <SignBlock def={def} signatures={signatures} />
          )}

          <div className="receipt__spacer" />

          {/* The seal belongs on the sheet that carries the signatures. */}
          {def.signatories.length > 0 && pi === total - 1 && (
            <img className="doc-seal" src={asset('assets/company-seal.png')} alt="Company seal" />
          )}

          <p className="formdoc__pagefoot">
            Page {pi + 1} of {total}
          </p>
        </div>
      ))}
    </div>
  )
}

/** First-sheet masthead: the company letterhead plus the document's title. */
function DocHead({ def }: { def: FormDefinition }) {
  return (
    <>
      <Letterhead />
      <p className="receipt__title">{def.titleTa}</p>
      <p className="receipt__title-en">{def.titleEn}</p>
    </>
  )
}

function SignBlock({
  def,
  signatures,
}: {
  def: FormDefinition
  signatures: Record<number, SignatureEntry>
}) {
  return (
    <div className="formdoc__signs">
      {def.signatories.map((sig, i) => {
        const entry = signatures[i]
        return (
          <div className="formdoc__sign" key={sig.label}>
            <div className="formdoc__signink">{entry && <img src={entry.png} alt="" />}</div>
            <div className="formdoc__signrule" />
            <p className="formdoc__signlabel">{sig.label}</p>
            <p className="formdoc__signname">
              பெயர் &amp; தேதி: {entry ? `${entry.name} & ${formatDate(entry.dateISO)}` : ''}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function totalFor(rows: FormValues[], key: string): string {
  let sum = 0
  let any = false
  for (const r of rows) {
    const cleaned = (r[key] ?? '').replace(/[₹,\s]/g, '').replace(/\/-?$/, '')
    if (!cleaned) continue
    const n = Number(cleaned)
    if (Number.isFinite(n)) {
      sum += n
      any = true
    }
  }
  if (!any) return '₹ '
  const [int] = Math.abs(sum).toFixed(2).split('.')
  const last3 = int.slice(-3)
  const rest = int.slice(0, -3)
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3
  return `₹ ${grouped}/-`
}
