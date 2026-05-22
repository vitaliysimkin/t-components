import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { useNotifications } from '../composables/useNotifications'
import TNotifications from '../components/TNotifications.vue'

// Reset module-level singleton state between tests by clearing items & resetting id counter
// via the exported `clear` helper.
beforeEach(() => {
  const { clear } = useNotifications()
  clear()
})

// ─── composable ──────────────────────────────────────────────────────────────

describe('useNotifications — push API', () => {
  it('positional form: push(kind, text) uses default timeout', () => {
    vi.useFakeTimers()
    const { push, items } = useNotifications()
    push('info', 'hello')
    expect(items.value).toHaveLength(1)
    expect(items.value[0].text).toBe('hello')
    expect(items.value[0].onClick).toBeUndefined()
    vi.useRealTimers()
  })

  it('positional form: push(kind, text, timeoutMs) accepts numeric third arg', () => {
    vi.useFakeTimers()
    const { push, items, dismiss } = useNotifications()
    const id = push('success', 'saved', 3000)
    expect(items.value).toHaveLength(1)
    vi.advanceTimersByTime(3001)
    expect(items.value).toHaveLength(0)
    vi.useRealTimers()
  })

  it('options form: push(kind, text, { timeoutMs: 0 }) — persistent notification', () => {
    vi.useFakeTimers()
    const { push, items } = useNotifications()
    push('warning', 'persistent', { timeoutMs: 0 })
    expect(items.value).toHaveLength(1)
    vi.advanceTimersByTime(100_000)
    expect(items.value).toHaveLength(1)
    vi.useRealTimers()
  })

  it('options form: push(kind, text, { onClick }) stores the handler on the notification', () => {
    const handler = vi.fn()
    const { push, items } = useNotifications()
    push('error', 'click me', { onClick: handler })
    expect(items.value[0].onClick).toBe(handler)
  })

  it('options form: push(kind, text, { timeoutMs, onClick }) stores both', () => {
    const handler = vi.fn()
    const { push, items } = useNotifications()
    push('info', 'opts', { timeoutMs: 0, onClick: handler })
    expect(items.value[0].onClick).toBe(handler)
    expect(items.value[0].timeoutMs).toBeUndefined() // timeoutMs is not stored on Notification
  })
})

describe('useNotifications — shorthand helpers', () => {
  it('info() accepts options object with onClick', () => {
    const handler = vi.fn()
    const { info, items } = useNotifications()
    info('msg', { onClick: handler })
    expect(items.value[0].onClick).toBe(handler)
    expect(items.value[0].kind).toBe('info')
  })

  it('success() accepts options object with onClick', () => {
    const handler = vi.fn()
    const { success, items } = useNotifications()
    success('ok', { onClick: handler })
    expect(items.value[0].kind).toBe('success')
    expect(items.value[0].onClick).toBe(handler)
  })

  it('warning() accepts options object with onClick', () => {
    const handler = vi.fn()
    const { warning, items } = useNotifications()
    warning('warn', { onClick: handler })
    expect(items.value[0].kind).toBe('warning')
    expect(items.value[0].onClick).toBe(handler)
  })

  it('error() accepts options object with onClick', () => {
    const handler = vi.fn()
    const { error, items } = useNotifications()
    error('err', { onClick: handler })
    expect(items.value[0].kind).toBe('error')
    expect(items.value[0].onClick).toBe(handler)
  })

  it('shorthands still work with plain timeoutMs number', () => {
    vi.useFakeTimers()
    const { info, items } = useNotifications()
    info('quick', 100)
    expect(items.value).toHaveLength(1)
    vi.advanceTimersByTime(101)
    expect(items.value).toHaveLength(0)
    vi.useRealTimers()
  })
})

// ─── TNotifications component ─────────────────────────────────────────────

describe('TNotifications — onClick rendering', () => {
  it('notification without onClick has role="status" and no tabindex', () => {
    const { push } = useNotifications()
    push('info', 'plain')
    const { getByRole } = render(TNotifications)
    const el = getByRole('status')
    expect(el).toBeTruthy()
    expect(el.getAttribute('tabindex')).toBeNull()
    expect(el.classList.contains('t-notification--clickable')).toBe(false)
  })

  it('notification with onClick has role="button" and tabindex="0"', () => {
    const handler = vi.fn()
    const { push } = useNotifications()
    push('info', 'clickable', { onClick: handler })
    const { getByRole } = render(TNotifications)
    const el = getByRole('button', { name: 'clickable' })
    expect(el).toBeTruthy()
    expect(el.getAttribute('tabindex')).toBe('0')
    expect(el.classList.contains('t-notification--clickable')).toBe(true)
  })

  it('clicking a notification with onClick invokes the handler', async () => {
    const handler = vi.fn()
    const { push } = useNotifications()
    push('success', 'do something', { onClick: handler })
    const { getByRole } = render(TNotifications)
    const el = getByRole('button', { name: 'do something' })
    await fireEvent.click(el)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('clicking a plain notification (no onClick) dismisses it', async () => {
    const { push, items } = useNotifications()
    push('info', 'bye')
    const { getByRole } = render(TNotifications)
    const el = getByRole('status')
    await fireEvent.click(el)
    expect(items.value).toHaveLength(0)
  })

  it('close button dismisses even when onClick is set', async () => {
    const handler = vi.fn()
    const { push, items } = useNotifications()
    push('warning', 'with handler', { onClick: handler })
    const { getAllByRole } = render(TNotifications, { props: { closable: true } })
    // the close × button is a button too — find the dismiss button specifically
    const buttons = getAllByRole('button')
    const closeBtn = buttons.find(b => b.getAttribute('aria-label') === 'Dismiss')
    expect(closeBtn).toBeTruthy()
    await fireEvent.click(closeBtn!)
    expect(handler).not.toHaveBeenCalled()
    expect(items.value).toHaveLength(0)
  })
})
