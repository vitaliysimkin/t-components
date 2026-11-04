import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import TLogPane from '../components/TLogPane.vue'

const lines = [
  { id: 1, text: 'ok', kind: 'out' as const },
  { id: 2, text: 'boom', kind: 'err' as const, prefix: '[x]' },
  { id: 3, text: 'careful', kind: 'warn' as const },
]

describe('TLogPane', () => {
  it('renders lines with a class by kind', () => {
    const { getByText } = render(TLogPane, { props: { lines } })
    expect(getByText('ok').className).toBe('is-out')
    expect(getByText('boom').className).toBe('is-err')
    expect(getByText('[x]')).toBeTruthy()
    expect(getByText('careful').className).toBe('is-warn')
  })

  it('shows the to-end button after scrolling up', async () => {
    const { getByRole, queryByRole } = render(TLogPane, { props: { lines, toEndLabel: 'To end' } })
    expect(queryByRole('button', { name: 'To end' })).toBeNull()
    const log = getByRole('log')
    Object.defineProperty(log, 'scrollHeight', { value: 1000 })
    Object.defineProperty(log, 'clientHeight', { value: 100 })
    log.scrollTop = 0
    await fireEvent.scroll(log)
    await fireEvent.click(getByRole('button', { name: 'To end' }))
    expect(queryByRole('button', { name: 'To end' })).toBeNull()
  })
})
