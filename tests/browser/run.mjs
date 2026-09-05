/**
 * End-to-end audit of every document the portal can produce.
 *
 * These are geometry and export checks: sheet sizes, page breaks, whether the
 * letterhead clears its own corner marks, whether the PDF that actually lands
 * in the downloads folder has the pages it should. None of that can be
 * checked without a real layout engine and a real PDF, so the suite drives a
 * headless Chromium against the built bundle and then reads the downloaded
 * files back with pdf-lib.
 *
 *   npm test                 # everything
 *   npm test -- --headed     # watch it run
 *   npm test -- payment      # only documents whose id contains "payment"
 *
 * Every generated document is audited twice. Empty is the harder case for
 * alignment — an unfilled table still has to hold its columns, and a blank
 * derived cell must not print a confident zero. Filled is the harder case for
 * pagination, so both run.
 */
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { chromium } from 'playwright'

import { loadDocuments } from './documents.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '../..')
const AUDIT_JS = readFileSync(resolve(here, 'audit.js'), 'utf8')

const PORT = 4319
const BASE = `http://localhost:${PORT}`
const headed = process.argv.includes('--headed')
const filter = process.argv.slice(2).find((a) => !a.startsWith('--'))

const results = []
const record = (label, issues) => {
  const ok = issues.length === 0
  results.push({ label, ok, issues })
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}`)
  for (const issue of issues) console.log(`         ${issue}`)
}

/** `vite preview` serves the built bundle, which is what actually ships. */
async function serve() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((ok, fail) => {
    const timer = setTimeout(() => fail(new Error('preview server did not start')), 30_000)
    proc.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(String(PORT))) {
        clearTimeout(timer)
        ok()
      }
    })
    proc.on('exit', (code) => fail(new Error(`preview server exited with ${code}`)))
  })
  return proc
}

/**
 * Waits for a document to finish laying out. A paginated document renders one
 * `[data-page]` sheet per page; the receipt carries `data-print-root` on the
 * sheet itself, so there is nothing nested to wait for. The preview pane is
 * scaled and can sit outside the viewport, so this waits for the elements to
 * exist rather than to be visible.
 */
function waitForSheets(page) {
  return page.waitForFunction(
    () => {
      const root = document.querySelector('[data-print-root]')
      return !!root && (root.querySelector('[data-page]') !== null || root.classList.contains('receipt'))
    },
    undefined,
    { timeout: 20_000 },
  )
}

/** Asserts a downloaded PDF is US Letter throughout, with the pages expected. */
async function checkPdf(path, { minPages }) {
  const issues = []
  const doc = await PDFDocument.load(await readFile(path))
  if (doc.getPageCount() < minPages) {
    issues.push(`${doc.getPageCount()} pages, expected at least ${minPages}`)
  }
  doc.getPages().forEach((page, i) => {
    const { width, height } = page.getSize()
    if (Math.round(width) !== 612 || Math.round(height) !== 792) {
      issues.push(`page ${i + 1} is ${Math.round(width)}x${Math.round(height)}, expected 612x792`)
    }
  })
  return issues
}

async function main() {
  const documents = loadDocuments().filter((d) => !filter || d.id.includes(filter))
  const server = await serve()
  const downloads = await mkdtemp(join(tmpdir(), 'nexus-test-'))
  const browser = await chromium.launch({ headless: !headed })

  try {
    // The PIN gate is the reason the portal routes are not simply public, so
    // check it before unlocking anything.
    const locked = await browser.newPage()
    await locked.goto(`${BASE}/#/portal/documents`)
    await locked.waitForTimeout(500)
    const gate = await locked.locator('input[type="password"], input[inputmode="numeric"]').count()
    record('pin gate holds the portal shut', gate > 0 ? [] : ['portal reachable without unlocking'])
    await locked.close()

    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      acceptDownloads: true,
    })
    await context.addInitScript(() => {
      sessionStorage.setItem('nexus-portal-unlocked', 'yes')
      sessionStorage.setItem('nexus-admin-member', 'cfo')
    })
    await context.addInitScript(AUDIT_JS)
    const page = await context.newPage()

    for (const doc of documents.filter((d) => d.generated)) {
      for (const pass of ['empty', 'filled']) {
        await page.goto(`${BASE}/#/portal/documents`)
        await page.goto(`${BASE}/#/portal/edit/${doc.id}`)
        await waitForSheets(page)
        if (pass === 'filled') await page.evaluate(() => window.nexusFill(2))
        // Pagination measures, then packs; give the second pass a frame.
        await page.waitForTimeout(700)
        const result = await page.evaluate(() => window.nexusAudit())
        record(`${doc.id} · ${pass} · ${result.sheets ?? '?'} sheet(s)`, result.issues)
      }
    }

    // One real download per shape, read back as a PDF. The generated documents
    // all share an exporter, and the prose ones all share the cover-sheet path,
    // so one of each catches a break in either.
    const sampled = [
      documents.find((d) => d.generated && d.id === 'project-financial-status'),
      documents.find((d) => d.prose),
    ].filter(Boolean)

    for (const doc of sampled) {
      if (doc.generated) {
        await page.goto(`${BASE}/#/portal/edit/${doc.id}`)
        await waitForSheets(page)
        await page.waitForTimeout(700)
      } else {
        await page.goto(`${BASE}/#/portal/documents?tab=company`)
        await page.waitForSelector('.doc-card')
      }
      const button = doc.generated
        ? page.getByRole('button', { name: /download/i }).first()
        : page.locator('.doc-card').filter({ hasText: /charter|governance/i }).first()
            .getByRole('button', { name: /download/i })
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60_000 }),
        button.click(),
      ])
      const path = join(downloads, download.suggestedFilename())
      await download.saveAs(path)
      // A prose document gains exactly one page: the letterhead cover.
      const minPages = doc.prose ? 8 : 2
      record(`${doc.id} · downloaded PDF`, await checkPdf(path, { minPages }))
    }
  } finally {
    await browser.close()
    server.kill()
    await rm(downloads, { recursive: true, force: true })
  }

  const failed = results.filter((r) => !r.ok)
  console.log(
    failed.length
      ? `\n${failed.length} of ${results.length} checks failed.`
      : `\nAll ${results.length} checks passed.`,
  )
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
