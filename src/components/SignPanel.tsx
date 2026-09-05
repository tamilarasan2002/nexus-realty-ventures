/**
 * Sequential signing workflow — entirely client-side.
 *
 * The five board members sign one after another, each on the current
 * version of the file. Signing does three things at once: it stamps the PDF,
 * downloads it, and replaces the app's stored current version so the next
 * signer opens the already-signed document rather than the blank original.
 *
 * The pristine file in `public/documents/` is never modified and can be
 * restored at any time.
 */
import { useCallback, useEffect, useState } from 'react'
import type { DocumentMeta } from '../data/documents'
import { MEMBERS } from '../data/members'
import { getMemberId } from '../lib/session'
import type { Member } from '../data/members'
import type { SignatureLayout } from '../lib/signatureSlots'
import { prependLetterhead } from '../lib/coverSheet'
import { applySignature, downloadPdf, readSignatures } from '../lib/signPdf'
import type { SignatureRecord } from '../lib/signPdf'
import { clearCurrent, getCurrent, putCurrent } from '../lib/documentStore'
import { SignaturePad } from './SignaturePad'
import { formatDate } from '../lib/receiptDerive'
import { asset } from '../lib/asset'

type Source = 'original' | 'stored' | 'uploaded'

interface Props {
  meta: DocumentMeta
  layout: SignatureLayout
  /** Lets the viewer re-render whenever the working document changes. */
  onDocumentChange: (bytes: Uint8Array | null) => void
}

const todayISO = () => new Date().toISOString().slice(0, 10)

/** A file waiting on confirmation because it would drop signatures. */
interface PendingUpload {
  buf: ArrayBuffer
  filename: string
  roster: SignatureRecord[]
  storedCount: number
}

export function SignPanel({ meta, layout, onDocumentChange }: Props) {
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null)
  const [source, setSource] = useState<Source>('original')
  const [sourceName, setSourceName] = useState(meta.originalName)
  const [roster, setRoster] = useState<SignatureRecord[]>([])
  const [nameOverride, setNameOverride] = useState('')
  const [dateISO, setDateISO] = useState(todayISO)
  const [inkPng, setInkPng] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justSigned, setJustSigned] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingUpload | null>(null)
  /** True when the browser refused to persist the replacement. */
  const [storeFailed, setStoreFailed] = useState(false)

  const adopt = useCallback(
    async (buf: ArrayBuffer, name: string, src: Source) => {
      setError(null)
      try {
        const found = await readSignatures(buf)
        setBytes(buf)
        setSourceName(name)
        setSource(src)
        setRoster(found)
        setPickedSlotId(null)
        setInkPng(null)
        setNameOverride('')
      } catch (e) {
        setError(e instanceof Error ? `Could not read the PDF: ${e.message}` : 'Could not read the PDF.')
      }
    },
    [],
  )

  // Prefer the stored current version; fall back to the bundled original.
  useEffect(() => {
    let alive = true
    ;(async () => {
      // getCurrent already swallows and times out its own failures, but keep
      // the fallback unconditional so a stored-version problem can never stop
      // the pristine original from loading.
      let stored: Awaited<ReturnType<typeof getCurrent>> = null
      try {
        stored = await getCurrent(meta.id)
      } catch {
        stored = null
      }
      if (!alive) return
      if (stored) {
        await adopt(stored.bytes.slice(0), stored.filename, 'stored')
        onDocumentChange(new Uint8Array(stored.bytes.slice(0)))
        return
      }
      try {
        const res = await fetch(asset(meta.file))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = await res.arrayBuffer()
        if (alive) await adopt(buf, meta.originalName, 'original')
      } catch (e) {
        if (alive) {
          setError(
            `Could not load the source document: ${e instanceof Error ? e.message : 'unknown error'}`,
          )
        }
      }
    })()
    return () => {
      alive = false
    }
    // onDocumentChange is stable (useCallback in the viewer).
  }, [meta.id, meta.file, meta.originalName, adopt, onDocumentChange])

  const complete = roster.length >= layout.slots.length

  /** The signed-in member; the admin gate guarantees one is present. */
  const me: Member | null = MEMBERS.find((m) => m.id === getMemberId()) ?? null
  const selectedMember: Member | null = me

  /**
   * A slot names the posts that may sign it. That list on the slot is the only
   * source of truth — there is no second member-to-slot mapping to fall out of
   * step with the documents.
   */
  const mayUse = (slot: (typeof layout.slots)[number]) =>
    !!selectedMember && (slot.memberIds ?? []).includes(selectedMember.id)

  const [pickedSlotId, setPickedSlotId] = useState<string | null>(null)
  const selectedSlot = layout.slots.find((s) => s.id === pickedSlotId) ?? null
  const selectedSlotId = selectedSlot?.id

  const effectiveName = (nameOverride || selectedMember?.name || '').trim()
  const canSign = !!bytes && !!selectedSlot && !!inkPng && effectiveName.length > 0

  /**
   * Persists a document as this browser's current version, so an uploaded file
   * survives a reload exactly like a freshly signed one — the app then serves
   * it wherever the original used to appear.
   */
  const store = useCallback(
    async (buf: ArrayBuffer, filename: string, rosterForFile: SignatureRecord[]) => {
      const ok = await putCurrent({
        docId: meta.id,
        bytes: buf.slice(0),
        signedSlots: rosterForFile.map((r) => r.slotId),
        signedCount: rosterForFile.length,
        totalSlots: layout.slots.length,
        filename,
        updatedAt: new Date().toISOString(),
      })
      setStoreFailed(!ok)
    },
    [meta.id, layout.slots.length],
  )

  const acceptUpload = useCallback(
    async (buf: ArrayBuffer, filename: string, incoming: SignatureRecord[]) => {
      await store(buf, filename, incoming)
      await adopt(buf.slice(0), filename, 'stored')
      onDocumentChange(new Uint8Array(buf.slice(0)))
      setJustSigned(null)
    },
    [store, adopt, onDocumentChange],
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // allow re-picking the same file later
    setBusy(true)
    setError(null)
    setPending(null)
    try {
      const buf = await file.arrayBuffer()
      const incoming = await readSignatures(buf)

      // Guard: replacing a more-signed version with a less-signed one would
      // silently discard signatures, so make that an explicit choice.
      if (incoming.length < roster.length) {
        setPending({
          buf,
          filename: file.name,
          roster: incoming,
          storedCount: roster.length,
        })
        return
      }
      await acceptUpload(buf, file.name, incoming)
    } catch (err) {
      setError(
        err instanceof Error ? `Could not read that PDF: ${err.message}` : 'Could not read that PDF.',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleSign = async () => {
    if (!bytes || !selectedSlot || !inkPng) return
    setBusy(true)
    setError(null)
    try {
      const result = await applySignature({
        bytes,
        pageIndex: layout.pageIndex,
        slot: selectedSlot,
        inkPng,
        signerName: effectiveName,
        designation: layout.printsDesignation ? selectedMember?.post : undefined,
        dateText: formatDate(dateISO),
      })

      const filename = buildFilename(meta.id, result.roster.length, layout.slots.length)
      const fresh = result.bytes.slice()

      // Replace the app's current version, then hand the file to the signer.
      await store(fresh.buffer as ArrayBuffer, filename, result.roster)

      setBytes(fresh.buffer as ArrayBuffer)
      setRoster(result.roster)
      setSource('stored')
      setSourceName(filename)
      onDocumentChange(result.bytes)

      // The stored copy stays the plain signed PDF, so the next signer's
      // stamp still lands on the coordinates measured from the original. Only
      // the file handed to the user carries the letterhead cover.
      downloadPdf(
        await prependLetterhead(result.bytes.slice(), {
          title: meta.titleTa,
          subtitle: meta.titleEn,
          note: `Signed by ${result.roster.length} of ${layout.slots.length}`,
        }),
        filename,
      )

      setJustSigned(filename)
      setPickedSlotId(null)
      setInkPng(null)
      setNameOverride('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signing failed.')
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async () => {
    setBusy(true)
    setError(null)
    try {
      await clearCurrent(meta.id)
      const res = await fetch(asset(meta.file))
      const buf = await res.arrayBuffer()
      await adopt(buf, meta.originalName, 'original')
      onDocumentChange(null)
      setJustSigned(null)
      setPending(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not restore the original.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel signpanel">
      <div className="panel__head">
        <h2>e-Signature</h2>
        <span className="topbar__spacer" />
        <span className={`chip${complete ? ' chip--done' : ''}`}>
          {roster.length} / {layout.slots.length} signed
        </span>
      </div>

      <div className="panel__body">
        {error && <div className="alert alert--error">{error}</div>}

        {storeFailed && (
          <div className="alert alert--warning">
            This browser would not save the replacement, so the document here will revert to the
            original on reload. The downloaded file itself is fine. Private-browsing windows and
            blocked site data both cause this.
          </div>
        )}

        <div className="signpanel__source">
          <span className="signpanel__source-label">
            {source === 'original' ? 'Original' : source === 'stored' ? 'Current version' : 'Uploaded'}
          </span>
          <strong>{sourceName}</strong>
          <label className="btn btn--sm">
            ⬆ Upload &amp; replace
            <input type="file" accept="application/pdf" onChange={handleUpload} hidden />
          </label>
          {source !== 'original' && (
            <button className="btn btn--sm btn--ghost" onClick={handleRestore} disabled={busy}>
              ↺ Restore original
            </button>
          )}
        </div>

        {pending && (
          <div className="alert alert--warning">
            <strong>{pending.filename}</strong> carries {pending.roster.length} signature
            {pending.roster.length === 1 ? '' : 's'}, but this browser already holds a version with{' '}
            {pending.storedCount}. Replacing would discard{' '}
            {pending.storedCount - pending.roster.length}.
            <div className="alert__actions">
              <button
                className="btn btn--sm btn--primary"
                onClick={async () => {
                  const p = pending
                  setPending(null)
                  setBusy(true)
                  try {
                    await acceptUpload(p.buf, p.filename, p.roster)
                  } finally {
                    setBusy(false)
                  }
                }}
                disabled={busy}
              >
                Replace anyway
              </button>
              <button className="btn btn--sm" onClick={() => setPending(null)} disabled={busy}>
                Keep current version
              </button>
            </div>
          </div>
        )}

        {source === 'stored' && (
          <p className="signpanel__hint">
            This browser is serving this file wherever the original would appear — signing and
            uploading both replace it. The bundled original is untouched and can be restored above.
          </p>
        )}

        <ol className="slotlist">
          {layout.slots.map((slot) => {
            const rec = roster.find((r) => r.slotId === slot.id)
            const eligible = mayUse(slot)
            const external = (slot.memberIds ?? []).length === 0
            const owner = MEMBERS.find((m) => (slot.memberIds ?? [])[0] === m.id)
            return (
              <li
                key={slot.id}
                className={`slot${rec ? ' slot--signed' : ''}${
                  slot.id === selectedSlotId ? ' slot--active' : ''
                }`}
              >
                <span className="slot__icon">{rec ? '✓' : '○'}</span>
                <span className="slot__role">
                  {slot.role}
                  {owner?.name && !rec && <span className="slot__owner"> · {owner.name}</span>}
                </span>

                {rec ? (
                  <span className="slot__meta">
                    {rec.signerName}
                    {rec.designation ? ` — ${rec.designation}` : ''} ·{' '}
                    {formatDate(rec.signedAt.slice(0, 10))}
                  </span>
                ) : external ? (
                  <span className="slot__meta slot__meta--locked">
                    ✍ {slot.externalNote ?? 'Signed in person'}
                  </span>
                ) : eligible ? (
                  <button
                    className={`btn btn--sm${slot.id === selectedSlotId ? ' btn--primary' : ''}`}
                    onClick={() => {
                      setPickedSlotId(slot.id === selectedSlotId ? null : slot.id)
                      setInkPng(null)
                      setNameOverride(me?.name ?? '')
                    }}
                    disabled={busy}
                  >
                    {slot.id === selectedSlotId ? 'Signing…' : 'Sign here'}
                  </button>
                ) : (
                  <span className="slot__meta slot__meta--locked">
                    🔒 Only {(slot.memberIds ?? []).map((id) => postOf(id)).join(' or ')} may sign
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        {layout.note && <p className="signpanel__hint">{layout.note}</p>}

        {complete ? (
          <div className="alert alert--ok">
            ✓ All signable lines are complete. Any remaining lines are signed in person.
          </div>
        ) : (
          selectedSlot && (
            <div className="form-section">
              <p className="form-section__title">{selectedSlot.role}</p>

              <div className="field">
                <label className="field__label">Name</label>
                <input
                  className="input"
                  value={nameOverride || (me?.name ?? '')}
                  onChange={(e) => setNameOverride(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="field">
                <label className="field__label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={dateISO}
                  onChange={(e) => setDateISO(e.target.value)}
                />
              </div>

              <SignaturePad onChange={setInkPng} />

              <button
                className="btn btn--primary"
                onClick={handleSign}
                disabled={!canSign || busy}
                style={{ marginTop: 12 }}
              >
                {busy ? 'Signing…' : '✍ Sign, download & replace'}
              </button>
            </div>
          )
        )}

        {justSigned && (
          <div className="alert alert--ok" style={{ marginTop: 12 }}>
            ✓ <strong>{justSigned}</strong> downloaded, and it is now the current document here.
            {!complete && ' Pass the file to the next signer.'}
          </div>
        )}
      </div>
    </section>
  )
}

/** Post label for a member id, for the locked-line message. */
function postOf(id: string): string {
  return MEMBERS.find((m) => m.id === id)?.post ?? id.toUpperCase()
}

function buildFilename(docId: string, signed: number, total: number): string {
  return signed === total ? `${docId}-signed-final.pdf` : `${docId}-signed-${signed}of${total}.pdf`
}
