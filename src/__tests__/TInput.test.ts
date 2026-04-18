import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { ref, h, nextTick } from 'vue'
import TInput from '../components/TInput.vue'

describe('TInput', () => {
  it('reflects modelValue into input value', () => {
    const { container } = render(TInput, { props: { modelValue: 'hello' } })
    const input = container.querySelector('input.t-input') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('hello')
  })

  it('emits update:modelValue on user input (v-model two-way)', async () => {
    const model = ref('')
    const { container } = render({
      setup() {
        return () => h(TInput, {
          modelValue: model.value,
          'onUpdate:modelValue': (v: string | number) => { model.value = String(v) },
        })
      },
    })
    const input = container.querySelector('input.t-input') as HTMLInputElement
    await fireEvent.update(input, 'world')
    expect(model.value).toBe('world')
  })

  it('clearable: clicking clear icon emits clear and empty string update', async () => {
    const events: Array<{ type: string; value?: unknown }> = []
    const { container } = render(TInput, {
      props: {
        modelValue: 'something',
        clearable: true,
        'onUpdate:modelValue': (v: unknown) => events.push({ type: 'update', value: v }),
        onClear: () => events.push({ type: 'clear' }),
      },
    })
    const clearIcon = container.querySelector('.t-input-icon--clear') as HTMLElement
    expect(clearIcon).not.toBeNull()
    await fireEvent.click(clearIcon)
    expect(events.some(e => e.type === 'update' && e.value === '')).toBe(true)
    expect(events.some(e => e.type === 'clear')).toBe(true)
  })

  it('clearable: clear icon not shown when modelValue is empty', () => {
    const { container } = render(TInput, { props: { modelValue: '', clearable: true } })
    expect(container.querySelector('.t-input-icon--clear')).toBeNull()
  })

  it('prefixIcon: mousedown on prefix focuses the input', async () => {
    const { container } = render(TInput, { props: { prefixIcon: 'system-uicons:search', modelValue: '' } })
    await nextTick()
    const prefix = container.querySelector('.t-input-icon--prefix') as HTMLElement
    const input = container.querySelector('input.t-input') as HTMLInputElement
    expect(prefix).not.toBeNull()
    expect(input).not.toBeNull()
    // mousedown.prevent handler calls inputRef.focus().
    await fireEvent.mouseDown(prefix)
    expect(document.activeElement).toBe(input)
  })
})
