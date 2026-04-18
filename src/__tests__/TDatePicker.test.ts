import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h, ref, nextTick } from 'vue'
import TDatePicker from '../components/TDatePicker.vue'

function findDayCell(container: HTMLElement, day: number): HTMLElement {
  // Day cells are rendered as <button class="t-date-picker__cell"> with the day number
  // as textContent. Cells from neighboring months share the same class, so we restrict
  // to those without the "other" modifier.
  const cells = Array.from(container.querySelectorAll<HTMLElement>('button.t-date-picker__cell'))
  const match = cells.find(c =>
    !c.classList.contains('t-date-picker__cell--other') &&
    c.textContent?.trim() === String(day)
  )
  if (!match) throw new Error(`Day cell ${day} not found in current month view`)
  return match
}

describe('TDatePicker', () => {
  it('single mode: clicking a day emits update:modelValue with that date', async () => {
    // Start on a known month: 15 Jun 2024.
    const initial = new Date(2024, 5, 15)
    const emitted: unknown[] = []
    const { container } = render(TDatePicker, {
      props: {
        modelValue: initial,
        mode: 'single',
        'onUpdate:modelValue': (v: unknown) => emitted.push(v),
      },
    })
    await nextTick()
    const target = findDayCell(container, 10)
    await fireEvent.click(target)
    expect(emitted.length).toBe(1)
    const d = emitted[0] as Date
    expect(d instanceof Date).toBe(true)
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(5)
    expect(d.getDate()).toBe(10)
  })

  it('range mode: two clicks produce {start, end}', async () => {
    const model = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null })
    const { container } = render({
      setup() {
        return () => h(TDatePicker, {
          modelValue: model.value,
          mode: 'range',
          'onUpdate:modelValue': (v: { start: Date | null; end: Date | null }) => {
            model.value = v
          },
        })
      },
    })
    await nextTick()
    // First click: 5th
    await fireEvent.click(findDayCell(container as HTMLElement, 5))
    await nextTick()
    expect(model.value.start).toBeInstanceOf(Date)
    expect(model.value.end).toBeNull()
    // Second click: 20th -> {start: 5, end: 20}
    await fireEvent.click(findDayCell(container as HTMLElement, 20))
    await nextTick()
    expect(model.value.start).toBeInstanceOf(Date)
    expect(model.value.end).toBeInstanceOf(Date)
    expect(model.value.start!.getDate()).toBe(5)
    expect(model.value.end!.getDate()).toBe(20)
  })

  it('range mode: swaps start/end when second click is before the first', async () => {
    // Covers TDatePicker.vue:378-380 — if end < start, they are swapped so the range
    // is always in chronological order.
    const model = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null })
    const { container } = render({
      setup() {
        return () => h(TDatePicker, {
          modelValue: model.value,
          mode: 'range',
          'onUpdate:modelValue': (v: { start: Date | null; end: Date | null }) => {
            model.value = v
          },
        })
      },
    })
    await nextTick()
    // First click: 20th
    await fireEvent.click(findDayCell(container as HTMLElement, 20))
    await nextTick()
    // Second click: 5th (earlier than first) → should become start, 20 becomes end.
    await fireEvent.click(findDayCell(container as HTMLElement, 5))
    await nextTick()
    expect(model.value.start!.getDate()).toBe(5)
    expect(model.value.end!.getDate()).toBe(20)
  })
})
