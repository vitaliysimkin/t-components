import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick, defineComponent, h } from 'vue'
import TSelect from '../components/TSelect.vue'

// Helper: open the dropdown by clicking on the trigger wrapper. TDropdown uses a
// click-toggle on the trigger element.
const tick = () => new Promise(resolve => setTimeout(resolve))

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

  it('marks option with value 0 as selected', async () => {
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

  it('option scoped slot renders custom content and receives correct slot props', async () => {
    const options = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]
    // Build a wrapper component that uses the #option slot to render a data-testid
    // attribute exposing the slot props so we can assert on them.
    const Wrapper = defineComponent({
      components: { TSelect },
      setup() {
        return { options }
      },
      render() {
        return h(TSelect, {
          options: this.options,
          modelValue: { value: 'a', label: 'Alpha' },
          valueMode: 'option' as const,
        }, {
          option: ({ option, selected, active }: { option: { value: string; label: string }, selected: boolean, active: boolean }) =>
            h('span', {
              'data-testid': 'custom-option',
              'data-selected': String(selected),
              'data-active': String(active),
            }, `custom:${option.label}`),
        })
      },
    })

    const { container } = render(Wrapper)
    const trigger = container.querySelector('.t-select__trigger') as HTMLElement
    await fireEvent.click(trigger)
    await nextTick()

    const customItems = document.querySelectorAll('[data-testid="custom-option"]')
    // Both options should be rendered through the slot
    expect(customItems.length).toBe(2)
    expect(customItems[0].textContent).toBe('custom:Alpha')
    expect(customItems[1].textContent).toBe('custom:Beta')
    // First option (value 'a') matches modelValue — selected should be true
    expect(customItems[0].getAttribute('data-selected')).toBe('true')
    expect(customItems[1].getAttribute('data-selected')).toBe('false')
    // Default fallback (Icon + span) must NOT be present
    expect(container.querySelector('.t-select__icon')).toBeNull()
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

  it('valueKey / labelKey accept functions', async () => {
    const options = [{ id: 7, name: 'Seven' }]
    const captured: unknown[] = []
    const { container } = render(TSelect, {
      props: {
        options,
        modelValue: null,
        valueMode: 'value',
        valueKey: (o: { id: number }) => `k${o.id}`,
        labelKey: (o: { name: string }) => o.name.toUpperCase(),
        'onUpdate:modelValue': (v: unknown) => captured.push(v),
      },
    })
    await openSelect(container)
    const items = document.querySelectorAll('.t-select__item')
    expect(items[0].textContent).toBe('SEVEN')
    await fireEvent.click(items[0])
    expect(captured[0]).toBe('k7')
  })

  it('filterLoaded filters loaded options on the client', async () => {
    const { container } = render(TSelect, {
      props: {
        searchable: true,
        filterLoaded: true,
        debounce: 0,
        loadOptions: async () => [{ value: 1, label: 'Alpha' }, { value: 2, label: 'Beta' }],
      },
    })
    await openSelect(container)
    await tick()
    await fireEvent.update(container.querySelector('input') as HTMLInputElement, 'bE')
    await tick()
    const items = document.querySelectorAll('.t-select__item')
    expect([...items].map(i => i.textContent)).toEqual(['Beta'])
  })

  it('rejected loadOptions emits load-error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('boom')
    const errors: unknown[] = []
    try {
      const { container } = render(TSelect, {
        props: {
          loadOptions: () => Promise.reject(failure),
          onLoadError: (e: unknown) => errors.push(e),
        },
      })
      await openSelect(container)
      await tick()
      expect(errors).toEqual([failure])
    } finally {
      consoleError.mockRestore()
    }
  })
})
