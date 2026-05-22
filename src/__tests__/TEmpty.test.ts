import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { h } from 'vue'
import TEmpty from '../components/TEmpty.vue'

describe('TEmpty', () => {
  it('renders description prop', () => {
    const { getByText } = render(TEmpty, { props: { description: 'Nothing here yet' } })
    expect(getByText('Nothing here yet')).not.toBeNull()
  })

  it('does not render description element when prop is absent', () => {
    const { container } = render(TEmpty)
    expect(container.querySelector('.t-empty__description')).toBeNull()
  })

  it('renders the default icon when no icon prop is provided', () => {
    const { container } = render(TEmpty)
    const iconEl = container.querySelector('[data-icon]')
    expect(iconEl).not.toBeNull()
    expect(iconEl?.getAttribute('data-icon')).toBe('material-symbols-light:inbox-outline')
  })

  it('renders a custom icon via icon prop', () => {
    const { container } = render(TEmpty, { props: { icon: 'system-uicons:search' } })
    const iconEl = container.querySelector('[data-icon]')
    expect(iconEl?.getAttribute('data-icon')).toBe('system-uicons:search')
  })

  it('renders default slot content below description', () => {
    const { container } = render({
      setup() {
        return () =>
          h(TEmpty, { description: 'Empty' }, {
            default: () => h('button', 'Reload'),
          })
      },
    })
    const content = container.querySelector('.t-empty__content')
    expect(content).not.toBeNull()
    expect(content?.querySelector('button')?.textContent).toBe('Reload')
  })

  it('does not render content wrapper when default slot is absent', () => {
    const { container } = render(TEmpty, { props: { description: 'No data' } })
    expect(container.querySelector('.t-empty__content')).toBeNull()
  })

  it('renders custom icon via icon slot (overrides icon prop)', () => {
    const { container } = render({
      setup() {
        return () =>
          h(TEmpty, {}, {
            icon: () => h('span', { class: 'custom-icon' }, '★'),
          })
      },
    })
    // Custom slot content is rendered inside .t-empty__icon
    expect(container.querySelector('.custom-icon')).not.toBeNull()
    // The default <Icon> component should NOT be rendered when slot is filled
    expect(container.querySelector('[data-icon]')).toBeNull()
  })
})
