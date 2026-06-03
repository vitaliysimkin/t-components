import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import TIcon from '../components/TIcon.vue'

describe('TIcon', () => {
  it('renders a registered icon as-is (not the fallback)', () => {
    const { container } = render(TIcon, { props: { icon: 'system-uicons:cross' } })
    const iconEl = container.querySelector('[data-icon]')
    expect(iconEl?.getAttribute('data-icon')).toBe('system-uicons:cross')
  })

  it('renders the ticon:missing fallback for an unregistered icon name', () => {
    const { container } = render(TIcon, { props: { icon: 'totally:does-not-exist' } })
    const iconEl = container.querySelector('[data-icon]')
    expect(iconEl?.getAttribute('data-icon')).toBe('ticon:missing')
    expect(iconEl?.getAttribute('title')).toContain('totally:does-not-exist')
  })

  it('renders a curated ticon: icon as-is (not the fallback)', () => {
    const { container } = render(TIcon, { props: { icon: 'ticon:close' } })
    const iconEl = container.querySelector('[data-icon]')
    expect(iconEl?.getAttribute('data-icon')).toBe('ticon:close')
  })
})
