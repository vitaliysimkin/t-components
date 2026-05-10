import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick, h } from 'vue'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import TBottomNav from '../components/TBottomNav.vue'

const Stub = { template: '<div />' }

const menuItems = [
  { route: '/dash', title: 'Dashboard', icon: 'i:dash' },
  { route: '/inbox', title: 'Inbox', icon: 'i:inbox' },
  { route: '/cal', title: 'Calendar', icon: 'i:cal' },
  { route: '/files', title: 'Files', icon: 'i:files' },
  { route: '/settings', title: 'Settings', icon: 'i:settings' },
  { route: '/profile', title: 'Profile', icon: 'i:profile' },
  { route: '/help', title: 'Help', icon: 'i:help' },
]

function makeRouter(initial = '/dash'): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: menuItems.map((m) => ({ path: m.route, component: Stub })),
  })
  router.push(initial)
  return router
}

async function mount(props: Record<string, unknown>, slots: Record<string, unknown> = {}, initial = '/dash') {
  const router = makeRouter(initial)
  await router.isReady()
  const result = render(TBottomNav, {
    props,
    slots,
    global: {
      plugins: [router],
    },
  })
  return { ...result, router }
}

beforeEach(() => {
  // ensure clean body scroll lock between tests
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    // clean any teleported sheets
    document.querySelectorAll('.t-bottom-nav__sheet-root').forEach((n) => n.remove())
  }
})

describe('TBottomNav', () => {
  it('renders 5 slots with first 4 menuItems pinned by default', async () => {
    const { container } = await mount({ menuItems })
    const slots = container.querySelectorAll('.t-bottom-nav__slot')
    expect(slots.length).toBe(5)
    // Slot 0 = first item, slot 1 = second, slot 2 = center, slot 3 = third, slot 4 = fourth
    expect(slots[0].textContent).toContain('Dashboard')
    expect(slots[1].textContent).toContain('Inbox')
    expect(slots[2].classList.contains('t-bottom-nav__slot--center')).toBe(true)
    expect(slots[3].textContent).toContain('Calendar')
    expect(slots[4].textContent).toContain('Files')
  })

  it('custom pinnedRoutes overrides default selection', async () => {
    const { container } = await mount({
      menuItems,
      pinnedRoutes: ['/profile', '/help', '/settings', '/cal'],
    })
    const slots = container.querySelectorAll('.t-bottom-nav__slot')
    expect(slots[0].textContent).toContain('Profile')
    expect(slots[1].textContent).toContain('Help')
    expect(slots[3].textContent).toContain('Settings')
    expect(slots[4].textContent).toContain('Calendar')
  })

  it('marks pinned item active when current route matches', async () => {
    const { container } = await mount({ menuItems }, {}, '/inbox')
    const slots = container.querySelectorAll('.t-bottom-nav__slot')
    expect(slots[1].classList.contains('t-bottom-nav__slot--active')).toBe(true)
    expect(slots[2].classList.contains('t-bottom-nav__slot--active')).toBe(false)
  })

  it('marks center button active when current route is NOT pinned', async () => {
    const { container } = await mount({ menuItems }, {}, '/help')
    const slots = container.querySelectorAll('.t-bottom-nav__slot')
    expect(slots[2].classList.contains('t-bottom-nav__slot--active')).toBe(true)
    // none of the pinned slots should be active
    expect(slots[0].classList.contains('t-bottom-nav__slot--active')).toBe(false)
    expect(slots[1].classList.contains('t-bottom-nav__slot--active')).toBe(false)
    expect(slots[3].classList.contains('t-bottom-nav__slot--active')).toBe(false)
    expect(slots[4].classList.contains('t-bottom-nav__slot--active')).toBe(false)
  })

  it('opens sheet on center tap, closes on backdrop tap, emits update:open', async () => {
    const events: boolean[] = []
    const { container } = await mount({
      menuItems,
      'onUpdate:open': (v: boolean) => events.push(v),
    })
    const center = container.querySelector('.t-bottom-nav__slot--center') as HTMLElement
    expect(center).not.toBeNull()
    await fireEvent.click(center)
    await nextTick()

    const sheet = document.querySelector('.t-bottom-nav__sheet')
    expect(sheet).not.toBeNull()
    expect(events).toContain(true)

    const backdrop = document.querySelector('.t-bottom-nav__backdrop') as HTMLElement
    expect(backdrop).not.toBeNull()
    await fireEvent.click(backdrop)
    await nextTick()

    expect(events).toContain(false)
  })

  it('renders all menuItems in the sheet list', async () => {
    const { container } = await mount({ menuItems })
    const center = container.querySelector('.t-bottom-nav__slot--center') as HTMLElement
    await fireEvent.click(center)
    await nextTick()

    const items = document.querySelectorAll('.t-bottom-nav__list-item')
    expect(items.length).toBe(menuItems.length)
    expect(items[0].textContent).toContain('Dashboard')
    expect(items[menuItems.length - 1].textContent).toContain('Help')
  })

  it('tapping a list item closes the sheet', async () => {
    const events: boolean[] = []
    const { container } = await mount({
      menuItems,
      'onUpdate:open': (v: boolean) => events.push(v),
    })
    const center = container.querySelector('.t-bottom-nav__slot--center') as HTMLElement
    await fireEvent.click(center)
    await nextTick()
    expect(document.querySelector('.t-bottom-nav__sheet')).not.toBeNull()

    const items = document.querySelectorAll('.t-bottom-nav__list-item')
    await fireEvent.click(items[2] as HTMLElement)
    await nextTick()

    // last emit should be false (sheet closed)
    expect(events[events.length - 1]).toBe(false)
  })

  it('renders #profile and #footer slots', async () => {
    const { container } = await mount(
      { menuItems },
      {
        profile: () => h('div', { class: 'test-profile' }, 'Hello User'),
        footer: () => h('div', { class: 'test-footer' }, 'v1.2.3'),
      }
    )
    const center = container.querySelector('.t-bottom-nav__slot--center') as HTMLElement
    await fireEvent.click(center)
    await nextTick()

    expect(document.querySelector('.test-profile')?.textContent).toBe('Hello User')
    expect(document.querySelector('.test-footer')?.textContent).toBe('v1.2.3')
  })

  it('respects activeRoutes for pinned item active state', async () => {
    const items = [
      { route: '/dash', title: 'Dashboard', icon: 'i:d', activeRoutes: ['/dash', '/dashboard'] },
      { route: '/inbox', title: 'Inbox', icon: 'i:i' },
      { route: '/cal', title: 'Calendar', icon: 'i:c' },
      { route: '/files', title: 'Files', icon: 'i:f' },
    ]
    // route is /dash/sub → should match via activeRoutes prefix
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dash/:sub', component: Stub },
        ...items.map((m) => ({ path: m.route, component: Stub })),
      ],
    })
    router.push('/dash/sub')
    await router.isReady()
    const { container } = render(TBottomNav, {
      props: { menuItems: items },
      global: { plugins: [router] },
    })
    await nextTick()
    const slots = container.querySelectorAll('.t-bottom-nav__slot')
    expect(slots[0].classList.contains('t-bottom-nav__slot--active')).toBe(true)
  })
})
