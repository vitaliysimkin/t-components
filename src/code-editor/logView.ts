// Log viewer extension for CodeMirror 6: log4net / NLog entry highlighting and search-match marks.
// Both layouts share one line shape: `date [thread] LEVEL user logger method - message`; thread/user/logger/method are optional.
// A line without a leading date continues the previous entry (stack trace etc.).
// Decorations are built only for `view.visibleRanges`; the full-text search runs in the component.
import { type Extension, Prec, type Range, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view'

/** `auto` — highlight when the first lines contain dated entries; log4net and NLog share one parser. */
export type LogFormat = 'auto' | 'log4net' | 'nlog' | 'none'

export interface LogSearchState {
  /** Global (`g`) expression, or null — no search. */
  re: RegExp | null
  /** Current match, highlighted brighter. */
  current: { from: number; to: number } | null
}

export interface LogSearchQuery {
  text: string
  caseSensitive: boolean
  regex: boolean
  wholeWord: boolean
}

/** Search expression: null for an empty query; `error` for an invalid regular expression. */
export function buildSearchRegExp(q: LogSearchQuery): { re: RegExp | null; error: string | null } {
  if (!q.text) return { re: null, error: null }
  let source = q.regex ? q.text : q.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (q.wholeWord) source = `\\b(?:${source})\\b`
  try {
    return { re: new RegExp(source, q.caseSensitive ? 'g' : 'gi'), error: null }
  } catch (e) {
    return { re: null, error: e instanceof Error ? e.message : String(e) }
  }
}

/** All matches (positions up to `limit`, full count in `total`); empty matches are skipped. */
export function findMatches(text: string, re: RegExp, limit: number): { positions: { from: number; to: number }[]; total: number } {
  const positions: { from: number; to: number }[] = []
  let total = 0
  const r = new RegExp(re.source, re.flags)
  let m: RegExpExecArray | null
  while ((m = r.exec(text)) !== null) {
    if (m[0].length === 0) { r.lastIndex++; continue }
    if (positions.length < limit) positions.push({ from: m.index, to: m.index + m[0].length })
    total++
  }
  return { positions, total }
}

/** Only the lines that contain a match. */
export function filterMatchingLines(text: string, re: RegExp): string {
  const r = new RegExp(re.source, re.flags.replace('g', ''))
  return text.split('\n').filter((l) => r.test(l)).join('\n')
}

export const setLogFormat = StateEffect.define<LogFormat>()
export const setLogSearch = StateEffect.define<LogSearchState>()

const HEAD_RE = /^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,7})?)/
const THREAD_RE = /^ +(\[[^\]\n]{0,80}\])/
const LEVEL_RE = /^ +(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\b/
const BRACKET_LEVEL_RE = /^\[(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\]$/
const QUOTED_RE = /'[^'\n]{0,300}'|"[^"\n]{0,300}"/g
const DETECT_LINES = 200

const mark = (cls: string) => Decoration.mark({ class: cls })
const D = {
  time: mark('lx-t'), thread: mark('lx-th'), user: mark('lx-u'), logger: mark('lx-lg'), method: mark('lx-m'), str: mark('lx-s'),
  cont: Decoration.line({ class: 'lx-cont' }),
  hit: mark('lx-hit'), cur: mark('lx-hit lx-cur'),
}
const levelMarks = new Map<string, Decoration>()
function levelMark(level: string): Decoration {
  let d = levelMarks.get(level)
  if (!d) { d = mark(`lx-lv lx-lv-${level}`); levelMarks.set(level, d) }
  return d
}

/** Parses one entry line into sorted marks. Returns false when the line does not start with a date. */
export function parseLogLine(text: string, base: number, out: Range<Decoration>[]): boolean {
  const head = HEAD_RE.exec(text)
  if (!head) return false
  let pos = head[0].length
  out.push(D.time.range(base, base + pos))
  let level: string | null = null

  const th = THREAD_RE.exec(text.slice(pos))
  if (th) {
    const start = pos + th[0].length - th[1]!.length
    const bl = BRACKET_LEVEL_RE.exec(th[1]!)
    if (bl) level = bl[1]!
    out.push((bl ? levelMark(bl[1]!) : D.thread).range(base + start, base + start + th[1]!.length))
    pos += th[0].length
  }
  if (!level) {
    const lv = LEVEL_RE.exec(text.slice(pos))
    if (lv) {
      const start = pos + lv[0].length - lv[1]!.length
      level = lv[1]!
      out.push(levelMark(level).range(base + start, base + start + level.length))
      pos += lv[0].length
    }
  }

  let msgStart = pos
  const sep = text.indexOf(' - ', pos)
  if (level && sep > pos) {
    // Header between level and ` - `: last word — method, dotted word before it — logger, the rest — user.
    const words: { from: number; to: number; text: string }[] = []
    const wre = /\S+/g
    const headText = text.slice(pos, sep)
    let w: RegExpExecArray | null
    while ((w = wre.exec(headText)) !== null) words.push({ from: pos + w.index, to: pos + w.index + w[0].length, text: w[0] })
    if (words.length === 1) {
      out.push(D.logger.range(base + words[0]!.from, base + words[0]!.to))
    } else if (words.length > 1) {
      const method = words[words.length - 1]!
      const prev = words[words.length - 2]!
      const hasLogger = prev.text.includes('.')
      const userEnd = words.length - (hasLogger ? 2 : 1)
      if (userEnd > 0) out.push(D.user.range(base + words[0]!.from, base + words[userEnd - 1]!.to))
      if (hasLogger) out.push(D.logger.range(base + prev.from, base + prev.to))
      out.push(D.method.range(base + method.from, base + method.to))
    }
    msgStart = sep + 3
  }
  quoted(text, msgStart, base, out)
  return true
}

function quoted(text: string, from: number, base: number, out: Range<Decoration>[]) {
  QUOTED_RE.lastIndex = from
  let q: RegExpExecArray | null
  while ((q = QUOTED_RE.exec(text)) !== null) out.push(D.str.range(base + q.index, base + q.index + q[0].length))
}

function detect(view: EditorView): boolean {
  const doc = view.state.doc
  const n = Math.min(doc.lines, DETECT_LINES)
  for (let i = 1; i <= n; i++) if (HEAD_RE.test(doc.line(i).text)) return true
  return false
}

function buildSyntax(view: EditorView, enabled: boolean): DecorationSet {
  if (!enabled) return Decoration.none
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc
  const marks: Range<Decoration>[] = []
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = doc.lineAt(pos)
      marks.length = 0
      if (!parseLogLine(line.text, line.from, marks) && line.length > 0) {
        builder.add(line.from, line.from, D.cont)
        quoted(line.text, 0, line.from, marks)
      }
      for (const m of marks) builder.add(m.from, m.to, m.value)
      pos = line.to + 1
    }
  }
  return builder.finish()
}

function buildHits(view: EditorView, s: LogSearchState): DecorationSet {
  if (!s.re) return Decoration.none
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc
  const r = new RegExp(s.re.source, s.re.flags)
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = doc.lineAt(pos)
      r.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = r.exec(line.text)) !== null) {
        if (m[0].length === 0) { r.lastIndex++; continue }
        const a = line.from + m.index
        const b = a + m[0].length
        builder.add(a, b, s.current && s.current.from === a && s.current.to === b ? D.cur : D.hit)
      }
      pos = line.to + 1
    }
  }
  return builder.finish()
}

/**
 * Log viewer extension. `initial*` seed the state fields when the editor is created;
 * later changes go through `setLogFormat` / `setLogSearch` effects. `onFind` — Ctrl+F in the editor.
 */
export function logViewExtension(opts: {
  initialFormat: () => LogFormat
  initialSearch: () => LogSearchState
  onFind: () => void
}): Extension {
  const formatField = StateField.define<LogFormat>({
    create: opts.initialFormat,
    update: (v, tr) => tr.effects.reduce((acc, e) => (e.is(setLogFormat) ? e.value : acc), v),
  })
  const searchField = StateField.define<LogSearchState>({
    create: opts.initialSearch,
    update: (v, tr) => {
      let next = tr.docChanged ? { re: v.re, current: null } : v
      for (const e of tr.effects) if (e.is(setLogSearch)) next = e.value
      return next
    },
  })

  const syntax = ViewPlugin.fromClass(class {
    decorations: DecorationSet
    detected: boolean
    constructor(view: EditorView) {
      this.detected = detect(view)
      this.decorations = buildSyntax(view, this.enabled(view))
    }
    enabled(view: EditorView): boolean {
      const f = view.state.field(formatField)
      return f === 'auto' ? this.detected : f !== 'none'
    }
    update(u: ViewUpdate) {
      if (u.docChanged) this.detected = detect(u.view)
      if (u.docChanged || u.viewportChanged || u.startState.field(formatField) !== u.state.field(formatField)) {
        this.decorations = buildSyntax(u.view, this.enabled(u.view))
      }
    }
  }, { decorations: (p) => p.decorations })

  const hits = ViewPlugin.fromClass(class {
    decorations: DecorationSet
    constructor(view: EditorView) { this.decorations = buildHits(view, view.state.field(searchField)) }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged || u.startState.field(searchField) !== u.state.field(searchField)) {
        this.decorations = buildHits(u.view, u.state.field(searchField))
      }
    }
  }, { decorations: (p) => p.decorations })

  const findKey = Prec.highest(EditorView.domEventHandlers({
    keydown: (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && ev.key.toLowerCase() === 'f') {
        ev.preventDefault()
        opts.onFind()
        return true
      }
      return false
    },
  }))

  return [formatField, searchField, syntax, hits, findKey]
}
