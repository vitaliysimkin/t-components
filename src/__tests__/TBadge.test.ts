import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import TBadge from '../components/TBadge.vue'

describe('TBadge', () => {
  it('renders the default slot content', () => {
    const { getByText } = render(TBadge, {
      slots: { default: '<button>Inbox</button>' },
    })
    expect(getByText('Inbox')).not.toBeNull()
  })

  it('renders a numeric value', () => {
    const { container } = render(TBadge, {
      props: { value: 5 },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.textContent?.trim()).toBe('5')
  })

  it('renders a string value', () => {
    const { container } = render(TBadge, {
      props: { value: 'new' },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.textContent?.trim()).toBe('new')
  })

  it('caps numeric value at max and appends +', () => {
    const { container } = render(TBadge, {
      props: { value: 150, max: 99 },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.textContent?.trim()).toBe('99+')
  })

  it('does not cap when value <= max', () => {
    const { container } = render(TBadge, {
      props: { value: 50, max: 99 },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.textContent?.trim()).toBe('50')
  })

  it('renders dot mode with no text content', () => {
    const { container } = render(TBadge, {
      props: { dot: true, value: 5 },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge).not.toBeNull()
    expect(badge?.classList.contains('t-badge--dot')).toBe(true)
    expect(badge?.textContent?.trim()).toBe('')
  })

  it('hides the badge when hidden is true', () => {
    const { container } = render(TBadge, {
      props: { value: 3, hidden: true },
      slots: { default: '<span>Btn</span>' },
    })
    expect(container.querySelector('.t-badge')).toBeNull()
  })

  it('shows the badge when hidden is false', () => {
    const { container } = render(TBadge, {
      props: { value: 3, hidden: false },
      slots: { default: '<span>Btn</span>' },
    })
    expect(container.querySelector('.t-badge')).not.toBeNull()
  })

  it('applies variant class', () => {
    const { container } = render(TBadge, {
      props: { value: 1, variant: 'success' },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.classList.contains('t-badge--success')).toBe(true)
  })

  it('defaults to danger variant', () => {
    const { container } = render(TBadge, {
      props: { value: 1 },
      slots: { default: '<span>Btn</span>' },
    })
    const badge = container.querySelector('.t-badge')
    expect(badge?.classList.contains('t-badge--danger')).toBe(true)
  })

  it('renders wrapper with relative positioning class', () => {
    const { container } = render(TBadge, {
      props: { value: 1 },
      slots: { default: '<span>Btn</span>' },
    })
    expect(container.querySelector('.t-badge-wrapper')).not.toBeNull()
  })
})
