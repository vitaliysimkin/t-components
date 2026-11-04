import { describe, it, expect } from 'vitest'
import type { Range, Decoration } from '@codemirror/state'
import { buildSearchRegExp, filterMatchingLines, parseLogLine } from '../code-editor/logView'

function classes(line: string) {
  const out: Range<Decoration>[] = []
  const ok = parseLogLine(line, 0, out)
  return { ok, marks: out.map((r) => [line.slice(r.from, r.to), r.value.spec.class]) }
}

describe('logView', () => {
  it('parses a log4net entry', () => {
    const { ok, marks } = classes("2026-10-05 12:00:01,123 [12] ERROR Supervisor Terrasoft.Core.Db Execute - failed 'x'")
    expect(ok).toBe(true)
    expect(marks).toEqual([
      ['2026-10-05 12:00:01,123', 'lx-t'],
      ['[12]', 'lx-th'],
      ['ERROR', 'lx-lv lx-lv-ERROR'],
      ['Supervisor', 'lx-u'],
      ['Terrasoft.Core.Db', 'lx-lg'],
      ['Execute', 'lx-m'],
      ["'x'", 'lx-s'],
    ])
  })

  it('parses an NLog entry with a bracketed level', () => {
    const { marks } = classes('2026-10-05 12:00:01.5 [WARN] Startup - slow')
    expect(marks).toContainEqual(['[WARN]', 'lx-lv lx-lv-WARN'])
  })

  it('treats a line without a date as a continuation', () => {
    expect(classes('   at Foo.Bar()').ok).toBe(false)
  })

  it('keeps only matching lines', () => {
    const { re } = buildSearchRegExp({ text: 'err', caseSensitive: false, regex: false, wholeWord: false })
    expect(filterMatchingLines('a\nERROR b\nc\nerr d', re!)).toBe('ERROR b\nerr d')
  })

  it('builds whole-word, regex and invalid expressions', () => {
    const word = buildSearchRegExp({ text: 'a.b', caseSensitive: true, regex: false, wholeWord: true }).re!
    expect(word.test('x a.b y')).toBe(true)
    expect(new RegExp(word.source).test('axb')).toBe(false)
    expect(buildSearchRegExp({ text: '(', caseSensitive: false, regex: true, wholeWord: false }).error).toBeTruthy()
  })
})
