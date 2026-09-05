/**
 * Fillable particulars for the project and investor contracts.
 *
 * These five documents are prose contracts, so the authoritative text stays in
 * the original PDF — it is never re-typeset. What is captured here is the set
 * of blanks each contract asks to be completed: the preamble details, the key
 * inline values, and the schedules, which are proper label/value tables.
 *
 * Filling one produces a particulars sheet on company letterhead carrying the
 * same signature block as the contract, to be executed alongside the original.
 * Field labels and signatory lists are the documents' own.
 */
import type { FormDefinition } from '../lib/formSchema'
import { shareOf } from '../lib/formSchema'
import { formatRupees, parseAmount } from '../lib/amountWords'

/** Difference of two amount fields, formatted as the documents do. */
const minus =
  (a: string, b: string) =>
  (v: Record<string, string>): string => {
    const x = parseAmount(v[a] ?? '')
    const y = parseAmount(v[b] ?? '')
    if (x === null && y === null) return '₹ '
    return formatRupees((x ?? 0) - (y ?? 0))
  }

const PLACE_BLOCK = {
  type: 'fields' as const,
  heading: 'நடைமுறை நாள் & இடம் (Execution)',
  fields: [
    { key: 'place', label: 'இடம் (Place of execution)', kind: 'text' as const },
    { key: 'execDate', label: 'நடைமுறை நாள் (Effective date)', kind: 'date' as const },
  ],
}

/* ------------------------------------------------------------------ */

const constructionMou: FormDefinition = {
  id: 'construction-mou',
  titleTa: 'கட்டுமானப் புரிந்துணர்வு ஒப்பந்தம் — நிரப்பப்பட்ட விவரங்கள்',
  titleEn: '(CONSTRUCTION AGREEMENT — COMPLETED PARTICULARS)',
  sourcePages: '13-page contract',
  blocks: [
    PLACE_BLOCK,
    {
      type: 'fields',
      heading: 'ஒப்பந்தக்காரர் (Contractor)',
      fields: [
        { key: 'contractorGstin', label: 'GSTIN', kind: 'text' },
        { key: 'contractorPan', label: 'PAN', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: 'முன்னுரை — நில உரிமை (Recitals — title)',
      fields: [
        { key: 'saleDeedDate', label: 'விற்பனை பத்திரம் தேதி (Sale deed date)', kind: 'date' },
        {
          key: 'subRegistrar',
          label: 'துணை பதிவாளர் அலுவலகம் (Sub-Registrar office)',
          kind: 'text',
        },
        { key: 'docNo', label: 'ஆவண எண் / ஆண்டு (Document no. / year)', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: 'அட்டவணை-A: சொத்தின் விவரம் (Schedule-A: property)',
      fields: [
        { key: 'village', label: 'கிராமம் (Village)', kind: 'text' },
        { key: 'taluk', label: 'தாலுகா (Taluk)', kind: 'text' },
        { key: 'district', label: 'மாவட்டம் (District)', kind: 'text' },
        { key: 'surveyNo', label: 'சர்வே எண் (Survey no.)', kind: 'text' },
        { key: 'subDivNo', label: 'துணைப் பிரிவு எண் (Sub-division no.)', kind: 'text' },
        { key: 'regDistrict', label: 'பதிவு மாவட்டம் (Registration district)', kind: 'text' },
        {
          key: 'subRegDistrict',
          label: 'துணை பதிவு மாவட்டம் (Sub-registration district)',
          kind: 'text',
        },
        { key: 'extent', label: 'அளவு (Extent)', kind: 'text' },
        {
          key: 'extentUnit',
          label: 'அளவின் அலகு (Unit)',
          kind: 'select',
          options: ['சதுர அடி', 'சென்ட்', 'ஏக்கர்'],
        },
        { key: 'boundNorth', label: 'வடக்கு (North boundary)', kind: 'text' },
        { key: 'boundSouth', label: 'தெற்கு (South boundary)', kind: 'text' },
        { key: 'boundEast', label: 'கிழக்கு (East boundary)', kind: 'text' },
        { key: 'boundWest', label: 'மேற்கு (West boundary)', kind: 'text' },
      ],
    },
    {
      type: 'table',
      heading: 'உரிமையாளர் பங்கு (Owners’ undivided share)',
      table: {
        key: 'shares',
        columns: [
          { key: 'owner', label: 'உரிமையாளர்', kind: 'text', width: 52 },
          { key: 'share', label: 'பங்கு %', kind: 'text', width: 41 },
        ],
        rows: 1,
      },
    },
    {
      type: 'table',
      heading: 'அட்டவணை-B: கட்டிட விவரக்குறிப்புகள் (Schedule-B: specifications)',
      table: {
        key: 'specs',
        columns: [
          {
            key: 'item',
            label: 'உருப்படி',
            kind: 'select',
            width: 36,
            options: [
              'கட்டமைப்பு வகை',
              'கட்டப்பட்ட பரப்பளவு',
              'அடித்தளம்',
              'தரை அமைப்பு',
              'கதவுகள் மற்றும் ஜன்னல்கள்',
              'மின் இணைப்பு',
              'குழாய் மற்றும் சுகாதார பொருத்துதல்கள்',
              'வண்ணப்பூச்சு',
              'சமையலறை',
              'வளாக சுவர் / வாயில்',
              'நீர்ப்புகா மற்றும் மொட்டை மாடி சிகிச்சை',
              'பிற பொருத்துதல்கள்/நிறுவனங்கள்',
            ],
          },
          { key: 'spec', label: 'விவரக்குறிப்பு', kind: 'text', width: 57 },
        ],
        rows: 1,
      },
    },
    {
      type: 'table',
      heading: 'அட்டவணை-C: கட்டண அட்டவணை (Schedule-C: payment schedule)',
      table: {
        key: 'payments',
        columns: [
          {
            key: 'stage',
            label: 'நிலை',
            kind: 'select',
            width: 44,
            options: [
              'ஒப்பந்தம் கையொப்பமிடும் போது / முன்பணம்',
              'அடித்தளம் நிறைவடையும் போது',
              'தரைத்தள கூரை ஸ்லாப் (RCC) நிறைவடையும் போது',
              'செங்கல்/பிளாக் வேலை மற்றும் பூச்சு நிறைவடையும் போது',
              'மின்/குழாய் முதல் நிலை மற்றும் தரை அமைப்பு நிறைவடையும் போது',
              'வண்ணப்பூச்சு, பொருத்துதல்கள் மற்றும் முடிவு நிறைவடையும் போது',
              'இறுதி ஒப்படைப்பின் போது (தடுப்புத் தொகை)',
            ],
          },
          { key: 'pct', label: 'ஒப்பந்த மதிப்பின் %', kind: 'text', width: 22 },
          { key: 'amount', label: 'தொகை (₹)', kind: 'amount', width: 27 },
        ],
        rows: 1,
        totalOf: 'amount',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'note',
      text: '(இந்த விவரப் பட்டியல், 13 பக்க கட்டுமான ஒப்பந்தத்தின் அட்டவணை-A, B, C மற்றும் முன்னுரை விவரங்களை நிரப்புகிறது. மூல ஒப்பந்தத்துடன் இணைத்து கையொப்பமிடப்பட வேண்டும்.)',
    },
  ],
  // Owner order follows the names pre-printed in the contract, not CEO→CBO.
  signatories: [
    { memberIds: ['ceo'], label: 'உரிமையாளர் 1 — CEO & Managing Director' },
    { memberIds: ['cbo'], label: 'உரிமையாளர் 2 — CBO' },
    { memberIds: ['coo'], label: 'உரிமையாளர் 3 — COO' },
    { memberIds: ['cs'], label: 'உரிமையாளர் 4 — CS (Chief Secretary)' },
    { memberIds: ['cfo'], label: 'உரிமையாளர் 5 — CFO' },
    { memberIds: [], label: 'ஒப்பந்தக்காரர் — A1 Construction சார்பாக' },
  ],
}

/* ------------------------------------------------------------------ */

const projectAnnexure: FormDefinition = {
  id: 'project-annexure',
  titleTa: 'திட்ட இணைப்பு',
  titleEn: '(PROJECT ANNEXURE)',
  sourcePages: '5-page annexure',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'annexureNo', label: 'இணைப்பு எண் (Annexure No.)', kind: 'text' },
        { key: 'preparedOn', label: 'தயாரிக்கப்பட்ட தேதி', kind: 'date' },
      ],
    },
    {
      type: 'fields',
      heading: '1. திட்ட அடையாளம் (PROJECT IDENTIFICATION)',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'startDate', label: 'திட்டம் தொடங்கும் நாள்', kind: 'date' },
        { key: 'endDate', label: 'எதிர்பார்க்கப்படும் நிறைவு நாள்', kind: 'date' },
        {
          key: 'projectLead',
          label: 'திட்டப் பொறுப்பு (Project Lead)',
          kind: 'select',
          options: ['COO', 'CEO'],
        },
      ],
    },
    {
      type: 'fields',
      heading: '2. நில விவரம் (LAND DETAILS)',
      fields: [
        { key: 'surveyNo', label: 'சர்வே எண் / துணைப் பிரிவு எண்', kind: 'text' },
        { key: 'locality', label: 'கிராமம் / தாலுகா / மாவட்டம்', kind: 'text' },
        { key: 'landExtent', label: 'நிலத்தின் அளவு (சதுர அடி / சென்ட்)', kind: 'text' },
        { key: 'saleDeed', label: 'விற்பனை பத்திரம் தேதி / ஆவண எண்', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: '3. திட்ட நிதி விவரம் (PROJECT FINANCIALS)',
      fields: [
        { key: 'totalValue', label: 'திட்டத்தின் மொத்த மதிப்பு', kind: 'amount' },
        { key: 'landPct', label: 'நில செலவு (%)', kind: 'text' },
        { key: 'landAmt', label: 'நில செலவு (₹)', kind: 'amount' },
        { key: 'buildPct', label: 'கட்டுமான + மார்க்கெட்டிங் செலவு (%)', kind: 'text' },
        { key: 'buildAmt', label: 'கட்டுமான + மார்க்கெட்டிங் செலவு (₹)', kind: 'amount' },
        { key: 'boardTotal', label: 'வாரிய உறுப்பினர்கள் (5) மொத்த முதலீடு', kind: 'amount' },
        { key: 'honoraryTotal', label: 'கௌரவ உறுப்பினர்கள் மொத்த முதலீடு', kind: 'amount' },
        { key: 'honoraryCount', label: 'கௌரவ உறுப்பினர்களின் எண்ணிக்கை', kind: 'text' },
        {
          key: 'raisedTotal',
          label: 'மொத்த முதலீடு (தானியங்கி)',
          kind: 'derived',
          derive: (v) => {
            const a = parseAmount(v.boardTotal ?? '')
            const b = parseAmount(v.honoraryTotal ?? '')
            if (a === null && b === null) return '₹ '
            return formatRupees((a ?? 0) + (b ?? 0))
          },
        },
      ],
    },
    {
      type: 'table',
      heading: '4. உறுப்பினர் முதலீட்டுப் பட்டியல் (MEMBER-WISE INVESTMENT)',
      table: {
        key: 'members',
        columns: [
          { key: 'name', label: 'உறுப்பினர் பெயர்', kind: 'text', width: 26 },
          {
            key: 'kind',
            label: 'வகை',
            kind: 'select',
            width: 24,
            options: [
              'வாரியம் (CEO)',
              'வாரியம் (CFO)',
              'வாரியம் (CS)',
              'வாரியம் (COO)',
              'வாரியம் (CBO)',
              'கௌரவ உறுப்பினர்',
            ],
          },
          { key: 'amount', label: 'முதலீட்டுத் தொகை', kind: 'amount', width: 19 },
          { key: 'ratio', label: 'முதலீட்டு விகிதம்', kind: 'text', width: 12, derive: shareOf('amount') },
          { key: 'plShare', label: 'லாப/நஷ்டப் பங்கு %', kind: 'text', width: 12 },
        ],
        rows: 1,
        totalOf: 'amount',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'table',
      heading: '5. கட்டண அட்டவணை (PAYMENT SCHEDULE)',
      table: {
        key: 'schedule',
        columns: [
          {
            key: 'stage',
            label: 'விவரம்',
            kind: 'select',
            width: 46,
            options: [
              'நில வாங்குதலுக்கான தொகை',
              'அடித்தளம் நிறைவு',
              'கூரை ஸ்லாப் (RCC) நிறைவு',
              'செங்கல்/பூச்சு வேலை நிறைவு',
              'மின்/குழாய்/தரை அமைப்பு நிறைவு',
              'இறுதி முடிவு & மார்க்கெட்டிங் தொடக்கம்',
            ],
          },
          { key: 'pct', label: '% of Total', kind: 'text', width: 20 },
          { key: 'due', label: 'செலுத்த வேண்டிய தேதி', kind: 'date', width: 27 },
        ],
        rows: 1,
      },
    },
    {
      type: 'table',
      heading: '7. திட்ட காலக்கெடு / மைல்கற்கள் (MILESTONES)',
      table: {
        key: 'milestones',
        columns: [
          {
            key: 'milestone',
            label: 'மைல்கல்',
            kind: 'select',
            width: 60,
            options: [
              'நில பதிவு நிறைவு',
              'கட்டுமான ஒப்பந்தம் கையொப்பம்',
              'கட்டுமானம் தொடக்கம்',
              'கட்டுமானம் நிறைவு',
              'விற்பனை தொடக்கம்',
              'இறுதி விற்பனை & லாபப் பகிர்வு',
            ],
          },
          { key: 'date', label: 'எதிர்பார்க்கப்படும் தேதி', kind: 'date', width: 33 },
        ],
        rows: 1,
      },
    },
    {
      type: 'fields',
      heading: '8–9. ஒப்பந்தக்காரர் & இணைந்த ஆவணங்கள்',
      fields: [
        { key: 'contractorName', label: 'ஒப்பந்தக்காரர் நிறுவனத்தின் பெயர்', kind: 'text' },
        { key: 'contractDate', label: 'கட்டுமான ஒப்பந்த தேதி', kind: 'date' },
        { key: 'contractValue', label: 'ஒப்பந்த மதிப்பு', kind: 'amount' },
        { key: 'agreementCount', label: 'முதலீட்டு ஒப்பந்தங்களின் எண்ணிக்கை', kind: 'text' },
        { key: 'saleDeedNo', label: 'நில விற்பனை பத்திரம் ஆவண எண்', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: '10. திட்ட-குறிப்பிட்ட சிறப்பு நிபந்தனைகள்',
      fields: [
        {
          key: 'specialConditions',
          label: 'சிறப்பு நிபந்தனைகள்',
          kind: 'textarea',
          default: 'ஏதுமில்லை',
          hint: 'The annexure prescribes “ஏதுமில்லை” when there are none — do not leave it empty.',
        },
      ],
    },
  ],
  // The annexure prints a date under each rule and no name field.
  signatories: [
    { memberIds: ['ceo'], label: 'CEO & Managing Director' },
    { memberIds: ['cfo'], label: 'CFO' },
    { memberIds: ['cs'], label: 'CS (Chief Secretary)' },
    { memberIds: ['coo'], label: 'COO' },
    { memberIds: ['cbo'], label: 'CBO' },
  ],
}

/* ------------------------------------------------------------------ */

const projectFunding: FormDefinition = {
  id: 'project-funding',
  titleTa: 'திட்ட நிதி திரட்டல் ஆவணம்',
  titleEn: '(PROJECT FUND MOBILIZATION DOCUMENT)',
  sourcePages: '6-page document',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'docNo', label: 'ஆவண எண் (PFM/____/2026-27)', kind: 'text' },
        { key: 'preparedOn', label: 'தயாரிக்கப்பட்ட தேதி', kind: 'date' },
        { key: 'preparedBy', label: 'தயாரித்தவர் — CFO', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: '1. திட்ட விவரம் (PROJECT DETAILS)',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'landLocation', label: 'நிலத்தின் இடம் / சர்வே எண்', kind: 'text' },
        { key: 'totalValue', label: 'திட்டத்தின் மொத்த மதிப்பு', kind: 'amount' },
        { key: 'landPct', label: 'நில செலவு விகிதம் (%)', kind: 'text' },
        { key: 'landAmt', label: 'நில செலவு (₹)', kind: 'amount' },
        { key: 'buildPct', label: 'கட்டுமான + மார்க்கெட்டிங் விகிதம் (%)', kind: 'text' },
        { key: 'buildAmt', label: 'கட்டுமான + மார்க்கெட்டிங் (₹)', kind: 'amount' },
      ],
    },
    {
      type: 'table',
      heading: '3. நிலை 1: வாரிய உறுப்பினர்களின் மூலதன பங்களிப்பு',
      table: {
        key: 'stage1',
        columns: [
          { key: 'name', label: 'பெயர்', kind: 'text', width: 34 },
          {
            key: 'post',
            label: 'பதவி',
            kind: 'select',
            width: 26,
            options: ['CEO & MD', 'CFO', 'CS', 'COO', 'CBO'],
          },
          { key: 'amount', label: 'முதலீட்டு உறுதி', kind: 'amount', width: 20 },
          { key: 'pct', label: 'மொத்த மதிப்பில் %', kind: 'text', width: 13 },
        ],
        rows: 1,
        totalOf: 'amount',
        totalLabel: 'வாரிய உறுப்பினர்கள் மொத்தம்',
      },
    },
    {
      type: 'fields',
      heading: '4. நிலை 2: திரட்டப்பட வேண்டிய இருப்புத் தொகை',
      fields: [
        { key: 'boardTotal', label: 'வாரிய உறுப்பினர்களின் மொத்த பங்களிப்பு', kind: 'amount' },
        {
          key: 'balanceToRaise',
          label: 'கௌரவ உறுப்பினர்கள் மூலம் திரட்ட வேண்டிய இருப்பு (தானியங்கி)',
          kind: 'derived',
          derive: minus('totalValue', 'boardTotal'),
        },
      ],
    },
    {
      type: 'table',
      heading: '5. கௌரவ உறுப்பினர் பட்டியல் (HONORARY INVESTORS)',
      table: {
        key: 'honorary',
        columns: [
          { key: 'name', label: 'பெயர்', kind: 'text', width: 26 },
          { key: 'contact', label: 'தொடர்பு எண்', kind: 'text', width: 20 },
          { key: 'amount', label: 'முதலீட்டு உறுதி', kind: 'amount', width: 19 },
          { key: 'pct', label: 'மொத்தத்தில் %', kind: 'text', width: 12 },
          { key: 'date', label: 'உறுதி தேதி', kind: 'date', width: 16 },
        ],
        rows: 1,
        totalOf: 'amount',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'fields',
      heading: '7. திரட்டல் காலக்கெடு (TIMELINE)',
      fields: [
        {
          key: 'commitmentsBy',
          label: 'அனைத்து முதலீட்டு உறுதிகளும் இறுதி செய்யப்பட வேண்டிய தேதி',
          kind: 'date',
        },
        { key: 'landPayBy', label: 'நில செலவுக்கான 40% செலுத்தப்பட வேண்டிய தேதி', kind: 'date' },
      ],
    },
    {
      type: 'note',
      text: '(நிறுவன பட்டயம் பிரிவு 5.2 இன் படி, புதிய திட்டத்தை தொடங்குதல் "அனைத்து ஐந்து உறுப்பினர்களும் தேவை" என வகைப்படுத்தப்பட்ட முடிவு. மேலே உள்ள ஐந்து கையொப்பங்களும் கிடைத்த பின்னரே கௌரவ உறுப்பினர்களிடமிருந்து பணம் பெறும் செயல்முறை தொடங்கப்பட வேண்டும்.)',
    },
  ],
  signatories: [
    { memberIds: ['ceo'], label: 'CEO & Managing Director' },
    { memberIds: ['cfo'], label: 'CFO' },
    { memberIds: ['cs'], label: 'CS (Chief Secretary)' },
    { memberIds: ['coo'], label: 'COO' },
    { memberIds: ['cbo'], label: 'CBO' },
  ],
}

/* ------------------------------------------------------------------ */

const investmentAgreement: FormDefinition = {
  id: 'investment-agreement',
  titleTa: 'முதலீடு மற்றும் லாபப் பகிர்வு ஒப்பந்தம் — நிரப்பப்பட்ட விவரங்கள்',
  titleEn: '(INVESTMENT & PROFIT-SHARING AGREEMENT — PARTICULARS)',
  sourcePages: '9-page agreement',
  blocks: [
    PLACE_BLOCK,
    {
      type: 'fields',
      heading: 'முதலீட்டாளர் (Investor / honorary member)',
      fields: [
        {
          key: 'salutation',
          label: 'திரு. / திருமதி.',
          kind: 'select',
          options: ['திரு.', 'திருமதி.'],
        },
        { key: 'investorName', label: 'முதலீட்டாளர் முழுப்பெயர்', kind: 'text' },
        { key: 'guardian', label: 'தந்தை / கணவர் பெயர்', kind: 'text' },
        { key: 'age', label: 'வயது', kind: 'text' },
        { key: 'occupation', label: 'தொழில்', kind: 'text' },
        { key: 'address', label: 'முழு முகவரி', kind: 'textarea' },
        { key: 'pan', label: 'பான் எண் (PAN)', kind: 'text' },
        { key: 'contact', label: 'தொடர்பு எண் / மின்னஞ்சல்', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: 'பிரிவு 2: முதலீட்டுத் தொகை & கட்டண அட்டவணை',
      fields: [
        { key: 'totalInvestment', label: 'மொத்த முதலீட்டுத் தொகை', kind: 'amount' },
        { key: 'amountWords', label: 'தொகை (எழுத்துக்களில்)', kind: 'text' },
        { key: 'capitalPct', label: 'மொத்த திட்ட மூலதனத்தில் %', kind: 'text' },
        { key: 'landShare', label: 'நில செலவுக்கான பங்கு (40%)', kind: 'amount' },
        { key: 'signingDays', label: 'கையொப்பத்திற்குப் பின் செலுத்த நாட்கள்', kind: 'text' },
        {
          key: 'buildShare',
          label: 'கட்டுமான/மார்க்கெட்டிங் பங்கு (60%) — தானியங்கி',
          kind: 'derived',
          derive: minus('totalInvestment', 'landShare'),
        },
      ],
    },
    {
      type: 'fields',
      heading: 'பிரிவு 9 & 13: தவறுதல் மற்றும் தகராறு',
      fields: [
        { key: 'defaultInterest', label: 'தாமதத் தொகைக்கு ஆண்டு வட்டி (%)', kind: 'text' },
        { key: 'disputeDays', label: 'பரஸ்பர விவாதத்திற்கான நாட்கள்', kind: 'text' },
        { key: 'arbitrationCity', label: 'நடுவர் மன்ற இருக்கை (நகரம்), தமிழ்நாடு', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: 'அட்டவணை-B: திட்ட விவரங்கள் (Schedule-B)',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'landLocation', label: 'நிலத்தின் இடம் / சர்வே எண்', kind: 'text' },
        { key: 'projectValue', label: 'திட்டத்தின் மொத்த மதிப்பு', kind: 'amount' },
        { key: 'landRatio', label: 'நில செலவு விகிதம் (%)', kind: 'text' },
        { key: 'buildRatio', label: 'கட்டுமான + மார்க்கெட்டிங் விகிதம் (%)', kind: 'text' },
        { key: 'completionBy', label: 'எதிர்பார்க்கப்படும் நிறைவு காலம்', kind: 'text' },
      ],
    },
    {
      type: 'note',
      text: '(இந்த ஒப்பந்தம் நிறுவன நிர்வாகம் மற்றும் முதலீட்டுக் கொள்கை ஆவணத்தின் ஒரு பகுதி; முரண்பாடு ஏற்பட்டால் கொள்கை ஆவணத்தின் விதிகளே செல்லும். இது உறுதியான வருவாய் அல்ல; இது ஒரு குறிப்பிட்ட திட்டத்திற்கான தனிப்பட்ட முதலீட்டு ஏற்பாடு மட்டுமே.)',
    },
  ],
  signatories: [
    { memberIds: ['ceo'], label: 'CEO & Managing Director சார்பாக' },
    { memberIds: ['cfo'], label: 'CFO சார்பாக' },
    { memberIds: [], label: 'முதலீட்டாளர் (Investor)' },
  ],
}

/* ------------------------------------------------------------------ */

const guaranteeDeed: FormDefinition = {
  id: 'guarantee-deed',
  titleTa: 'பாதுகாப்பு உத்தரவாத ஆவணம் — நிரப்பப்பட்ட விவரங்கள்',
  titleEn: '(SECURITY & PERSONAL GUARANTEE DEED — PARTICULARS)',
  sourcePages: '10-page deed',
  blocks: [
    PLACE_BLOCK,
    {
      type: 'table',
      heading: 'உத்தரவாதம் அளிப்பவர்கள் (Guarantors — personal capacity)',
      table: {
        key: 'guarantors',
        columns: [
          { key: 'name', label: 'பெயர்', kind: 'text', width: 30 },
          { key: 'address', label: 'முகவரி', kind: 'text', width: 40 },
          { key: 'pan', label: 'பான் எண்', kind: 'text', width: 23 },
        ],
        rows: 1,
      },
    },
    {
      type: 'fields',
      heading: 'பயனாளி (Beneficiary — the investing honorary member)',
      fields: [
        {
          key: 'salutation',
          label: 'திரு. / திருமதி.',
          kind: 'select',
          options: ['திரு.', 'திருமதி.'],
        },
        { key: 'beneficiaryName', label: 'பயனாளி முழுப்பெயர்', kind: 'text' },
        { key: 'beneficiaryAddress', label: 'முழு முகவரி', kind: 'textarea' },
        { key: 'beneficiaryPan', label: 'பான் எண் (PAN)', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: 'அட்டவணை-A: முதலீட்டு விவரங்கள் (Schedule-A)',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'principal', label: 'முதலீட்டு அசல் தொகை', kind: 'amount' },
        { key: 'principalWords', label: 'அசல் தொகை (எழுத்துக்களில்)', kind: 'text' },
        { key: 'agreementDate', label: 'முதன்மை ஒப்பந்த தேதி', kind: 'date' },
        {
          key: 'mortgageCreated',
          label: 'நில அடமானம் உருவாக்கப்பட்டுள்ளதா (பிரிவு 6)',
          kind: 'select',
          options: ['ஆம்', 'இல்லை'],
        },
      ],
    },
    {
      type: 'fields',
      heading: 'தூண்டல் & திரும்பச் செலுத்துதல் (Clauses 3–4, 10)',
      fields: [
        { key: 'stallMonths', label: 'முன்னேற்றம் இல்லாத மாதங்கள்', kind: 'text', default: '12' },
        { key: 'saleDays', label: 'விற்பனை நிறைவுக்குப் பின் நாட்கள்', kind: 'text', default: '60' },
        { key: 'demandDays', label: 'அறிவிப்புக்குப் பின் திரும்பச் செலுத்த நாட்கள்', kind: 'text', default: '30' },
        { key: 'interestPct', label: 'நிலுவைத் தொகைக்கு ஆண்டு வட்டி (%)', kind: 'text' },
        { key: 'disputeDays', label: 'பரஸ்பர விவாதத்திற்கான நாட்கள்', kind: 'text' },
        { key: 'arbitrationCity', label: 'நடுவர் மன்ற இருக்கை (நகரம்), தமிழ்நாடு', kind: 'text' },
      ],
    },
    {
      type: 'note',
      text: '(இது ஒரு தனிநபர் உத்தரவாதம் — நிறுவன உத்தரவாதம் அல்ல. கையொப்பமிடும் ஐவரும் தங்கள் தனிப்பட்ட சொத்துக்களுக்கு எதிராக பொறுப்பேற்கிறார்கள், தனித்தனியாகவும் கூட்டாகவும். இது முதலீட்டு அசல் தொகைக்கு மட்டுமே பொருந்தும்; லாபப் பங்குக்கு உத்தரவாதம் அளிக்கவில்லை.)',
    },
  ],
  signatories: [
    { memberIds: ['ceo'], label: 'உத்தரவாதம் அளிப்பவர் 1 — CEO & Managing Director' },
    { memberIds: ['cfo'], label: 'உத்தரவாதம் அளிப்பவர் 2 — CFO' },
    { memberIds: ['cs'], label: 'உத்தரவாதம் அளிப்பவர் 3 — CS (Chief Secretary)' },
    { memberIds: ['coo'], label: 'உத்தரவாதம் அளிப்பவர் 4 — COO' },
    { memberIds: ['cbo'], label: 'உத்தரவாதம் அளிப்பவர் 5 — CBO' },
    { memberIds: [], label: 'பயனாளி (Beneficiary)' },
  ],
}

/* ------------------------------------------------------------------ */

export const CONTRACT_FORMS: FormDefinition[] = [
  constructionMou,
  projectAnnexure,
  projectFunding,
  investmentAgreement,
  guaranteeDeed,
]
