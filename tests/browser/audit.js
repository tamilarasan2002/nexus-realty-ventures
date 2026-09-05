/**
 * Document geometry and export audit.
 *
 * Every generated document is laid out as one or more 816x1056 sheets — US
 * Letter at 96dpi — and exported by rasterising each sheet and dropping it
 * onto a 612x792 PDF page. That only produces a correct PDF if the sheets are
 * exactly the size the exporter assumes, so this checks the invariants that
 * have actually broken before:
 *
 *  - a sheet whose content overflowed its box was captured at its full scroll
 *    height and stretched across the page, throwing every proportion out;
 *  - html2canvas ran before pagination settled, capturing one tall unsplit
 *    sheet instead of the paginated ones;
 *  - the letterhead's corner triangles overlapped the contact text.
 *
 * The file is a plain script with no imports so it can be used three ways:
 * pasted into DevTools, injected by the Playwright runner beside it, or run
 * through any CDP client. It defines `window.nexusAudit` and returns nothing.
 */
;(() => {
  const PAGE_W = 816
  const PAGE_H = 1056

  /** Sheets carry `data-page` once measured; unpaginated docs render one box. */
  function sheetsOf(root) {
    const paged = [...root.querySelectorAll('[data-page]')]
    return paged.length ? paged : [root.querySelector('.receipt') || root]
  }

  /**
   * Both letterhead corner marks are 45-degree right triangles clipped to their
   * top-left, so the painted width at a given y shrinks as you descend. A plain
   * bounding-box test reports overlaps that are not there.
   */
  function paintedRightEdge(shape, pageBox, y) {
    const r = shape.getBoundingClientRect()
    const top = r.top - pageBox.top
    const left = r.left - pageBox.left
    return left + Math.max(0, r.width - (y - top))
  }

  function checkLetterhead(sheet, issues) {
    const lh = sheet.querySelector('.lh')
    if (!lh) return
    const box = sheet.getBoundingClientRect()
    const corner = lh.querySelector('.lh__corner')
    const wedge = lh.querySelector('.lh__wedge')
    for (const sel of ['.lh__name', '.lh__line:last-child', '.lh__rule']) {
      const el = lh.querySelector(sel)
      if (!el || !corner || !wedge) continue
      const r = el.getBoundingClientRect()
      const x = r.left - box.left
      const y = r.top - box.top
      if (x <= paintedRightEdge(corner, box, y)) issues.push(`${sel} sits on the orange corner`)
      if (x <= paintedRightEdge(wedge, box, y)) issues.push(`${sel} sits on the black wedge`)
    }
    if (!lh.querySelector('.lh__socials')) issues.push('letterhead social row missing')
  }

  /**
   * @param {object} opts
   * @param {(el: HTMLElement, o: object) => Promise<HTMLCanvasElement>} [opts.html2canvas]
   *   Pass the app's own html2canvas to assert the capture size too. Without
   *   it the DOM checks still run.
   */
  window.nexusAudit = async function nexusAudit({ html2canvas } = {}) {
    const root = document.querySelector('[data-print-root]')
    if (!root) return { ok: false, issues: ['no document rendered'] }

    const sheets = sheetsOf(root)
    const issues = []

    const withLetterhead = sheets.filter((s) => s.querySelector('.lh')).length
    if (withLetterhead !== 1) {
      issues.push(`letterhead appears on ${withLetterhead} sheets, expected exactly 1`)
    }

    sheets.forEach((sheet, i) => {
      const n = i + 1
      if (sheet.offsetWidth !== PAGE_W || sheet.offsetHeight !== PAGE_H) {
        issues.push(`sheet ${n} is ${sheet.offsetWidth}x${sheet.offsetHeight}, expected ${PAGE_W}x${PAGE_H}`)
      }
      if (sheet.scrollHeight > sheet.offsetHeight) {
        issues.push(`sheet ${n} overflows by ${sheet.scrollHeight - sheet.offsetHeight}px`)
      }
      if (i > 0 && !sheet.querySelector('.formdoc__runhead')) {
        issues.push(`sheet ${n} has no running head`)
      }
      const box = sheet.getBoundingClientRect()
      for (const el of sheet.querySelectorAll('td, th, p, h1, h2, h3, .lh__line')) {
        const r = el.getBoundingClientRect()
        if (r.right > box.right + 1 || r.left < box.left - 1) {
          issues.push(`sheet ${n} has content spilling outside the page box`)
          break
        }
      }
    })

    checkLetterhead(sheets[0], issues)

    if (html2canvas) {
      for (const [i, sheet] of sheets.entries()) {
        // The exporter's own options, so this fails whenever the export would.
        const canvas = await html2canvas(sheet, {
          scale: 1,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: sheet.offsetWidth,
          height: sheet.offsetHeight,
          windowWidth: sheet.offsetWidth,
          ignoreElements: (el) => el.hasAttribute?.('data-export-ignore'),
        })
        if (canvas.width !== PAGE_W || canvas.height !== PAGE_H) {
          issues.push(`sheet ${i + 1} captured at ${canvas.width}x${canvas.height}`)
        }
      }
    }

    return { ok: issues.length === 0, sheets: sheets.length, issues }
  }

  /**
   * Fills every control on the editor so pagination, long Tamil strings and
   * derived cells are exercised. `extraRows` rows are added to each table
   * first, to force at least one page break.
   */
  window.nexusFill = async function nexusFill(extraRows = 2) {
    const tick = (ms) => new Promise((r) => setTimeout(r, ms))
    const setValue = (el, v) => {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement
      Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }

    for (const button of [...document.querySelectorAll('button')].filter(
      (b) => b.textContent.trim() === '+ Add row',
    )) {
      for (let i = 0; i < extraRows; i += 1) {
        button.click()
        await tick(50)
      }
    }
    await tick(250)

    for (const el of document.querySelectorAll('input, textarea')) {
      if (el.readOnly || el.disabled || el.type === 'hidden') continue
      if (el.type === 'date') setValue(el, '2026-09-05')
      else if (el.classList.contains('input--amount')) setValue(el, '250000')
      else if (el.tagName === 'TEXTAREA')
        setValue(
          el,
          'மாதிரி உரை — இது ஒரு நீண்ட வாக்கியம், பக்க முறிவைச் சோதிக்க. ' +
            'Sample long text, to push the flow across a page break.',
        )
      else setValue(el, 'மாதிரி மதிப்பு / Sample value')
      await tick(5)
    }
    for (const select of document.querySelectorAll('select')) {
      if (select.options.length > 1) {
        select.selectedIndex = 1
        select.dispatchEvent(new Event('change', { bubbles: true }))
      }
      await tick(5)
    }
    await tick(700)
  }
})()
