import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import TCopyField from '../components/TCopyField.vue'

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(writeText) }, configurable: true })
  return navigator.clipboard.writeText
}

describe('TCopyField', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('copies the value, emits copy and shows copiedLabel for a while', async () => {
    vi.useFakeTimers()
    const writeText = mockClipboard(() => Promise.resolve())
    const { getByRole, emitted } = render(TCopyField, { props: { value: '/data', copiedLabel: 'Done' } })
    await fireEvent.click(getByRole('button'))
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('/data')
    expect(emitted().copy).toEqual([['/data']])
    expect(getByRole('button').textContent).toContain('Done')
    vi.advanceTimersByTime(1500)
    await flushPromises()
    expect(getByRole('button').textContent).toContain('Copy')
  })

  it('emits copy-error when copying fails', async () => {
    mockClipboard(() => Promise.reject(new Error('denied')))
    document.execCommand = vi.fn(() => false)
    const { getByRole, emitted } = render(TCopyField, { props: { value: '/data' } })
    await fireEvent.click(getByRole('button'))
    await flushPromises()
    expect(emitted()['copy-error']).toEqual([['/data']])
    expect(emitted().copy).toBeUndefined()
  })
})
