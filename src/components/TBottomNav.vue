<template>
  <nav
    class="t-bottom-nav"
    role="navigation"
    :aria-label="headerLabel"
  >
    <div class="t-bottom-nav__bar">
      <!-- Active indicator pill (position is driven via CSS :has() on data-slot-index) -->
      <span
        v-if="indicatorVisible"
        class="t-bottom-nav__indicator"
        aria-hidden="true"
      />

      <!-- Slot 1: pinned[0] -->
      <component
        :is="leftItems[0] ? 'RouterLink' : 'div'"
        v-bind="leftItems[0] ? { to: leftItems[0].route } : {}"
        class="t-bottom-nav__slot"
        :class="{
          't-bottom-nav__slot--item': !!leftItems[0],
          't-bottom-nav__slot--active': leftItems[0] && isMenuItemActive(leftItems[0]),
          't-bottom-nav__slot--empty': !leftItems[0]
        }"
        :data-slot-index="0"
        @click="leftItems[0] && onItemClick($event)"
      >
        <template v-if="leftItems[0]">
          <slot
            name="item"
            :item="leftItems[0]"
            :active="isMenuItemActive(leftItems[0])"
          >
            <Icon
              :icon="leftItems[0].icon"
              class="t-bottom-nav__icon"
            />
            <span class="t-bottom-nav__label">{{ leftItems[0].title }}</span>
          </slot>
        </template>
      </component>

      <!-- Slot 2: pinned[1] -->
      <component
        :is="leftItems[1] ? 'RouterLink' : 'div'"
        v-bind="leftItems[1] ? { to: leftItems[1].route } : {}"
        class="t-bottom-nav__slot"
        :class="{
          't-bottom-nav__slot--item': !!leftItems[1],
          't-bottom-nav__slot--active': leftItems[1] && isMenuItemActive(leftItems[1]),
          't-bottom-nav__slot--empty': !leftItems[1]
        }"
        :data-slot-index="1"
        @click="leftItems[1] && onItemClick($event)"
      >
        <template v-if="leftItems[1]">
          <slot
            name="item"
            :item="leftItems[1]"
            :active="isMenuItemActive(leftItems[1])"
          >
            <Icon
              :icon="leftItems[1].icon"
              class="t-bottom-nav__icon"
            />
            <span class="t-bottom-nav__label">{{ leftItems[1].title }}</span>
          </slot>
        </template>
      </component>

      <!-- Slot 3: center logo button -->
      <button
        type="button"
        class="t-bottom-nav__slot t-bottom-nav__slot--center"
        :class="{ 't-bottom-nav__slot--active': centerActive }"
        :aria-label="headerLabel"
        :aria-expanded="open"
        :data-slot-index="2"
        @click="toggleSheet"
      >
        <Icon
          v-if="headerIcon"
          :icon="headerIcon"
          class="t-bottom-nav__icon"
        />
        <span class="t-bottom-nav__label">{{ menuLabel }}</span>
      </button>

      <!-- Slot 4: pinned[2] -->
      <component
        :is="rightItems[0] ? 'RouterLink' : 'div'"
        v-bind="rightItems[0] ? { to: rightItems[0].route } : {}"
        class="t-bottom-nav__slot"
        :class="{
          't-bottom-nav__slot--item': !!rightItems[0],
          't-bottom-nav__slot--active': rightItems[0] && isMenuItemActive(rightItems[0]),
          't-bottom-nav__slot--empty': !rightItems[0]
        }"
        :data-slot-index="3"
        @click="rightItems[0] && onItemClick($event)"
      >
        <template v-if="rightItems[0]">
          <slot
            name="item"
            :item="rightItems[0]"
            :active="isMenuItemActive(rightItems[0])"
          >
            <Icon
              :icon="rightItems[0].icon"
              class="t-bottom-nav__icon"
            />
            <span class="t-bottom-nav__label">{{ rightItems[0].title }}</span>
          </slot>
        </template>
      </component>

      <!-- Slot 5: pinned[3] -->
      <component
        :is="rightItems[1] ? 'RouterLink' : 'div'"
        v-bind="rightItems[1] ? { to: rightItems[1].route } : {}"
        class="t-bottom-nav__slot"
        :class="{
          't-bottom-nav__slot--item': !!rightItems[1],
          't-bottom-nav__slot--active': rightItems[1] && isMenuItemActive(rightItems[1]),
          't-bottom-nav__slot--empty': !rightItems[1]
        }"
        :data-slot-index="4"
        @click="rightItems[1] && onItemClick($event)"
      >
        <template v-if="rightItems[1]">
          <slot
            name="item"
            :item="rightItems[1]"
            :active="isMenuItemActive(rightItems[1])"
          >
            <Icon
              :icon="rightItems[1].icon"
              class="t-bottom-nav__icon"
            />
            <span class="t-bottom-nav__label">{{ rightItems[1].title }}</span>
          </slot>
        </template>
      </component>
    </div>

    <!-- Bottom sheet -->
    <Teleport to="body">
      <Transition name="t-bottom-nav-sheet">
        <div
          v-if="open"
          class="t-bottom-nav__sheet-root"
          role="dialog"
          aria-modal="true"
          :aria-label="headerLabel"
        >
          <div
            class="t-bottom-nav__backdrop"
            @click="closeSheet"
          />

          <div
            class="t-bottom-nav__sheet"
            :style="sheetStyle"
          >
            <div
              class="t-bottom-nav__handle-area"
              @pointerdown="onHandlePointerDown"
              @pointermove="onHandlePointerMove"
              @pointerup="onHandlePointerUp"
              @pointercancel="onHandlePointerUp"
            >
              <div
                class="t-bottom-nav__handle"
                aria-hidden="true"
              />
            </div>

            <div
              v-if="$slots.profile"
              class="t-bottom-nav__profile"
            >
              <slot name="profile" />
            </div>

            <div
              v-if="$slots.profile"
              class="t-bottom-nav__divider"
            />

            <div class="t-bottom-nav__list">
              <RouterLink
                v-for="item in menuItems"
                :key="item.route"
                :to="item.route"
                class="t-bottom-nav__list-item"
                :class="{
                  't-bottom-nav__list-item--active': isMenuItemActive(item)
                }"
                :style="item.color ? { '--menu-item-color': item.color } : {}"
                @click="onListItemClick"
              >
                <Icon
                  :icon="item.icon"
                  class="t-bottom-nav__list-icon"
                />
                <span class="t-bottom-nav__list-title">{{ item.title }}</span>
              </RouterLink>
            </div>

            <template v-if="$slots.footer">
              <div class="t-bottom-nav__divider" />
              <div class="t-bottom-nav__footer">
                <slot name="footer" />
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'

/** Menu item shape — mirrors TSidebar. */
interface MenuItem {
  route: string
  title: string
  icon: string
  activeRoutes?: string[]
  color?: string
}

/** Public props for TBottomNav. */
export interface TBottomNavProps {
  /** Full menu list — shown in the bottom-sheet. */
  menuItems: MenuItem[]
  /** Routes pinned to the bar (max 4, split 2 left + 2 right of center). Defaults to first 4 menuItems. */
  pinnedRoutes?: string[]
  /** Iconify icon for the center logo button. */
  headerIcon?: string
  /** A11y label for the center button (also used as nav aria-label). */
  headerLabel?: string
  /** Visible label under the center icon. */
  menuLabel?: string
  /** Two-way bindable open state of the sheet. */
  open?: boolean
}

export interface TBottomNavEmits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<TBottomNavProps>(), {
  pinnedRoutes: undefined,
  headerIcon: undefined,
  headerLabel: 'Menu',
  menuLabel: 'Menu',
  open: false,
})

const emit = defineEmits<TBottomNavEmits>()

const route = useRoute()

// Sheet open state — internally controlled, mirrored via v-model:open.
const open = ref(props.open)

watch(() => props.open, (v) => { open.value = v })
watch(open, (v) => { emit('update:open', v) })

const setOpen = (v: boolean) => {
  open.value = v
}

const toggleSheet = () => setOpen(!open.value)
const closeSheet = () => setOpen(false)

// Pinned items — pad to 4, split into two halves.
const pinned = computed<(MenuItem | undefined)[]>(() => {
  const slots: (MenuItem | undefined)[] = [undefined, undefined, undefined, undefined]
  const list = props.pinnedRoutes
    ? props.pinnedRoutes
        .map((r) => props.menuItems.find((m) => m.route === r))
        .filter((m): m is MenuItem => !!m)
    : props.menuItems.slice(0, 4)
  list.slice(0, 4).forEach((m, i) => { slots[i] = m })
  return slots
})

const leftItems = computed(() => [pinned.value[0], pinned.value[1]])
const rightItems = computed(() => [pinned.value[2], pinned.value[3]])

const isMenuItemActive = (item: MenuItem) => {
  const currentPath = route.path
  if (item.activeRoutes) {
    return item.activeRoutes.some(
      (r) => currentPath === r || currentPath.startsWith(r + '/')
    )
  }
  return currentPath === item.route
}

// Center button is "active" when the current route is NOT covered by any pinned item.
const centerActive = computed(() => {
  return !pinned.value.some((item) => item && isMenuItemActive(item))
})

// Active indicator — translateX based on which slot is active. Slot width = 20% of viewport bar.
const activeSlotIndex = computed<number>(() => {
  for (let i = 0; i < 5; i++) {
    if (i === 2) {
      if (centerActive.value) return 2
      continue
    }
    const lookup: (MenuItem | undefined)[] = [
      pinned.value[0],
      pinned.value[1],
      undefined,
      pinned.value[2],
      pinned.value[3],
    ]
    const item = lookup[i]
    if (item && isMenuItemActive(item)) return i
  }
  return -1
})

const indicatorVisible = computed(() => activeSlotIndex.value >= 0)

// Indicator position is driven purely via CSS using `:has()` on the active slot's
// data-slot-index attribute (see scoped <style>). No JS-side measurement needed.

// Close sheet on route change.
watch(() => route.fullPath, () => {
  if (open.value) closeSheet()
})

// ESC closes sheet.
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) closeSheet()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

// Lock body scroll while sheet open.
watch(open, (v) => {
  if (typeof document === 'undefined') return
  if (v) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const onItemClick = (_e: MouseEvent) => {
  // Pinned items navigate via RouterLink; nothing extra to do.
}

const onListItemClick = () => {
  // RouterLink will navigate; close sheet.
  closeSheet()
}

// Swipe-down-to-close on the handle area (Pointer Events).
const dragStartY = ref<number | null>(null)
const dragStartTime = ref(0)
const dragOffset = ref(0)
const dragging = ref(false)

const sheetStyle = computed(() => {
  if (dragging.value && dragOffset.value > 0) {
    return { transform: `translateY(${dragOffset.value}px)`, transition: 'none' }
  }
  return undefined
})

const onHandlePointerDown = (e: PointerEvent) => {
  dragStartY.value = e.clientY
  dragStartTime.value = performance.now()
  dragOffset.value = 0
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

const onHandlePointerMove = (e: PointerEvent) => {
  if (!dragging.value || dragStartY.value === null) return
  const dy = e.clientY - dragStartY.value
  dragOffset.value = Math.max(0, dy)
}

const onHandlePointerUp = (e: PointerEvent) => {
  if (!dragging.value || dragStartY.value === null) {
    dragging.value = false
    dragStartY.value = null
    return
  }
  const dy = e.clientY - dragStartY.value
  const dt = Math.max(1, performance.now() - dragStartTime.value)
  const velocity = dy / dt // px / ms

  dragging.value = false
  dragStartY.value = null
  dragOffset.value = 0
  try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* noop */ }

  if (dy > 60 || velocity > 0.6) {
    closeSheet()
  }
}

defineExpose({ open: () => setOpen(true), close: closeSheet })
</script>

<style scoped>
.t-bottom-nav {
  --t-bottom-nav-h: calc(var(--t-control-h-large) + var(--t-space-4));
  --t-bottom-nav-icon-size: 24px;
  --t-bottom-nav-indicator-w: 24px;
  --t-bottom-nav-indicator-h: 3px;

  color: var(--t-color-text);
}

/* Bar — fixed bottom, 5 equal slots */
.t-bottom-nav__bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: stretch;

  height: calc(var(--t-bottom-nav-h) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);

  background: var(--t-color-surface);
  border-top: 1px solid var(--t-color-border);
}

/* Active indicator pill — positioned via translateX based on slot index */
.t-bottom-nav__indicator {
  position: absolute;
  left: 0;
  bottom: calc(var(--t-space-2) + env(safe-area-inset-bottom, 0px));
  width: var(--t-bottom-nav-indicator-w);
  height: var(--t-bottom-nav-indicator-h);
  border-radius: 2px;
  background: var(--t-color-accent);
  /* Center pill under active slot: translate by (slot index + 0.5) * 20% of bar width minus half pill width. */
  transform: translateX(0);
  pointer-events: none;
  transition: transform 200ms ease-out;
  will-change: transform;
}

/* Each slot is 20% of bar width — for indicator we use a sibling element trick: the
   indicator's transform is set inline via JS-computed pixel offset, but to keep things
   purely CSS-driven and viewport-fluid we instead use 5 absolute markers via
   nth-of-type rules below. */

/* The above ref-based offset is unused; we drive position purely via CSS using
   the active slot's data-slot-index and a CSS variable. */
.t-bottom-nav__bar:has([data-slot-index="0"].t-bottom-nav__slot--active) .t-bottom-nav__indicator {
  transform: translateX(calc(10vw - var(--t-bottom-nav-indicator-w) / 2));
}
.t-bottom-nav__bar:has([data-slot-index="1"].t-bottom-nav__slot--active) .t-bottom-nav__indicator {
  transform: translateX(calc(30vw - var(--t-bottom-nav-indicator-w) / 2));
}
.t-bottom-nav__bar:has([data-slot-index="2"].t-bottom-nav__slot--active) .t-bottom-nav__indicator {
  transform: translateX(calc(50vw - var(--t-bottom-nav-indicator-w) / 2));
}
.t-bottom-nav__bar:has([data-slot-index="3"].t-bottom-nav__slot--active) .t-bottom-nav__indicator {
  transform: translateX(calc(70vw - var(--t-bottom-nav-indicator-w) / 2));
}
.t-bottom-nav__bar:has([data-slot-index="4"].t-bottom-nav__slot--active) .t-bottom-nav__indicator {
  transform: translateX(calc(90vw - var(--t-bottom-nav-indicator-w) / 2));
}

/* Slots */
.t-bottom-nav__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 44px;
  padding: var(--t-space-2);
  color: var(--t-color-text-muted);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--t-font-ui);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 160ms ease, background-color 160ms ease;
}

.t-bottom-nav__slot:focus-visible {
  outline: 2px solid var(--t-color-focus-ring);
  outline-offset: -2px;
  border-radius: var(--t-radius-mini);
}

.t-bottom-nav__slot--item:hover,
.t-bottom-nav__slot--center:hover {
  color: var(--t-color-text);
}

.t-bottom-nav__slot--active {
  color: var(--t-color-accent);
}

.t-bottom-nav__slot--empty {
  cursor: default;
  pointer-events: none;
}

.t-bottom-nav__slot--center {
  color: var(--t-color-text-muted);
}

.t-bottom-nav__slot[style*="--menu-item-color"].t-bottom-nav__slot--active,
.t-bottom-nav__slot[style*="--menu-item-color"]:hover {
  color: var(--menu-item-color);
}

.t-bottom-nav__icon {
  width: var(--t-bottom-nav-icon-size);
  height: var(--t-bottom-nav-icon-size);
  flex-shrink: 0;
}

.t-bottom-nav__label {
  font-size: var(--t-font-size-mini);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Sheet — fullscreen overlay */
.t-bottom-nav__sheet-root {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.t-bottom-nav__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.t-bottom-nav__sheet {
  position: relative;
  background: var(--t-color-bg);
  border-top-left-radius: var(--t-radius-large);
  border-top-right-radius: var(--t-radius-large);
  box-shadow: var(--t-shadow-2);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  will-change: transform;
}

.t-bottom-nav__handle-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--t-space-3) 0 var(--t-space-2);
  cursor: grab;
  touch-action: none;
}

.t-bottom-nav__handle-area:active {
  cursor: grabbing;
}

.t-bottom-nav__handle {
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: var(--t-color-border-strong);
}

.t-bottom-nav__profile {
  padding: var(--t-space-3) var(--t-space-4);
}

.t-bottom-nav__divider {
  height: 1px;
  background: var(--t-color-border);
  margin: 0 var(--t-space-2);
}

.t-bottom-nav__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--t-space-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.t-bottom-nav__list-item {
  display: flex;
  align-items: center;
  gap: var(--t-space-3);
  padding: var(--t-space-3);
  border-radius: var(--t-radius-default);
  color: var(--t-color-text-muted);
  text-decoration: none;
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);
  font-weight: 500;
  transition: background-color 160ms ease, color 160ms ease;
}

.t-bottom-nav__list-item:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
  color: var(--t-color-text);
}

.t-bottom-nav__list-item.router-link-active,
.t-bottom-nav__list-item--active {
  background: var(--t-color-accent-plain-bg);
  color: var(--t-color-accent);
}

.t-bottom-nav__list-item[style*="--menu-item-color"] {
  color: var(--menu-item-color);
}
.t-bottom-nav__list-item[style*="--menu-item-color"]:hover {
  color: var(--menu-item-color);
  opacity: 0.85;
}
.t-bottom-nav__list-item[style*="--menu-item-color"].router-link-active,
.t-bottom-nav__list-item[style*="--menu-item-color"].t-bottom-nav__list-item--active {
  background: color-mix(in srgb, var(--menu-item-color) 20%, transparent);
  color: var(--menu-item-color);
}

.t-bottom-nav__list-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.t-bottom-nav__list-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.t-bottom-nav__footer {
  padding: var(--t-space-3) var(--t-space-4);
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

/* Sheet enter / leave animation — slide up + backdrop fade */
.t-bottom-nav-sheet-enter-active,
.t-bottom-nav-sheet-leave-active {
  transition: opacity 280ms cubic-bezier(0.2, 0, 0, 1);
}
.t-bottom-nav-sheet-enter-active .t-bottom-nav__sheet,
.t-bottom-nav-sheet-leave-active .t-bottom-nav__sheet {
  transition: transform 280ms cubic-bezier(0.2, 0, 0, 1);
}

.t-bottom-nav-sheet-enter-from,
.t-bottom-nav-sheet-leave-to {
  opacity: 0;
}
.t-bottom-nav-sheet-enter-from .t-bottom-nav__sheet,
.t-bottom-nav-sheet-leave-to .t-bottom-nav__sheet {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .t-bottom-nav__indicator,
  .t-bottom-nav__slot,
  .t-bottom-nav__list-item,
  .t-bottom-nav-sheet-enter-active,
  .t-bottom-nav-sheet-leave-active,
  .t-bottom-nav-sheet-enter-active .t-bottom-nav__sheet,
  .t-bottom-nav-sheet-leave-active .t-bottom-nav__sheet {
    transition: none !important;
  }
}
</style>
