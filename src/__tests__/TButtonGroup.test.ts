import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import TButtonGroup from '../components/TButtonGroup.vue'

const options = [
  { value: 'a', label: 'Alpha', icon: 'system-uicons:list' },
  { value: 'b', label: 'Beta', icon: 'system-uicons:grid' },
]

describe('TButtonGroup (options mode)', () => {
  it('renders selected segment filled with group variant, others neutral plain', () => {
    const { getAllByRole } = render(TButtonGroup, { props: { modelValue: 'a', options } })
    const [a, b] = getAllByRole('button')
    expect(a.getAttribute('mode')).toBe('filled')
    expect(a.getAttribute('variant')).toBe('accent')
    expect(a.getAttribute('aria-pressed')).toBe('true')
    expect(b.getAttribute('mode')).toBe('plain')
    expect(b.getAttribute('variant')).toBe('neutral')
    expect(b.getAttribute('aria-pressed')).toBe('false')
  })

  it('sets type="button" on every segment', () => {
    const { getAllByRole } = render(TButtonGroup, { props: { modelValue: 'a', options } })
    for (const btn of getAllByRole('button')) expect(btn.getAttribute('type')).toBe('button')
  })

  it('labelDisplay="selected": hidden labels go to title and aria-label', () => {
    const { getAllByRole } = render(TButtonGroup, {
      props: { modelValue: 'a', options, labelDisplay: 'selected' },
    })
    const [a, b] = getAllByRole('button')
    expect(a.textContent).toContain('Alpha')
    expect(a.hasAttribute('title')).toBe(false)
    expect(a.hasAttribute('aria-label')).toBe(false)
    expect(b.textContent).not.toContain('Beta')
    expect(b.getAttribute('title')).toBe('Beta')
    expect(b.getAttribute('aria-label')).toBe('Beta')
  })

  it('labelDisplay="never": every segment gets title and aria-label', () => {
    const { getAllByRole } = render(TButtonGroup, {
      props: { modelValue: 'a', options, labelDisplay: 'never' },
    })
    expect(getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Alpha', 'Beta'])
    expect(getAllByRole('button').map((b) => b.getAttribute('title'))).toEqual(['Alpha', 'Beta'])
  })
})
