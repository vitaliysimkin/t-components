import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import TSplitPane from '../components/TSplitPane.vue'

function setup(props: Record<string, unknown> = {}) {
  const updates: number[] = []
  const ends: number[] = []
  const utils = render(TSplitPane, {
    props: {
      'onUpdate:modelValue': (v: number) => updates.push(v),
      'onResize-end': (v: number) => ends.push(v),
      ...props,
    },
    slots: { start: 'Left', end: 'Right' },
  })
  const handle = utils.container.querySelector('[role="separator"]') as HTMLElement
  const start = utils.container.querySelector('.t-split-pane__start') as HTMLElement
  return { ...utils, handle, start, updates, ends }
}

describe('TSplitPane', () => {
  it('renders both slots and a focusable vertical separator', () => {
    const { getByText, handle } = setup()
    expect(getByText('Left')).toBeTruthy()
    expect(getByText('Right')).toBeTruthy()
    expect(handle.getAttribute('aria-orientation')).toBe('vertical')
    expect(handle.getAttribute('tabindex')).toBe('0')
  })

  it('uses defaultSize as initial width without v-model', () => {
    const { start, handle } = setup({ defaultSize: 300 })
    expect(start.style.width).toBe('300px')
    expect(handle.getAttribute('aria-valuenow')).toBe('300')
  })

  it('applies modelValue as width', () => {
    const { start } = setup({ modelValue: 180 })
    expect(start.style.width).toBe('180px')
  })

  it('defaults to the line variant and applies the variant class', () => {
    const { container } = setup()
    expect(container.querySelector('.t-split-pane')!.classList.contains('variant-line')).toBe(true)
    const gutter = setup({ variant: 'gutter' })
    expect(gutter.container.querySelector('.t-split-pane')!.classList.contains('variant-gutter')).toBe(true)
  })

  it('ArrowRight / ArrowLeft change width by step, Shift by largeStep', async () => {
    const { handle, updates } = setup({ modelValue: 200, step: 10, largeStep: 50 })
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(updates.at(-1)).toBe(210)
    await fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true })
    expect(updates.at(-1)).toBe(160)
  })

  it('clamps to min and max', async () => {
    const { handle, updates } = setup({ modelValue: 200, min: 150, max: 250 })
    await fireEvent.keyDown(handle, { key: 'Home' })
    expect(updates.at(-1)).toBe(150)
    await fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true })
    await fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true })
    await fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true })
    expect(updates.at(-1)).toBe(250)
    expect(handle.getAttribute('aria-valuemin')).toBe('150')
    expect(handle.getAttribute('aria-valuemax')).toBe('250')
  })

  it('double click resets to defaultSize and emits resize-end', async () => {
    const { handle, updates, ends } = setup({ modelValue: 300, defaultSize: 220 })
    await fireEvent.dblClick(handle)
    expect(updates.at(-1)).toBe(220)
    expect(ends.at(-1)).toBe(220)
  })

  it('drags with the pointer and emits resize-end on release', async () => {
    const { handle, container, updates, ends } = setup({ modelValue: 200 })
    await fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 1 })
    expect(container.querySelector('.t-split-pane')!.classList.contains('is-dragging')).toBe(true)
    await fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 })
    expect(updates.at(-1)).toBe(240)
    await fireEvent.pointerUp(handle, { clientX: 140, pointerId: 1 })
    expect(ends.at(-1)).toBe(240)
    expect(container.querySelector('.t-split-pane')!.classList.contains('is-dragging')).toBe(false)
  })
})
