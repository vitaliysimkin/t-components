import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { h } from 'vue'
import TCard from '../components/TCard.vue'

describe('TCard', () => {
  it('renders body slot content', () => {
    const { container } = render(TCard, {
      slots: { default: 'Body content' },
    })
    const body = container.querySelector('.t-card__body')
    expect(body).not.toBeNull()
    expect(body?.textContent).toContain('Body content')
  })

  it('renders header via prop when provided', () => {
    const { container } = render(TCard, {
      props: { header: 'My Header' },
      slots: { default: 'body' },
    })
    const header = container.querySelector('.t-card__header')
    expect(header).not.toBeNull()
    expect(header?.textContent).toContain('My Header')
  })

  it('does not render header element when neither prop nor slot provided', () => {
    const { container } = render(TCard, {
      slots: { default: 'body' },
    })
    expect(container.querySelector('.t-card__header')).toBeNull()
  })

  it('header slot overrides header prop', () => {
    const { container } = render(TCard, {
      props: { header: 'from prop' },
      slots: {
        default: 'body',
        header: 'from slot',
      },
    })
    const header = container.querySelector('.t-card__header')
    expect(header?.textContent).toContain('from slot')
    expect(header?.textContent).not.toContain('from prop')
  })

  it('renders footer slot when provided', () => {
    const { container } = render(TCard, {
      slots: {
        default: 'body',
        footer: 'Footer text',
      },
    })
    const footer = container.querySelector('.t-card__footer')
    expect(footer).not.toBeNull()
    expect(footer?.textContent).toContain('Footer text')
  })

  it('does not render footer element when footer slot is absent', () => {
    const { container } = render(TCard, {
      slots: { default: 'body' },
    })
    expect(container.querySelector('.t-card__footer')).toBeNull()
  })

  it('renders all three sections together', () => {
    const { container } = render(TCard, {
      props: { header: 'Title' },
      slots: {
        default: 'Main body',
        footer: 'Footer area',
      },
    })
    expect(container.querySelector('.t-card__header')?.textContent).toContain('Title')
    expect(container.querySelector('.t-card__body')?.textContent).toContain('Main body')
    expect(container.querySelector('.t-card__footer')?.textContent).toContain('Footer area')
  })

  it('renders with header slot as VNode', () => {
    const { container } = render({
      setup() {
        return () =>
          h(TCard, null, {
            default: () => 'body',
            header: () => h('strong', 'Bold Header'),
          })
      },
    })
    const header = container.querySelector('.t-card__header')
    expect(header).not.toBeNull()
    expect(header?.querySelector('strong')).not.toBeNull()
  })
})
