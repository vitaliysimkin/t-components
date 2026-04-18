import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import TButton from '../components/TButton.vue'

describe('TButton', () => {
  it('renders label prop', () => {
    const { getByRole } = render(TButton, { props: { label: 'Click me' } })
    expect(getByRole('button').textContent).toContain('Click me')
  })

  it('renders default slot (overrides label)', () => {
    const { getByRole } = render(TButton, {
      props: { label: 'from prop' },
      slots: { default: 'from slot' },
    })
    expect(getByRole('button').textContent).toContain('from slot')
    expect(getByRole('button').textContent).not.toContain('from prop')
  })

  it('renders icon when icon prop is provided', () => {
    const { container } = render(TButton, { props: { icon: 'system-uicons:close', label: 'x' } })
    // Iconify renders an svg or a stub; check that the button has an icon child element.
    const button = container.querySelector('button.t-button')
    expect(button).not.toBeNull()
    // Iconify <Icon> renders either an <svg> or a <span>; both count as an element child besides text.
    const iconEl = button?.querySelector('svg, span')
    expect(iconEl).not.toBeNull()
  })

  it('emits click when clicked (via native DOM event)', async () => {
    let clicked = 0
    const { getByRole } = render({
      components: { TButton },
      setup() {
        return () => h(TButton, { label: 'Go', onClick: () => { clicked++ } })
      },
    })
    await fireEvent.click(getByRole('button'))
    expect(clicked).toBe(1)
  })

  it('disables pointer events via $attrs fallthrough when disabled attribute passed', () => {
    // TButton doesn't yet expose `disabled` as a prop (task #03). Fallthrough should still
    // apply the attribute to the underlying <button>, so the browser honors disabled state.
    const { getByRole } = render(TButton, { attrs: { disabled: '' }, props: { label: 'No' } })
    const btn = getByRole('button') as HTMLButtonElement
    expect(btn.hasAttribute('disabled')).toBe(true)
  })
})
