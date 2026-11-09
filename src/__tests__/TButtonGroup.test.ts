import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h, nextTick, type FunctionalComponent } from 'vue'
import TButtonGroup from '../components/TButtonGroup.vue'
import TButton from '../components/TButton.vue'

const options = [
  { value: 'a', label: 'Alpha', icon: 'system-uicons:list' },
  { value: 'b', label: 'Beta', icon: 'system-uicons:grid' },
]

describe('TButtonGroup (options mode)', () => {
  it('marks the selected option with aria-pressed; options carry the group variant and no mode of their own (from the first render, no flip on mount)', () => {
    const { getAllByRole } = render(TButtonGroup, { props: { modelValue: 'a', options } })
    const [a, b] = getAllByRole('button')
    expect(a.getAttribute('aria-pressed')).toBe('true')
    expect(b.getAttribute('aria-pressed')).toBe('false')
    for (const btn of [a, b]) {
      expect(btn.getAttribute('variant')).toBe('accent')
      expect(btn.hasAttribute('mode')).toBe(false)
    }
  })

  it('mode: segmented by default, plain on request; role="group"', async () => {
    const { getByRole, rerender } = render(TButtonGroup, { props: { modelValue: 'a', options } })
    expect(getByRole('group').classList.contains('t-button-group--segmented')).toBe(true)
    await rerender({ mode: 'plain' })
    expect(getByRole('group').classList.contains('t-button-group--plain')).toBe(true)
  })

  it('single select: click selects, click on the selected one clears; mandatory keeps it', async () => {
    const { getAllByRole, emitted, rerender } = render(TButtonGroup, { props: { modelValue: 'a', options } })
    await fireEvent.click(getAllByRole('button')[1])
    await fireEvent.click(getAllByRole('button')[0])
    expect(emitted('update:modelValue')).toEqual([['b'], [null]])
    await rerender({ mandatory: true })
    await fireEvent.click(getAllByRole('button')[0])
    expect(emitted('update:modelValue')).toHaveLength(2)
  })

  it('multi select (array v-model): toggles values, several can be pressed; mandatory keeps the last one', async () => {
    const { getAllByRole, emitted, rerender } = render(TButtonGroup, { props: { modelValue: ['a', 'b'], options } })
    expect(getAllByRole('button').map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'true'])
    await fireEvent.click(getAllByRole('button')[0])
    expect(emitted('update:modelValue')).toEqual([[['b']]])
    await rerender({ modelValue: [] })
    await fireEvent.click(getAllByRole('button')[1])
    expect(emitted('update:modelValue')[1]).toEqual([['b']])
    await rerender({ modelValue: ['b'], mandatory: true })
    await fireEvent.click(getAllByRole('button')[1])
    expect(emitted('update:modelValue')).toHaveLength(2)
  })

  it('multi select: no sliding pill (each option draws its own thumb)', () => {
    const { container } = render(TButtonGroup, { props: { modelValue: ['a'], options } })
    expect(container.querySelector('.t-button-group--multi')).not.toBeNull()
    expect(container.querySelector('.t-button-group__pill')).toBeNull()
  })

  it('icon-only option gets the square class', () => {
    const { getAllByRole } = render(TButtonGroup, {
      props: { modelValue: 'a', options, labelDisplay: 'never' },
    })
    for (const btn of getAllByRole('button')) expect(btn.classList.contains('t-button--icon')).toBe(true)
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

describe('TButtonGroup (slot mode)', () => {
  it('TButton wrapped in a plain element is not grouped: keeps its mode', async () => {
    const { getByRole } = render({
      setup: () => () => h(TButtonGroup, null, () => [h('span', [h(TButton, { label: 'Wrapped', mode: 'filled' })])]),
    })
    await nextTick()
    expect(getByRole('button', { name: 'Wrapped' }).getAttribute('mode')).toBe('filled')
  })

  it('wrapper component whose root is a TButton (direct DOM child) is grouped', async () => {
    const MyButton = () => h(TButton, { label: 'Mine', mode: 'filled' })
    const { getByRole } = render({ setup: () => () => h(TButtonGroup, null, () => [h(MyButton)]) })
    await nextTick()
    expect(getByRole('button', { name: 'Mine' }).hasAttribute('mode')).toBe(false)
  })

  it('direct child TButtons drop their mode and press ripple; nested ones keep them', async () => {
    const Wrap: FunctionalComponent = (_, { slots }) => h('span', slots.default?.())
    const { getByText, container } = render({
      setup: () => () => h(TButtonGroup, { mode: 'plain' }, () => [
        h(TButton, { label: 'Save', variant: 'accent', mode: 'filled' }),
        h(Wrap, () => h(TButton, { label: 'Nested', mode: 'filled' })),
      ]),
    })
    await nextTick()
    const save = getByText('Save').closest('button')!
    expect(save.hasAttribute('mode')).toBe(false)
    expect(save.getAttribute('variant')).toBe('accent')
    await fireEvent.pointerDown(save, { button: 0 })
    expect(container.querySelector('.t-button__ripple')).toBeNull()
    const nested = getByText('Nested').closest('button')!
    expect(nested.getAttribute('mode')).toBe('filled')
    await fireEvent.pointerDown(nested, { button: 0 })
    expect(nested.querySelector('.t-button__ripple')).not.toBeNull()
  })

  it('icon-only child gets the square class', () => {
    const { getByRole } = render({
      setup: () => () => h(TButtonGroup, null, () => [h(TButton, { icon: 'system-uicons:create', 'aria-label': 'Edit' })]),
    })
    expect(getByRole('button', { name: 'Edit' }).classList.contains('t-button--icon')).toBe(true)
  })
})

describe('TButtonGroup in <form>', () => {
  // Enter in an <input> "clicks" the form's default button: the first button[type=submit] or button without type.
  // happy-dom has no implicit submission, so check that the group gives the form no default button.
  it('Enter in an <input> does not press a segment: form has no default button', () => {
    const { container } = render({
      setup: () => () => h('form', [h('input', { type: 'text' }), h(TButtonGroup, { modelValue: 'a', options })]),
    })
    expect(container.querySelector('form')!.querySelector('button[type="submit"], button:not([type])')).toBeNull()
  })
})
