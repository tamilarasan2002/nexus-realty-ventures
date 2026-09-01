# Nexus Realty Ventures — website & document portal

A static site for a residential real-estate developer in Namakkal, Tamil Nadu,
plus an internal document portal that fills in and e-signs the company's forms.
Everything runs in the browser: there is no backend and nothing is uploaded.

## What's here

**Public site** — Home, About, What we do, How we build, Contact. All content is
drawn from the company's own charter and governance policy; nothing is invented,
and values the source documents leave blank are shown as blank.

**Document portal** (`/#/portal/…`) — two access tiers:

| Tier | Sees |
|---|---|
| Company | The company charter and the governance & investment policy |
| Admin | Those, plus 11 administrative, project and investor documents |

Documents come in two shapes, and the portal treats them differently on purpose:

- **Single-page templates** (the six management forms) are re-created as HTML on
  company letterhead, so filling them produces a pixel-accurate PDF.
- **Prose contracts** (the project and investor documents) are never re-typeset.
  They open in a pdf.js viewer, and signatures are stamped onto the original PDF
  at coordinates measured from it — so the executed wording cannot drift. Their
  blanks are captured in a separate particulars form.

## e-Signature

A signature line may only be signed by a post the document itself names. That
list lives on the slot in `src/lib/signatureSlots.ts` (for stamped contracts) or
in the form definition (for generated forms), and is the single source of truth.
Multi-signature documents are signed in the printed order, and a signature
cannot be withdrawn once a later one exists. Lines belonging to a contractor,
investor or witness are left blank for a wet signature.

Tamil is rendered by the browser and rasterised into the PDF, because neither
jsPDF nor pdf-lib performs the glyph reordering Tamil needs.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/
npm run typecheck
```

Deploys as a static site; `netlify.toml` is set up. HashRouter is used so no
SPA rewrite rule is needed.

## Please read before relying on this

- **The source documents are unexecuted drafts.** No signature or date has been
  applied in any of them, and the governance policy's Annexure-A values are all
  blank. The site labels them as drafts rather than presenting them as settled.
- **The governance policy carries its own legal caution** that pooling money
  from members without day-to-day management control may amount to a Collective
  Investment Scheme under the SEBI regulations of 1999, and that a qualified
  Company Secretary or SEBI-registered adviser must review the structure before
  any money is collected. The guarantee deed repeats the warning and adds that
  standardising it across multiple investors sharpens the exposure.
- **The access codes are a speed bump, not security.** They ship in the
  JavaScript bundle, and the source PDFs stay fetchable from `/documents/*.pdf`
  whatever the codes are. Real protection needs the files served from behind
  server-side authentication.
- One Aadhaar number printed in the construction agreement has been redacted
  from page 1 of that PDF.
