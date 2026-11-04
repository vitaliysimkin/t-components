/**
 * Minimal Markdown → HTML, no dependencies. XSS-safe by construction: all text
 * is escaped first and only this module emits tags (p, br, h3–h6, strong, em,
 * del, code, pre, ul/ol/li, table, blockquote, hr, a). Links: only `http(s)://`,
 * `/…` and `#…`, opened with target=_blank rel=noopener.
 * Supported: paragraphs (line breaks kept as <br>), # headings, `-` `*` `+` `1.` lists
 * (nested by indent), GFM tables, ``` code, > quotes, ---, `code`, **bold**,
 * *italic*, ~~strike~~, [text](url). Everything else is plain text.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const SAFE_URL = /^(https?:\/\/|\/|#)/i

/** Inline markup within one block. */
function renderInline(src: string): string {
  const codes: string[] = []
  // `code` → placeholder, so other markup inside it is not parsed
  let s = src.replace(/`([^`]+)`/g, (_, c: string) => `\u0000${codes.push(`<code>${esc(c)}</code>`) - 1}\u0000`)
  s = esc(s)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text: string, url: string) =>
    SAFE_URL.test(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>` : m)
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>')
  s = s.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
  s = s.replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?![*\w])/g, '$1<em>$2</em>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)] ?? '')
}

const FENCE = /^\s*```/
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/
const HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/
const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const QUOTE = /^\s{0,3}>\s?(.*)$/
const TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

const isTableStart = (lines: string[], i: number) =>
  lines[i]!.includes('|') && i + 1 < lines.length && lines[i + 1]!.includes('-') && TABLE_SEP.test(lines[i + 1]!)

function splitRow(line: string): string[] {
  let t = line.trim()
  if (t.startsWith('|')) t = t.slice(1)
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1)
  const cells: string[] = []
  let cur = ''
  let inCode = false
  for (let k = 0; k < t.length; k++) {
    const ch = t[k]
    if (ch === '\\' && t[k + 1] === '|') { cur += '|'; k++; continue }
    if (ch === '`') inCode = !inCode
    if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = '' } else cur += ch
  }
  cells.push(cur.trim())
  return cells
}

function renderTable(rows: string[]): string {
  const aligns = splitRow(rows[1]!).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''))
  const cell = (tag: string, c: string, k: number) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}>${renderInline(c)}</${tag}>`
  const head = splitRow(rows[0]!).map((c, k) => cell('th', c, k)).join('')
  const body = rows.slice(2).map((r) => `<tr>${splitRow(r).map((c, k) => cell('td', c, k)).join('')}</tr>`).join('')
  return `<div class="t-markdown__table"><table><thead><tr>${head}</tr></thead>${body ? `<tbody>${body}</tbody>` : ''}</table></div>`
}

interface ListItem { indent: number; ordered: boolean; lines: string[] }

function renderList(items: ListItem[], from: number, to: number): string {
  const indent = items[from]!.indent
  const tag = items[from]!.ordered ? 'ol' : 'ul'
  let html = ''
  let i = from
  while (i < to) {
    let j = i + 1
    while (j < to && items[j]!.indent > indent) j++
    const text = items[i]!.lines.map(renderInline).join('<br>')
    html += `<li>${text}${j > i + 1 ? renderList(items, i + 1, j) : ''}</li>`
    i = j
  }
  return `<${tag}>${html}</${tag}>`
}

/** Markdown → safe HTML (for v-html). */
export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let i = 0
  const startsBlock = (k: number) =>
    FENCE.test(lines[k]!) || HEADING.test(lines[k]!) || HR.test(lines[k]!) || LIST.test(lines[k]!) || QUOTE.test(lines[k]!) || isTableStart(lines, k)

  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) { i++; continue }

    if (FENCE.test(line)) {
      const code: string[] = []
      i++
      while (i < lines.length && !FENCE.test(lines[i]!)) code.push(lines[i++]!)
      i++ // closing ```
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
      continue
    }
    const h = HEADING.exec(line)
    if (h) {
      const level = Math.min(h[1]!.length + 2, 6)
      out.push(`<h${level}>${renderInline(h[2]!)}</h${level}>`)
      i++
      continue
    }
    if (HR.test(line)) { out.push('<hr>'); i++; continue }
    if (isTableStart(lines, i)) {
      const rows = [lines[i]!, lines[i + 1]!]
      i += 2
      while (i < lines.length && lines[i]!.trim() && lines[i]!.includes('|')) rows.push(lines[i++]!)
      out.push(renderTable(rows))
      continue
    }
    if (QUOTE.test(line)) {
      const q: string[] = []
      while (i < lines.length && QUOTE.test(lines[i]!)) q.push(QUOTE.exec(lines[i++]!)![1]!)
      out.push(`<blockquote>${renderMarkdown(q.join('\n'))}</blockquote>`)
      continue
    }
    if (LIST.test(line)) {
      const items: ListItem[] = []
      while (i < lines.length) {
        const m = LIST.exec(lines[i]!)
        if (m) {
          const indent = m[1]!.replace(/\t/g, '    ').length
          // a different list type (1. after -) at the top level starts a new list
          if (items.length && indent <= items[0]!.indent && /\d/.test(m[2]!) !== items[0]!.ordered) break
          items.push({ indent, ordered: /\d/.test(m[2]!), lines: [m[3]!] })
          i++
        } else if (lines[i]!.trim() && /^\s+/.test(lines[i]!) && !startsBlock(i)) {
          items[items.length - 1]!.lines.push(lines[i]!.trim()) // indented continuation of the item
          i++
        } else break
      }
      out.push(renderList(items, 0, items.length))
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i]!.trim() && (para.length === 0 || !startsBlock(i))) para.push(lines[i++]!)
    out.push(`<p>${para.map(renderInline).join('<br>')}</p>`)
  }
  return out.join('')
}
