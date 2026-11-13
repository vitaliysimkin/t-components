<template>
  <aside
    ref="root"
    class="t-sidebar"
    :class="{
      't-sidebar--collapsed': collapsed,
      't-sidebar--peek': peek,
      't-sidebar--right': position === 'right',
      't-sidebar--nested': nested
    }"
    role="navigation"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown.esc="onEsc"
  >
    <div class="t-sidebar__frame">
      <!-- expandMode="handle": round toggle on the panel edge, shown on hover / keyboard focus. -->
      <button
        v-if="expandMode === 'handle'"
        type="button"
        class="t-sidebar__handle"
        :aria-label="collapsed ? toggleLabel.expand : toggleLabel.collapse"
        :title="collapsed ? toggleLabel.expand : toggleLabel.collapse"
        :aria-expanded="!collapsed"
        :aria-controls="panelId"
        @click="toggle"
      >
        <Icon
          v-if="handleIcon"
          :icon="handleIcon"
          class="t-sidebar__handle-icon"
        />
        <svg
          v-else
          class="t-sidebar__handle-icon t-sidebar__chevron"
          :class="{ 't-sidebar__chevron--left': collapsed === (position === 'right') }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div
        :id="panelId"
        class="t-sidebar__panel"
        @click="onAsideClick"
      >
        <!-- Slot areas take the visible width, so slot content stays inside the rail. -->
        <div class="t-sidebar__head">
          <slot
            name="header"
            :collapsed="shut"
            :toggle="toggle"
          >
            <div class="t-sidebar__header">
              <span
                v-if="headerIcon"
                class="t-sidebar__logo"
              >
                <Icon
                  :icon="headerIcon"
                  class="t-sidebar__logo-icon"
                />
              </span>

              <span
                v-if="headerLabel"
                class="t-sidebar__header-label t-sidebar__text"
              >
                {{ headerLabel }}
              </span>

              <!-- expandMode="peek": pin keeps the panel open (first in the tab order, focusing it peeks). -->
              <button
                v-if="expandMode === 'peek'"
                type="button"
                class="t-sidebar__pin"
                :aria-label="toggleLabel.pin"
                :title="toggleLabel.pin"
                :aria-pressed="!collapsed"
                @click.stop="toggle"
              >
                <svg
                  class="t-sidebar__pin-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 17v5M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                </svg>
              </button>
            </div>
          </slot>
        </div>

        <div class="t-sidebar__content">
          <!-- Right before the first menu item, scrolls with the menu. -->
          <div
            v-if="$slots['nav-start']"
            class="t-sidebar__nav-start"
          >
            <slot
              name="nav-start"
              :collapsed="shut"
            />
          </div>

          <nav
            ref="nav"
            class="t-sidebar__nav"
          >
            <template
              v-for="(group, gi) in groups"
              :key="gi"
            >
              <div
                v-if="group.title"
                class="t-sidebar__group-title"
                :style="{ '--n': group.n }"
              >
                <span class="t-sidebar__text">{{ group.title }}</span>
              </div>

              <RouterLink
                v-for="{ item, n } in group.items"
                :key="item.route"
                :to="item.route"
                class="t-sidebar__nav-item"
                :class="{ 't-sidebar__nav-item--active': isMenuItemActive(item) }"
                :title="shut ? item.title : undefined"
                :style="item.color ? { '--n': n, '--menu-item-color': item.color } : { '--n': n }"
                @click.stop
              >
                <Icon
                  :icon="item.icon"
                  class="t-sidebar__nav-icon"
                />

                <span class="t-sidebar__nav-text t-sidebar__text">
                  {{ item.title }}
                </span>
              </RouterLink>
            </template>

            <!-- One shared active card that slides between rows. -->
            <span
              v-if="card"
              class="t-sidebar__card"
              :class="{ 't-sidebar__card--settled': settled }"
              :style="{ height: `${card.h}px`, transform: `translateY(${card.y}px)` }"
              aria-hidden="true"
            />
          </nav>

          <!-- Right after the last menu item, scrolls with the menu. -->
          <div
            v-if="$slots['nav-end']"
            class="t-sidebar__nav-end"
          >
            <slot
              name="nav-end"
              :collapsed="shut"
            />
          </div>
        </div>

        <div
          v-if="$slots.footer"
          class="t-sidebar__footer"
        >
          <slot
            name="footer"
            :collapsed="shut"
          />
        </div>
      </div>

      <span
        class="t-sidebar__edge"
        aria-hidden="true"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, onMounted, onBeforeUnmount, useId } from 'vue'
import type {} from 'vue-router'
import Icon from './TIcon.vue'

export interface TSidebarMenuItem {
  route: string
  title: string
  icon: string
  activeRoutes?: string[]
  color?: string
  /** Optional section label. Consecutive items sharing a group are rendered under one heading. */
  group?: string
}

/** @deprecated use TSidebarMenuItem */
type MenuItem = TSidebarMenuItem

export interface TSidebarToggleLabel {
  expand: string
  collapse: string
  /** Pin button (`expandMode="peek"`); its state is in `aria-pressed`. */
  pin: string
}

/**
 * How the collapsed sidebar is expanded:
 * - `handle` — a round toggle on the panel edge, shown on hover / keyboard focus;
 * - `peek` — hover (300 ms) or keyboard focus shows the full panel over the content; the pin keeps it open.
 */
export type TSidebarExpandMode = 'handle' | 'peek'

export interface TSidebarProps {
  collapsed?: boolean
  expandedWidth?: string
  collapsedWidth?: string
  position?: 'left' | 'right'
  persistent?: boolean
  menuItems: MenuItem[]
  headerIcon?: string
  headerLabel?: string
  /** Handle icon while collapsed (`expandMode="handle"`); default: a chevron that rotates. */
  expandIcon?: string
  /** Handle icon while expanded (`expandMode="handle"`); default: a chevron that rotates. */
  collapseIcon?: string
  expandOnBodyClick?: boolean
  toggleLabel?: Partial<TSidebarToggleLabel>
  expandMode?: TSidebarExpandMode
  /**
   * Enable when TSidebar is embedded inside a parent with its own scroll context
   * (e.g. an examples page, modal, or nested panel). Default mode (`false`) pins
   * the sidebar to the viewport via `position: fixed`, which avoids a 1px
   * subpixel jitter that `position: sticky` exhibits at scroll boundaries on
   * tall pages. In nested mode the sidebar uses sticky positioning and stays
   * contained within its parent — jitter may reappear in that mode; it is an
   * inherent browser quirk of sticky positioning.
   */
  nested?: boolean
}

export interface TSidebarEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'toggle', collapsed: boolean): void
}

const props = withDefaults(defineProps<TSidebarProps>(), {
  collapsed: true,
  position: 'left',
  persistent: false,
  expandOnBodyClick: true,
  expandMode: 'handle',
  nested: false
})

const emit = defineEmits<TSidebarEmits>()

const PEEK_DELAY = 300

// vue-router is an optional peer: read `$route` instead of importing it at runtime.
const instance = getCurrentInstance()
const route = computed(() => instance!.proxy!.$route)
const collapsed = ref(props.collapsed)
const root = ref<HTMLElement>()
const nav = ref<HTMLElement>()

const toggleLabel = computed<TSidebarToggleLabel>(() => ({
  expand: props.toggleLabel?.expand ?? 'Розгорнути',
  collapse: props.toggleLabel?.collapse ?? 'Згорнути',
  pin: props.toggleLabel?.pin ?? 'Закріпити'
}))

const panelId = `t-sidebar-${useId()}`
const handleIcon = computed(() => (collapsed.value ? props.expandIcon : props.collapseIcon))

interface MenuGroup {
  title?: string
  /** Stagger index of the row (label slide-in order). */
  n: number
  items: { item: MenuItem; n: number }[]
}

const groups = computed<MenuGroup[]>(() => {
  const out: MenuGroup[] = []
  let n = 1
  for (const item of props.menuItems) {
    let last = out[out.length - 1]
    if (!last || last.title !== item.group) {
      last = { title: item.group, n: item.group ? n++ : n, items: [] }
      out.push(last)
    }
    last.items.push({ item, n: n++ })
  }
  return out
})

const isMenuItemActive = (item: MenuItem) => {
  const currentPath = route.value.path

  if (item.activeRoutes) {
    return item.activeRoutes.some(
      (activeRoute) =>
        currentPath === activeRoute ||
        currentPath.startsWith(activeRoute + '/')
    )
  }

  return currentPath === item.route
}

/* Active card: one element moved with translateY to the active row. */
const card = ref<{ y: number; h: number } | null>(null)
const placeCard = () => {
  const el = nav.value?.querySelector<HTMLElement>('.t-sidebar__nav-item--active, .t-sidebar__nav-item.router-link-active')
  card.value = el ? { y: el.offsetTop, h: el.offsetHeight } : null
}
// Re-measure when the nav is shown (mounted under display: none) or its rows change height.
let resizeObserver: ResizeObserver | undefined
// The card slides only after the first route is resolved and drawn: before that it is placed without a transition
// (the router starts at "/" and the menu may still change, so the card would slide to the real row on load).
const settled = ref(false)
let alive = true
onMounted(() => {
  placeCard()
  const router = instance!.proxy!.$router as { isReady?: () => Promise<unknown> } | undefined
  const frames = (n: number, done: () => void) =>
    typeof requestAnimationFrame === 'function' && n > 0
      ? requestAnimationFrame(() => frames(n - 1, done))
      : done()
  Promise.resolve(router?.isReady?.()).then(() =>
    frames(2, () => {
      if (alive) settled.value = true
    })
  )
  if (typeof ResizeObserver !== 'undefined' && nav.value) {
    resizeObserver = new ResizeObserver(() => placeCard())
    resizeObserver.observe(nav.value)
  }
})
onBeforeUnmount(() => {
  alive = false
  resizeObserver?.disconnect()
})
watch([() => route.value.path, () => props.menuItems], placeCard, { flush: 'post' })

/* Peek (expandMode="peek"): the collapsed panel shows over the content without moving it. */
const peeking = ref(false)
const peek = computed(() => props.expandMode === 'peek' && collapsed.value && peeking.value)
/** Visually collapsed: collapsed and not peeking. */
const shut = computed(() => collapsed.value && !peek.value)
let hovered = false
let timer: ReturnType<typeof setTimeout> | undefined

const keyboardFocus = (el: EventTarget | null): boolean => {
  if (!(el instanceof Element) || !root.value?.contains(el)) return false
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}
// Keep the peek open while keyboard focus is inside (e.g. after unpinning with the keyboard).
const syncPeek = () => {
  peeking.value = keyboardFocus(document.activeElement)
}

const onEnter = () => {
  hovered = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (hovered) peeking.value = true
  }, PEEK_DELAY)
}
const onLeave = () => {
  hovered = false
  clearTimeout(timer)
  if (!keyboardFocus(document.activeElement)) peeking.value = false
}
const onFocusIn = (e: FocusEvent) => {
  if (keyboardFocus(e.target)) peeking.value = true
}
const onFocusOut = (e: FocusEvent) => {
  if (!hovered && !root.value?.contains(e.relatedTarget as Node | null)) peeking.value = false
}
const onEsc = () => {
  if (peek.value) peeking.value = false
}
onBeforeUnmount(() => clearTimeout(timer))

const toggle = () => {
  collapsed.value = !collapsed.value
  syncPeek()
  emit('update:collapsed', collapsed.value)
  emit('toggle', collapsed.value)
}

const onAsideClick = () => {
  if (shut.value && props.expandOnBodyClick) {
    toggle()
  }
}

watch(
  () => props.collapsed,
  (newValue) => {
    if (collapsed.value === newValue) return
    collapsed.value = newValue
    syncPeek()
  }
)
</script>

<style scoped>
/*
  Motion (all on tokens, so data-t-motion / prefers-reduced-motion apply):
  - the panel keeps its expanded width and is revealed / hidden with clip-path; the border and the handle
    follow with transform. The in-flow spacer (the aside) snaps once: at the start of expand, at the end of collapse;
  - labels fade and slide in one after another (stagger × --t-motion-move, so it collapses at reduced);
  - one shared active card slides between rows (translateY, --t-ease-spring);
  - rows fade their background on hover.
*/
.t-sidebar {
  color: var(--t-color-text);
  user-select: none;
  flex-shrink: 0;

  --nav-icon-size: 20px;
  --header-icon-size: 30px;

  --t-sidebar-expanded-w: 200px;
  --t-sidebar-header-padding: var(--t-space-3);
  --t-sidebar-content-padding: var(--t-space-2);
  --t-sidebar-border-w: 1px;
  --t-sidebar-collapsed-w: calc(var(--t-sidebar-header-padding) * 2 + var(--t-sidebar-border-w) + var(--header-icon-size));
  --t-sidebar-icon-center-left: calc((var(--t-sidebar-collapsed-w) - var(--t-sidebar-border-w)) / 2);
  /* Visible width of the panel and the clipped-off rest. */
  --t-sidebar-w: var(--t-sidebar-expanded-w);
  --t-sidebar-cut: calc(var(--t-sidebar-expanded-w) - var(--t-sidebar-w));
  /* Offset of the moving edge (border, handle): left → negative, right → positive. */
  --t-sidebar-shift: calc(var(--t-sidebar-cut) * -1);

  /* In-flow spacer: snaps to the new width (no width animation). */
  width: var(--t-sidebar-expanded-w);
}

.t-sidebar--collapsed {
  --t-sidebar-w: var(--t-sidebar-collapsed-w);
  width: var(--t-sidebar-collapsed-w);
  /* collapse: keep the expanded spacer until the panel has closed */
  transition: width 0s linear var(--t-duration-slow);
}

/* Peek: the panel opens over the content, the spacer stays at the rail width. */
.t-sidebar--peek {
  --t-sidebar-w: var(--t-sidebar-expanded-w);
}

.t-sidebar--right {
  --t-sidebar-shift: var(--t-sidebar-cut);
}

/*
  Default mode: aside is an in-flow spacer that reserves width in the flex
  layout; the visible panel is pinned to the viewport via position: fixed.
  This avoids the 1px subpixel jitter that sticky positioning exhibits at
  scroll boundaries on tall pages.
*/
.t-sidebar__frame {
  position: fixed;
  z-index: 50;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--t-sidebar-expanded-w);
  pointer-events: none;
}

.t-sidebar__frame > * {
  pointer-events: auto;
}

.t-sidebar--right .t-sidebar__frame {
  left: auto;
  right: 0;
}

/*
  Nested mode: aside itself is sticky within its parent; the frame is anchored to it.
  Use this when the sidebar lives inside a container with its own scroll
  context (examples page, modal, nested panel).
*/
.t-sidebar--nested {
  position: sticky;
  z-index: 1;
  top: 0;
  align-self: flex-start;
  height: 100vh;
}

.t-sidebar--nested .t-sidebar__frame {
  position: absolute;
}

.t-sidebar__panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--t-color-sidebar-bg);
  clip-path: inset(0 var(--t-sidebar-cut) 0 0);
  transition: clip-path var(--t-duration-slow) var(--t-ease);
}

/* Right: reveal from the left edge; the content rides along so the rail shows the icons. */
.t-sidebar--right .t-sidebar__panel {
  clip-path: inset(0 0 0 var(--t-sidebar-cut));
}

.t-sidebar--right .t-sidebar__panel > * {
  transform: translateX(var(--t-sidebar-shift));
  transition: transform var(--t-duration-slow) var(--t-ease);
}

.t-sidebar--peek .t-sidebar__panel {
  clip-path: inset(0 -48px);
  box-shadow: var(--t-shadow-3);
}

/* Border: a 1px line that moves with the clip edge. */
.t-sidebar__edge {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--t-sidebar-expanded-w) - var(--t-sidebar-border-w));
  width: var(--t-sidebar-border-w);
  background: var(--t-color-border);
  pointer-events: none;
  transform: translateX(var(--t-sidebar-shift));
  transition: transform var(--t-duration-slow) var(--t-ease);
}

.t-sidebar--right .t-sidebar__edge {
  left: 0;
}

/* Handle (expandMode="handle"): rides the edge, rotates › / ‹ */
.t-sidebar__handle {
  position: absolute;
  z-index: 1;
  top: calc(var(--t-sidebar-header-padding) + var(--header-icon-size) / 2 - 13px);
  left: calc(var(--t-sidebar-expanded-w) - 13px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--t-color-border-strong);
  border-radius: 50%;
  background: var(--t-color-surface);
  color: var(--t-color-text);
  box-shadow: var(--t-shadow-2);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateX(var(--t-sidebar-shift));
  transition:
    opacity var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease),
    color var(--t-duration) var(--t-ease),
    border-color var(--t-duration) var(--t-ease);
}

.t-sidebar--right .t-sidebar__handle {
  left: -13px;
}

/* 40px hit area */
.t-sidebar__handle::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
}

.t-sidebar:hover .t-sidebar__handle,
.t-sidebar:has(:focus-visible) .t-sidebar__handle {
  opacity: 1;
  pointer-events: auto;
}

.t-sidebar .t-sidebar__handle:hover {
  color: var(--t-color-accent);
  border-color: var(--t-color-accent);
}

.t-sidebar__handle-icon {
  width: 16px;
  height: 16px;
}

.t-sidebar__chevron {
  transform: rotate(180deg);
  transition: transform var(--t-duration-slow) var(--t-ease);
}

/* Points right (›) unless it should point left (‹): expanded left sidebar, collapsed right sidebar. */
.t-sidebar__chevron:not(.t-sidebar__chevron--left) {
  transform: none;
}

.t-sidebar__handle:focus-visible,
.t-sidebar__pin:focus-visible {
  outline: 2px solid var(--t-color-focus-ring);
  outline-offset: 2px;
}

/*
  Slot areas: the visible width (rail or expanded). For position="right" the panel content is shifted
  so the visible part is its left edge too. The default header keeps the expanded width (no reflow).
*/
.t-sidebar__head {
  flex-shrink: 0;
  width: var(--t-sidebar-w);
}

/* Header — logo, optional label, pin (expandMode="peek") */
.t-sidebar__header {
  display: flex;
  align-items: center;
  width: var(--t-sidebar-expanded-w);
  padding: var(--t-sidebar-header-padding);
  gap: var(--t-space-3);
}

.t-sidebar__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--header-icon-size);
  height: var(--header-icon-size);
  flex-shrink: 0;
  color: var(--t-color-accent);
}

.t-sidebar__logo-icon {
  width: var(--header-icon-size);
  height: var(--header-icon-size);
}

.t-sidebar__header-label {
  font-size: var(--t-font-size-default);
  font-weight: var(--t-font-weight-semibold);
  color: var(--t-color-text);
  font-family: var(--t-font-ui);
}

/* Pin (expandMode="peek"): slides in on hover / focus */
.t-sidebar__pin {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--header-icon-size) * 0.7);
  height: calc(var(--header-icon-size) * 0.7);
  padding: 2px;
  border: none;
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
  border-radius: var(--t-radius-mini, 4px);
  flex-shrink: 0;
  opacity: 0;
  transform: translateX(calc(-6px * var(--t-motion-move)));
  transition:
    opacity var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease),
    background-color var(--t-duration) var(--t-ease),
    color var(--t-duration) var(--t-ease);
}

.t-sidebar:hover .t-sidebar__pin,
.t-sidebar:has(:focus-visible) .t-sidebar__pin {
  opacity: 0.7;
  transform: none;
}

.t-sidebar .t-sidebar__pin:hover {
  background: var(--t-color-hover);
  color: var(--t-color-text);
  opacity: 1;
}

.t-sidebar .t-sidebar__pin[aria-pressed='true'] {
  color: var(--t-color-accent);
}

.t-sidebar__pin-icon {
  width: 100%;
  height: 100%;
}

/* Content */
.t-sidebar__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--t-sidebar-content-padding);
}

.t-sidebar__nav {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Group heading: small caps label; collapsed, a short divider grows in its place */
.t-sidebar__group-title {
  position: relative;
  display: flex;
  align-items: center;
  height: 1.75rem;
  margin: var(--t-space-2) 0 2px;
  padding: 0 calc(var(--t-sidebar-icon-center-left) - var(--t-sidebar-content-padding) - var(--nav-icon-size) / 2);
  font-size: var(--t-font-size-mini);
  font-weight: var(--t-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--t-color-text-muted);
}

.t-sidebar__group-title:first-child {
  margin-top: 2px;
}

.t-sidebar__group-title::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(var(--t-sidebar-icon-center-left) - var(--t-sidebar-content-padding) - 11px);
  width: 22px;
  height: 1px;
  background: var(--t-color-border);
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition:
    opacity var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease);
}

.t-sidebar--collapsed:not(.t-sidebar--peek) .t-sidebar__group-title::after {
  opacity: 1;
  transform: scaleX(1);
}

/* Rows and the active card are clipped like the panel: chips in the rail, no layout change. */
.t-sidebar__nav-item,
.t-sidebar__card {
  clip-path: inset(0 var(--t-sidebar-cut) 0 0 round var(--t-radius-default));
}

.t-sidebar__nav-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--t-space-3);
  padding: var(--t-space-2)
      calc(var(--t-sidebar-icon-center-left) - var(--t-sidebar-content-padding) - var(--nav-icon-size) / 2);
  color: var(--t-color-text-muted);
  text-decoration: none;
  border-radius: var(--t-radius-default);
  font-weight: var(--t-font-weight-medium);
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);
  transition:
    clip-path var(--t-duration-slow) var(--t-ease),
    background-color var(--t-duration) var(--t-ease),
    color var(--t-duration) var(--t-ease);
}

.t-sidebar__nav-item:hover {
  background: var(--t-color-hover);
  color: var(--t-color-text);
}

.t-sidebar__nav-item:focus-visible {
  outline: 2px solid var(--t-color-focus-ring);
  outline-offset: -2px;
}

/* Active: text + accent icon; the surface card underneath slides between rows */
.t-sidebar__nav-item.router-link-active,
.t-sidebar__nav-item.t-sidebar__nav-item--active {
  color: var(--t-color-text);
}

.t-sidebar__nav-item.router-link-active .t-sidebar__nav-icon,
.t-sidebar__nav-item.t-sidebar__nav-item--active .t-sidebar__nav-icon {
  color: var(--t-color-accent);
}

.t-sidebar__card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-radius: var(--t-radius-default);
  background: var(--t-color-surface);
  pointer-events: none;
}

.t-sidebar__card--settled {
  transition:
    clip-path var(--t-duration-slow) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease-spring);
}

/* Card border: its right side follows the clip edge, so it stays visible in the rail. */
.t-sidebar__card::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: var(--t-sidebar-cut);
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--t-color-border);
  transition: right var(--t-duration-slow) var(--t-ease);
}

/* Support for custom menu item colors */
.t-sidebar__nav-item[style*="--menu-item-color"] {
  color: var(--menu-item-color);
}

.t-sidebar__nav-item[style*="--menu-item-color"]:hover {
  color: var(--menu-item-color);
  opacity: 0.8;
}

.t-sidebar__nav-item[style*="--menu-item-color"].router-link-active,
.t-sidebar__nav-item[style*="--menu-item-color"].t-sidebar__nav-item--active {
  color: var(--menu-item-color);
}

.t-sidebar__nav-item[style*="--menu-item-color"].router-link-active .t-sidebar__nav-icon,
.t-sidebar__nav-item[style*="--menu-item-color"].t-sidebar__nav-item--active .t-sidebar__nav-icon {
  color: var(--menu-item-color);
}

.t-sidebar__nav-icon {
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
  flex-shrink: 0;
}

.t-sidebar__nav-text {
  font-size: var(--t-font-size-default);
}

/*
  Labels: stay in layout (the clip hides them in the rail), fade and slide in one after another.
  The stagger and the slide are × --t-motion-move, so they drop out under reduced motion.
*/
.t-sidebar__text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
  transition:
    opacity var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease);
  transition-delay: calc((var(--t-duration-slow) * 0.25 + var(--n, 0) * 25ms) * var(--t-motion-scale) * var(--t-motion-move));
}

.t-sidebar--collapsed:not(.t-sidebar--peek) .t-sidebar__text {
  opacity: 0;
  transform: translateX(calc(-8px * var(--t-motion-move)));
  pointer-events: none;
  transition-delay: 0s;
}

/* After the menu (slot-only): the visible width of the rows. */
.t-sidebar__nav-start {
  width: calc(var(--t-sidebar-w) - var(--t-sidebar-content-padding) * 2 - var(--t-sidebar-border-w));
  margin-bottom: 2px;
}

.t-sidebar__nav-end {
  width: calc(var(--t-sidebar-w) - var(--t-sidebar-content-padding) * 2 - var(--t-sidebar-border-w));
  margin-top: 2px;
}

/* Footer (slot-only) */
.t-sidebar__footer {
  width: var(--t-sidebar-w);
  flex-shrink: 0;
  border-top: 1px solid var(--t-color-border);
}

/* Scrollbar styling */
.t-sidebar__content::-webkit-scrollbar {
  width: 6px;
}

.t-sidebar__content::-webkit-scrollbar-track {
  background: transparent;
}

.t-sidebar__content::-webkit-scrollbar-thumb {
  background: var(--t-color-border-strong);
  border-radius: var(--t-radius-mini);
}

.t-sidebar__content::-webkit-scrollbar-thumb:hover {
  background: var(--t-color-border);
}
</style>
