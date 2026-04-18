<template>
  <aside
    class="t-sidebar"
    :class="{
      't-sidebar--collapsed': collapsed,
      't-sidebar--right': position === 'right',
      't-sidebar--nested': nested
    }"
    role="navigation"
  >
    <div
      class="t-sidebar__panel"
      @click="onAsideClick"
    >
      <slot
        name="header"
        :collapsed="collapsed"
        :toggle="toggle"
      >
        <div class="t-sidebar__header">
          <!-- Collapsed: single morph-trigger (logo ↔ expand-icon on hover). -->
          <button
            v-if="collapsed && headerIcon"
            type="button"
            class="t-sidebar__logo t-sidebar__logo--trigger"
            :aria-expanded="false"
            :aria-label="toggleLabel.expand"
            :title="toggleLabel.expand"
            @click.stop="toggle"
          >
            <span class="t-sidebar__trigger">
              <Icon
                :icon="headerIcon"
                class="t-sidebar__trigger-icon t-sidebar__trigger-icon--primary"
              />
              <Icon
                :icon="expandIcon"
                class="t-sidebar__trigger-icon t-sidebar__trigger-icon--morph"
              />
            </span>
          </button>

          <!-- Expanded: static logo on the left (no morph). -->
          <span
            v-else-if="headerIcon"
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
            :class="{ 't-sidebar__text--hidden': collapsed }"
          >
            {{ headerLabel }}
          </span>

          <!-- Expanded: separate collapse button on the right. -->
          <button
            v-if="!collapsed"
            type="button"
            class="t-sidebar__collapse"
            :aria-label="toggleLabel.collapse"
            :title="toggleLabel.collapse"
            @click.stop="toggle"
          >
            <Icon
              :icon="collapseIcon"
              class="t-sidebar__collapse-icon"
            />
          </button>
        </div>
      </slot>

      <div class="t-sidebar__content">
        <nav class="t-sidebar__nav">
          <RouterLink
            v-for="item in menuItems"
            :key="item.route"
            :to="item.route"
            class="t-sidebar__nav-item"
            :class="{ 't-sidebar__nav-item--active': isMenuItemActive(item) }"
            :title="collapsed ? item.title : undefined"
            :style="item.color ? { '--menu-item-color': item.color } : {}"
            @click.stop
          >
            <Icon
              :icon="item.icon"
              class="t-sidebar__nav-icon"
            />

            <span
              class="t-sidebar__nav-text t-sidebar__text"
              :class="{ 't-sidebar__text--hidden': collapsed }"
            >
              {{ item.title }}
            </span>
          </RouterLink>
        </nav>
      </div>

      <div
        v-if="$slots.footer"
        class="t-sidebar__footer"
      >
        <slot
          name="footer"
          :collapsed="collapsed"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

interface MenuItem {
  route: string
  title: string
  icon: string
  activeRoutes?: string[]
  color?: string
}

export interface TSidebarToggleLabel {
  expand: string
  collapse: string
}

export interface TSidebarProps {
  collapsed?: boolean
  expandedWidth?: string
  collapsedWidth?: string
  position?: 'left' | 'right'
  persistent?: boolean
  menuItems: MenuItem[]
  headerIcon?: string
  headerLabel?: string
  expandIcon?: string
  collapseIcon?: string
  expandOnBodyClick?: boolean
  toggleLabel?: Partial<TSidebarToggleLabel>
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
  expandIcon: 'system-uicons:window-collapse-right',
  collapseIcon: 'system-uicons:window-collapse-left',
  expandOnBodyClick: true,
  nested: false
})

const emit = defineEmits<TSidebarEmits>()

const route = useRoute()
const collapsed = ref(props.collapsed)

const toggleLabel = computed<TSidebarToggleLabel>(() => ({
  expand: props.toggleLabel?.expand ?? 'Розгорнути',
  collapse: props.toggleLabel?.collapse ?? 'Згорнути'
}))

const isMenuItemActive = (item: MenuItem) => {
  const currentPath = route.path

  if (item.activeRoutes) {
    return item.activeRoutes.some(
      (activeRoute) =>
        currentPath === activeRoute ||
        currentPath.startsWith(activeRoute + '/')
    )
  }

  return currentPath === item.route
}

const toggle = () => {
  collapsed.value = !collapsed.value
  emit('update:collapsed', collapsed.value)
  emit('toggle', collapsed.value)
}

const onAsideClick = () => {
  if (collapsed.value && props.expandOnBodyClick) {
    toggle()
  }
}

watch(
  () => props.collapsed,
  (newValue) => {
    collapsed.value = newValue
  },
  { immediate: true }
)
</script>

<style scoped>
.t-sidebar {
  color: var(--t-color-text);
  user-select: none;
  flex-shrink: 0;

  /* fallback values if props are not passed */
  --nav-icon-size: 24px;
  --header-icon-size: 30px;


  --t-sidebar-expanded-w: 200px;
  --t-sidebar-header-padding: var(--t-space-3);
  --t-sidebar-border-w: 1px;
  --t-sidebar-collapsed-w: calc(var(--t-sidebar-header-padding) * 2 + var(--t-sidebar-border-w) + var(--header-icon-size));
  --t-sidebar-width: var(--t-sidebar-expanded-w);
  --t-sidebar-icon-center-left: calc((var(--t-sidebar-collapsed-w) - var(--t-sidebar-border-w)) / 2);

  /* Smoother width animation */
  width: var(--t-sidebar-width);
  will-change: width;
  transition: width 280ms cubic-bezier(0.2, 0, 0, 1);
}

.t-sidebar.t-sidebar--collapsed {
  --t-sidebar-width: var(--t-sidebar-collapsed-w);
}

/*
  Default mode: aside is an in-flow spacer that reserves width in the flex
  layout; the visible panel is pinned to the viewport via position: fixed.
  This avoids the 1px subpixel jitter that sticky positioning exhibits at
  scroll boundaries on tall pages.
*/
.t-sidebar__panel {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--t-sidebar-width);
  display: flex;
  flex-direction: column;
  background: var(--t-color-surface);
  border-right: var(--t-sidebar-border-w) solid var(--t-color-border);
  overflow: hidden;
  will-change: width;
  transition: width 280ms cubic-bezier(0.2, 0, 0, 1);
}

.t-sidebar--right .t-sidebar__panel {
  left: auto;
  right: 0;
  border-right: none;
  border-left: var(--t-sidebar-border-w) solid var(--t-color-border);
}

/*
  Nested mode: aside itself is sticky within its parent; panel fills it.
  Use this when the sidebar lives inside a container with its own scroll
  context (examples page, modal, nested panel).
*/
.t-sidebar--nested {
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  display: flex;
}

.t-sidebar--nested .t-sidebar__panel {
  position: static;
  width: 100%;
  height: 100%;
  transition: none;
}

/* Header — container with left logo, optional label, right collapse button */
.t-sidebar__header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--t-sidebar-header-padding) var(--t-sidebar-header-padding);
  gap: var(--t-space-3);
  transition: padding 280ms cubic-bezier(0.2, 0, 0, 1), gap 280ms cubic-bezier(0.2, 0, 0, 1);
}

/*
  Important: do NOT toggle justify-content.
  justify-content does not animate and causes the "snap".
  Instead, center the icon via symmetric padding that CAN animate.
*/
.t-sidebar--collapsed .t-sidebar__header {
  gap: 0;
}

/* Logo — either a button (collapsed, morphs) or a static span (expanded) */
.t-sidebar__logo {
  position: relative;
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
  color: var(--t-color-accent);
}

.t-sidebar__logo--trigger {
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--t-radius-mini, 4px);
}

.t-sidebar__logo--trigger:focus-visible {
  outline: 2px solid var(--t-color-focus-ring);
  outline-offset: 2px;
}

/* Trigger: two stacked icons, primary fades out when sidebar is hovered */
.t-sidebar__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--header-icon-size);
  height: var(--header-icon-size);
  flex-shrink: 0;
}

.t-sidebar__trigger-icon {
  position: absolute;
  inset: 0;
  width: var(--header-icon-size);
  height: var(--header-icon-size);
  transition: opacity 150ms ease;
  pointer-events: none;
}

.t-sidebar__trigger-icon--primary {
  opacity: 1;
  color: var(--t-color-accent);
}

.t-sidebar__trigger-icon--morph {
  opacity: 0;
  color: var(--t-color-text-muted);
}

/* Morph only while the mouse is physically over the sidebar (collapsed state). */
.t-sidebar--collapsed:hover .t-sidebar__trigger-icon--primary {
  opacity: 0;
}

.t-sidebar--collapsed:hover .t-sidebar__trigger-icon--morph {
  opacity: 1;
}

/* Keyboard: morph when the trigger button is keyboard-focused. */
.t-sidebar__logo--trigger:focus-visible .t-sidebar__trigger-icon--primary {
  opacity: 0;
}

.t-sidebar__logo--trigger:focus-visible .t-sidebar__trigger-icon--morph {
  opacity: 1;
}

/* Collapse button (right side of expanded header) */
.t-sidebar__collapse {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--header-icon-size) * 0.7);
  height: calc(var(--header-icon-size) * 0.7);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
  border-radius: var(--t-radius-mini, 4px);
  flex-shrink: 0;
  opacity: 0.5;
  transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
}

.t-sidebar__collapse:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
  color: var(--t-color-text);
  opacity: 1;
}

.t-sidebar__collapse:focus-visible {
  outline: 2px solid var(--t-color-focus-ring);
  outline-offset: 2px;
  opacity: 1;
}

.t-sidebar__collapse-icon {
  width: 100%;
  height: 100%;
}

.t-sidebar__header-label {
  font-size: var(--t-font-size-medium);
  font-weight: 600;
  color: var(--t-color-text);
  font-family: var(--t-font-ui);
}

/* Content */
.t-sidebar__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  --t-sidebar-content-padding: var(--t-space-1);
  padding: var(--t-sidebar-content-padding);
  transition: padding 280ms cubic-bezier(0.2, 0, 0, 1);
}


.t-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-1);
}

.t-sidebar__nav-item {
  display: flex;
  align-items: center;

  /* allow text to shrink smoothly inside a flex row */
  min-width: 0;

  gap: var(--t-space-3);
  padding: var(--t-space-3)
      calc(var(--t-sidebar-icon-center-left) - var( --t-sidebar-content-padding) - var(--nav-icon-size) / 2);

  color: var(--t-color-text-muted);
  text-decoration: none;
  border-radius: 0;

  font-weight: 500;
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);

  transition:
    background-color 160ms ease,
    color 160ms ease,
    padding 280ms cubic-bezier(0.2, 0, 0, 1),
    gap 280ms cubic-bezier(0.2, 0, 0, 1);
}

.t-sidebar__nav-item:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
  color: var(--t-color-text);
}

.t-sidebar__nav-item.router-link-active,
.t-sidebar__nav-item.t-sidebar__nav-item--active {
  background: var(--t-color-accent-plain-bg);
  color: var(--t-color-accent);
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
  background: color-mix(in srgb, var(--menu-item-color) 20%, transparent);
  color: var(--menu-item-color);
}

.t-sidebar__nav-icon {
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
  flex-shrink: 0;
  transition: transform 180ms ease-in-out;
}

/*
  Same trick as header: no justify-content toggles.
  Center the icon by computing symmetric padding based on collapsed width.
*/
.t-sidebar--collapsed .t-sidebar__nav-item {
  gap: 0;
}


.t-sidebar__nav-text {
  font-size: var(--t-font-size-default);
}

/*
  Text animation:
  - keep nodes mounted
  - shrink via max-width (removes layout space)
  - fade + slight translate
  Extra: min-width: 0 avoids flex overflow "snap".
*/
.t-sidebar__text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;

  /* allow shrinking inside flex rows */
  min-width: 0;

  max-width: 240px;
  opacity: 1;
  transform: translateX(0);

  will-change: max-width, opacity, transform;

  transition:
    max-width 280ms cubic-bezier(0.2, 0, 0, 1),
    opacity 180ms ease,
    transform 220ms ease;
}

.t-sidebar__text--hidden {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
  pointer-events: none;
}

/* Footer (slot-only — legacy hardcoded toggle removed in 0.4.0) */
.t-sidebar__footer {
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

@media (prefers-reduced-motion: reduce) {
  .t-sidebar,
  .t-sidebar__header,
  .t-sidebar__content,
  .t-sidebar__nav-item,
  .t-sidebar__nav-icon,
  .t-sidebar__text,
  .t-sidebar__trigger-icon {
    transition: none !important;
  }
}
</style>
