import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { TMarkdown, renderMarkdown } from '../markdown'

describe('renderMarkdown', () => {
  it('escapes raw HTML', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>')
  })

  it('keeps unsafe links as text', () => {
    const html = renderMarkdown('[x](javascript:alert(1)) [ok](https://a.b)')
    expect(html).not.toContain('href="javascript')
    expect(html).toContain('[x](javascript:alert(1))')
    expect(html).toContain('<a href="https://a.b" target="_blank" rel="noopener noreferrer">ok</a>')
  })

  it('renders a table with alignment', () => {
    expect(renderMarkdown('| a | b |\n|---|--:|\n| 1 | 2 |')).toBe(
      '<div class="t-markdown__table"><table><thead><tr><th>a</th><th style="text-align:right">b</th></tr></thead>'
      + '<tbody><tr><td>1</td><td style="text-align:right">2</td></tr></tbody></table></div>',
    )
  })

  it('renders nested lists', () => {
    expect(renderMarkdown('- a\n  - b\n1. c')).toBe('<ul><li>a<ul><li>b</li></ul></li></ul><ol><li>c</li></ol>')
  })

  it('renders code blocks and inline code escaped', () => {
    expect(renderMarkdown('```\n<b>**x**</b>\n```')).toBe('<pre><code>&lt;b&gt;**x**&lt;/b&gt;</code></pre>')
    expect(renderMarkdown('`**x**` **y**')).toBe('<p><code>**x**</code> <strong>y</strong></p>')
  })
})

describe('TMarkdown', () => {
  it('renders source into .t-markdown', () => {
    const { container } = render(TMarkdown, { props: { source: '# Title' } })
    expect(container.querySelector('.t-markdown')!.innerHTML).toBe('<h3>Title</h3>')
  })
})
