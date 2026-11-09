import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import TSidebar from '../components/TSidebar.vue'

const Stub = { template: '<div />' }

const menuItems = [
  { route: '/dash', title: 'Dashboard', icon: 'i:dash', group: 'Main' },
  { route: '/inbox', title: 'Inbox', icon: 'i:inbox', group: 'Main' },
  { route: '/settings', title: 'Settings', icon: 'i:settings', group: 'Admin' },
]

async function mount(props: Record<string, unknown>, initial = '/dash') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: menuItems.map((m) => ({ path: m.route, component: Stub })),
  })
  router.push(initial)
  await router.isReady()
  const result = render(TSidebar, { props: { menuItems, ...props }, global: { plugins: [router] } })
  const root = result.container.querySelector('.t-sidebar') as HTMLElement
  return { ...result, router, root }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('TSidebar', () => {
  it('defaults to expandMode="handle": edge handle toggles, no pin, plain logo', async () => {
    const { root, emitted } = await mount({ collapsed: true, headerIcon: 'i:logo' })
    expect(root.querySelector('.t-sidebar__pin')).toBeNull()
    expect(root.querySelector('.t-sidebar__logo')?.tagName).toBe('SPAN')
    const handle = root.querySelector('.t-sidebar__handle') as HTMLButtonElement
    expect(handle.getAttribute('aria-expanded')).toBe('false')
    expect(handle.getAttribute('aria-label')).toBe('Розгорнути')
    const panel = root.querySelector('.t-sidebar__panel') as HTMLElement
    expect(panel.id).toBeTruthy()
    expect(handle.getAttribute('aria-controls')).toBe(panel.id)

    await fireEvent.click(handle)
    expect(emitted()['update:collapsed']).toEqual([[false]])
    expect(emitted().toggle).toEqual([[false]])
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(false)
    expect(handle.getAttribute('aria-expanded')).toBe('true')
    expect(handle.getAttribute('aria-label')).toBe('Згорнути')
  })

  it('handle uses expandIcon / collapseIcon when given, else the built-in chevron', async () => {
    const { root, rerender } = await mount({ collapsed: true, expandIcon: 'i:open' })
    expect(root.querySelector('.t-sidebar__chevron')).toBeNull()
    await rerender({ collapsed: false })
    expect(root.querySelector('.t-sidebar__chevron')).not.toBeNull()
    await rerender({ collapseIcon: 'i:close' })
    expect(root.querySelector('.t-sidebar__chevron')).toBeNull()
  })

  it('expandOnBodyClick expands the collapsed panel; nav item clicks do not', async () => {
    const { root, emitted } = await mount({ collapsed: true })
    await fireEvent.click(root.querySelector('.t-sidebar__nav-item') as HTMLElement)
    expect(emitted()['update:collapsed']).toBeUndefined()
    await fireEvent.click(root.querySelector('.t-sidebar__panel') as HTMLElement)
    expect(emitted()['update:collapsed']).toEqual([[false]])
  })

  it('renders one active card and marks the active item', async () => {
    const { root, router } = await mount({ collapsed: false }, '/inbox')
    expect(root.querySelectorAll('.t-sidebar__card').length).toBe(1)
    expect(root.querySelector('.t-sidebar__nav-item--active')?.textContent).toContain('Inbox')
    await router.push('/settings')
    await nextTick()
    expect(root.querySelector('.t-sidebar__nav-item--active')?.textContent).toContain('Settings')
    expect(root.querySelectorAll('.t-sidebar__card').length).toBe(1)
  })

  it('numbers rows for the label stagger', async () => {
    const { root } = await mount({ collapsed: false })
    const ns = [...root.querySelectorAll<HTMLElement>('.t-sidebar__group-title, .t-sidebar__nav-item')]
      .map((el) => el.style.getPropertyValue('--n'))
    expect(ns).toEqual(['1', '2', '3', '4', '5'])
  })

  it('peek: hover peeks after the intent delay without changing collapsed, leave closes', async () => {
    vi.useFakeTimers()
    const { root, emitted } = await mount({ collapsed: true, expandMode: 'peek' })
    expect(root.querySelector('.t-sidebar__handle')).toBeNull()

    await fireEvent.mouseEnter(root)
    vi.advanceTimersByTime(299)
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(false)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(true)
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(true)
    expect(emitted()['update:collapsed']).toBeUndefined()

    await fireEvent.mouseLeave(root)
    expect(root.classList.contains('t-sidebar--peek')).toBe(false)
  })

  it('peek: leaving before the delay does not peek', async () => {
    vi.useFakeTimers()
    const { root } = await mount({ collapsed: true, expandMode: 'peek' })
    await fireEvent.mouseEnter(root)
    await fireEvent.mouseLeave(root)
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(false)
  })

  it('peek: the pin is first in the tab order, keyboard focus peeks and stays open on mouse leave', async () => {
    const { root } = await mount({ collapsed: true, expandMode: 'peek' })
    const pin = root.querySelector('.t-sidebar__pin') as HTMLButtonElement
    expect(pin.tabIndex).toBe(0)
    const focusables = root.querySelectorAll('button, a[href]')
    expect(focusables[0]).toBe(pin)

    pin.focus()
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(true)

    await fireEvent.mouseEnter(root)
    await fireEvent.mouseLeave(root)
    expect(root.classList.contains('t-sidebar--peek')).toBe(true)

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(false)
    outside.remove()
  })

  it('peek: pin emits update:collapsed false, unpin collapses', async () => {
    const { root, emitted, rerender } = await mount({ collapsed: true, expandMode: 'peek' })
    const pin = root.querySelector('.t-sidebar__pin') as HTMLButtonElement
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    expect(pin.getAttribute('aria-label')).toBe('Закріпити')

    await fireEvent.click(pin)
    expect(emitted()['update:collapsed']).toEqual([[false]])
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(false)
    expect(pin.getAttribute('aria-pressed')).toBe('true')
    await rerender({ collapsed: false })

    await fireEvent.click(pin)
    expect(emitted()['update:collapsed']).toEqual([[false], [true]])
    expect(pin.getAttribute('aria-label')).toBe('Закріпити')
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(true)
  })

  it('peek: a click on the peeked panel background does not pin', async () => {
    vi.useFakeTimers()
    const { root, emitted } = await mount({ collapsed: true, expandMode: 'peek' })
    await fireEvent.mouseEnter(root)
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(true)
    await fireEvent.click(root.querySelector('.t-sidebar__panel') as HTMLElement)
    expect(emitted()['update:collapsed']).toBeUndefined()
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(true)
  })

  it('chevron points › / ‹ by state and position', async () => {
    const left = (r: HTMLElement) => r.querySelector('.t-sidebar__chevron')!.classList.contains('t-sidebar__chevron--left')
    const { root, rerender } = await mount({ collapsed: true })
    expect(left(root)).toBe(false)
    await rerender({ collapsed: false })
    expect(left(root)).toBe(true)
    await rerender({ position: 'right' })
    expect(left(root)).toBe(false)
    await rerender({ collapsed: true })
    expect(left(root)).toBe(true)
  })

  it('peek: Escape closes the peek', async () => {
    const { root } = await mount({ collapsed: true, expandMode: 'peek' })
    const pin = root.querySelector('.t-sidebar__pin') as HTMLButtonElement
    pin.focus()
    await nextTick()
    expect(root.classList.contains('t-sidebar--peek')).toBe(true)
    await fireEvent.keyDown(pin, { key: 'Escape' })
    expect(root.classList.contains('t-sidebar--peek')).toBe(false)
    expect(root.classList.contains('t-sidebar--collapsed')).toBe(true)
  })

  it('re-places the active card when the nav resizes', async () => {
    const callbacks: (() => void)[] = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb: () => void) { callbacks.push(cb) }
      observe() {}
      disconnect() {}
    })
    let top = 0
    const spy = vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(() => top)
    try {
      const { root } = await mount({ collapsed: false }, '/inbox')
      const card = root.querySelector('.t-sidebar__card') as HTMLElement
      expect(card.style.transform).toBe('translateY(0px)')
      top = 40
      callbacks.forEach((cb) => cb())
      await nextTick()
      expect(card.style.transform).toBe('translateY(40px)')
    } finally {
      spy.mockRestore()
      vi.unstubAllGlobals()
    }
  })

  it('slots get the visual collapsed state (false while peeking)', async () => {
    vi.useFakeTimers()
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: Stub }] })
    router.push('/')
    await router.isReady()
    const { container } = render(TSidebar, {
      props: { menuItems: [], collapsed: true, expandMode: 'peek' },
      slots: { footer: '<template #footer="{ collapsed }"><i class="f">{{ collapsed }}</i></template>' },
      global: { plugins: [router] },
    })
    const root = container.querySelector('.t-sidebar') as HTMLElement
    expect(container.querySelector('.f')?.textContent).toBe('true')
    await fireEvent.mouseEnter(root)
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(container.querySelector('.f')?.textContent).toBe('false')
  })
})
