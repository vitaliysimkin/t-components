import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import TSelect from '../components/TSelect.vue'

// Helper: open the dropdown by clicking on the trigger wrapper. TDropdown uses a
// click-toggle on the trigger element.
async function openSelect(container: HTMLElement) {
  const trigger = container.querySelector('.t-select__trigger') as HTMLElement
  expect(trigger).not.toBeNull()
  await fireEvent.click(trigger)
  await nextTick()
}

describe('TSelect', () => {
  it('valueMode "option" emits the whole option object', async () => {
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ]
    const captured: unknown[] = []
    const { container } = render(TSelect, {
      props: {
        options,
        modelValue: null,
        valueMode: 'option',
        'onUpdate:modelValue': (v: unknown) => captured.push(v),
      },
    })
    await openSelect(container)
    const items = document.querySelectorAll('.t-select__item')
    expect(items.length).toBe(2)
    await fireEvent.click(items[0])
    expect(captured[0]).toEqual({ value: 1, label: 'One' })
  })

  it('valueMode "value" emits only the primitive value', async () => {
    const options = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]
    const captured: unknown[] = []
    const { container } = render(TSelect, {
      props: {
        options,
        modelValue: null,
        valueMode: 'value',
        'onUpdate:modelValue': (v: unknown) => captured.push(v),
      },
    })
    await openSelect(container)
    const items = document.querySelectorAll('.t-select__item')
    await fireEvent.click(items[1])
    expect(captured[0]).toBe('b')
  })

  // Falsy-value bug: `isSelected` starts with `if (!props.modelValue) return false`,
  // which short-circuits valid falsy values (0, '', false). The selected option
  // won't get the `t-select__item--selected` class even though its value matches.
  // Scope of fix: task #05. Here we only document the current (buggy) behavior via
  // `it.fails` so the test turns green the moment #05 lands.
  it.fails('marks option with value 0 as selected (falsy-bug, fixed in #05)', async () => {
    const options = [
      { value: 0, label: 'Zero' },
      { value: 1, label: 'One' },
    ]
    const { container } = render(TSelect, {
      props: {
        options,
        modelValue: 0,
        valueMode: 'value',
      },
    })
    await openSelect(container)
    const items = document.querySelectorAll('.t-select__item')
    // Expectation once the bug is fixed: first item (value 0) is marked as selected.
    expect(items[0].classList.contains('t-select__item--selected')).toBe(true)
  })

  it('clicking clear resets modelValue to null and emits clear', async () => {
    const options = [{ value: 'a', label: 'Alpha' }]
    const events: Array<{ type: string; value?: unknown }> = []
    const { container } = render(TSelect, {
      props: {
        options,
        modelValue: options[0],
        clearable: true,
        valueMode: 'option',
        'onUpdate:modelValue': (v: unknown) => events.push({ type: 'update', value: v }),
        onClear: () => events.push({ type: 'clear' }),
      },
    })
    const clear = container.querySelector('.t-input-icon--clear') as HTMLElement
    expect(clear).not.toBeNull()
    await fireEvent.click(clear)
    expect(events.some(e => e.type === 'update' && e.value === null)).toBe(true)
    expect(events.some(e => e.type === 'clear')).toBe(true)
  })
})
