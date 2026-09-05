/**
 * The document list, read from the app's own registry so the suite cannot
 * quietly stop covering a document someone added.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(here, '../../src/data/documents.ts')

export function loadDocuments() {
  const src = readFileSync(SOURCE, 'utf8')
  const body = src.slice(src.indexOf('export const DOCUMENTS'))
  const entries = [...body.matchAll(/\{[^{}]*?id: '([^']+)'.*?\n {2}\}/gs)]

  return entries.map(([block, id]) => ({
    id,
    /** Documents with a generated page are laid out by the app and audited. */
    generated: /kind: 'edit'/.test(block) || /hasForm: true/.test(block),
    /** Prose contracts keep their original PDF and get a letterhead cover. */
    prose: /kind: 'view'/.test(block) && !/hasForm: true/.test(block),
    file: block.match(/file: '([^']+)'/)?.[1] ?? null,
  }))
}
