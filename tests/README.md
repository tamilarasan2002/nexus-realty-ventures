# Tests

The portal's real risk is not logic — it is layout. Every document is laid out
as one or more 816×1056 sheets (US Letter at 96dpi), rasterised sheet by sheet,
and dropped onto a 612×792 PDF page. If a sheet is the wrong size, or content
overflows it, or the capture runs before pagination settles, the PDF comes out
stretched or clipped and nothing in the code throws. So the suite drives a real
browser and reads the produced PDFs back.

## Running

```sh
npm test                 # everything, against the built bundle
npm test -- --headed     # watch it run
npm test -- payment      # only documents whose id contains "payment"
```

`npm test` serves `dist/` with `vite preview`, so build first if the source has
changed. First run only, install the browser:

```sh
npx playwright install chromium
```

## What is checked

**Every generated document, empty and filled.** Both passes matter for
different reasons. Empty is the harder case for alignment: an unfilled table
still has to hold its columns, and a derived cell with no inputs must stay
blank rather than print a confident zero. Filled is the harder case for
pagination — the filled pass adds two rows to every table and puts a long Tamil
sentence in every textarea, to force a page break.

For each sheet:

- exactly 816×1056, with nothing overflowing it and nothing spilling sideways
- the letterhead appears on exactly one sheet, never on continuation sheets
- every continuation sheet carries the running head
- the letterhead's text and rule clear both corner triangles. The triangles are
  clipped diagonals, so this compares against the painted edge at each element's
  own y — a plain bounding-box test reports overlaps that are not there.

**Downloaded PDFs.** One generated document and one prose document are actually
downloaded and read back with pdf-lib: every page 612×792, and the prose
document one page longer than its source, because the letterhead is issued as a
cover page rather than stamped over text that must not move.

**The PIN gate**, checked before anything is unlocked. It is the reason the
portal routes are not simply public, so a regression there must be loud.

Note that the gate is a speed bump, not access control: both codes ship in the
JS bundle, and everything under `public/documents/` stays publicly fetchable by
URL whether or not anyone enters a PIN.

## Layout

| File | Purpose |
| --- | --- |
| `browser/run.mjs` | The runner: serves the build, drives Chromium, reports. |
| `browser/audit.js` | The checks themselves, as a plain script with no imports — paste it into DevTools to audit whatever document is on screen. |
| `browser/documents.mjs` | Reads the document list out of `src/data/documents.ts`, so the suite cannot quietly stop covering a document someone added. |

## Auditing by hand

`browser/audit.js` is deliberately dependency-free. Open a document, paste the
file into the DevTools console, then:

```js
await nexusAudit()          // { ok, sheets, issues }
await nexusFill(2)          // fill every field, +2 rows per table
await nexusAudit()
```

Pass the app's own html2canvas to have it assert the capture size with the
exporter's exact options: `nexusAudit({ html2canvas })`.
