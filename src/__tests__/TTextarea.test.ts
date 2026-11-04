import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import TTextarea from '../components/TTextarea.vue'

describe('TTextarea', () => {
  it('passes id and aria-* to <textarea>, class and style to the root', () => {
    const { container } = render(TTextarea, {
      attrs: { id: 'x', 'aria-label': 'y', class: 'extra', style: 'margin-top: 0' },
    })
    const root = container.firstElementChild as HTMLElement
    const field = container.querySelector('textarea') as HTMLTextAreaElement
    expect(field.id).toBe('x')
    expect(field.getAttribute('aria-label')).toBe('y')
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.getAttribute('style')).toContain('margin-top')
    expect(root.hasAttribute('id')).toBe(false)
    expect(field.classList.contains('extra')).toBe(false)
  })
})
