import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import TCopyChip from '../components/TCopyChip.vue'

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(writeText) }, configurable: true })
}

describe('TCopyChip', () => {
  it('shows label, copies value and emits copy', async () => {
    mockClipboard(() => Promise.resolve())
    const { getByRole, emitted } = render(TCopyChip, { props: { value: 'npm ci', label: 'Install', title: 'Copy command' } })
    const button = getByRole('button')
    expect(button.textContent).toContain('Install')
    expect(button.getAttribute('title')).toBe('Copy command')
    await fireEvent.click(button)
    await flushPromises()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('npm ci')
    expect(emitted().copy).toEqual([['npm ci']])
  })

  it('emits copy-error when copying fails', async () => {
    mockClipboard(() => Promise.reject(new Error('denied')))
    document.execCommand = vi.fn(() => false)
    const { getByRole, emitted } = render(TCopyChip, { props: { value: 'npm ci' } })
    await fireEvent.click(getByRole('button'))
    await flushPromises()
    expect(emitted()['copy-error']).toEqual([['npm ci']])
  })
})
