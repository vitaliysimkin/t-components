<template>
  <aside
    class="t-sidebar"
    :class="{
      't-sidebar--collapsed': collapsed,
      't-sidebar--right': position === 'right'
    }"
  >
    <div class="t-sidebar__header" v-if="headerIcon || headerLabel">
      <Icon v-if="headerIcon" :icon="headerIcon" class="t-sidebar__header-icon" />

      <!-- Keep text in DOM. Animate it instead of v-if/v-show. -->
      <span
        v-if="headerLabel"
        class="t-sidebar__header-label t-sidebar__text"
        :class="{ 't-sidebar__text--hidden': collapsed }"
      >
        {{ headerLabel }}
      </span>
    </div>

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
        >
          <Icon :icon="item.icon" class="t-sidebar__nav-icon" />

          <!-- Keep text in DOM. Animate it instead of v-if. -->
          <span
            class="t-sidebar__nav-text t-sidebar__text"
            :class="{ 't-sidebar__text--hidden': collapsed }"
          >
            {{ item.title }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div class="t-sidebar__footer">
      <TButton
        variant="neutral"
        mode="text"
        size="fit"
        :icon="
          collapsed
            ? 'system-uicons:window-collapse-right'
            : 'system-uicons:window-collapse-left'
        "
        :title="collapsed ? 'Розгорнути' : 'Згорнути'"
        @click="toggle"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import TButton from './TButton.vue'

interface MenuItem {
  route: string
  title: string
  icon: string
  activeRoutes?: string[]
  color?: string
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
}

export interface TSidebarEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'toggle', collapsed: boolean): void
}

const props = withDefaults(defineProps<TSidebarProps>(), {
  collapsed: true,
  position: 'left',
  persistent: false
})

const emit = defineEmits<TSidebarEmits>()

const route = useRoute()
const collapsed = ref(props.collapsed)

// Функція для перевірки чи маршрут активний
const isMenuItemActive = (item: MenuItem) => {
  const currentPath = route.path
  
  if (item.activeRoutes) {
    return item.activeRoutes.some(activeRoute => currentPath.startsWith(activeRoute))
  }
  
  return currentPath === item.route
}

const toggle = () => {
  collapsed.value = !collapsed.value
  emit('update:collapsed', collapsed.value)
  emit('toggle', collapsed.value)
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
  height: 100vh;
  background: var(--t-oc-gray-9);
  border-right: var(--t-sidebar-border-w) solid var(--t-oc-gray-7);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: var(--t-oc-gray-1);

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

.t-sidebar--right {
  border-right: none;
  border-left: 1px solid var(--t-oc-gray-7);
}

/* Header */
.t-sidebar__header {
  display: flex;
  align-items: center;
  padding: var(--t-sidebar-header-padding) var(--t-sidebar-header-padding);
  /* border-bottom: 1px solid var(--t-oc-gray-7); */
  gap: var(--t-space-3);
  transition: padding 280ms cubic-bezier(0.2, 0, 0, 1), gap 280ms cubic-bezier(0.2, 0, 0, 1);
}

/*
  Important: do NOT toggle justify-content.
  justify-content does not animate and causes the “snap”.
  Instead, center the icon via symmetric padding that CAN animate.
*/
.t-sidebar--collapsed .t-sidebar__header {
  gap: 0;
}

.t-sidebar__header-icon {
  width: var(--header-icon-size);
  height: var(--header-icon-size);
  color: var(--t-oc-blue-3);
  flex-shrink: 0;
}

.t-sidebar__header-label {
  font-size: var(--t-font-size-medium);
  font-weight: 600;
  color: var(--t-oc-gray-1);
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

  color: var(--t-oc-gray-4);
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
  background: var(--t-oc-gray-8);
  color: var(--t-oc-gray-2);
}

.t-sidebar__nav-item.router-link-active,
.t-sidebar__nav-item.t-sidebar__nav-item--active {
  background: color-mix(in srgb, var(--t-oc-blue-4) 20%, transparent);
  color: var(--t-oc-blue-3);
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
  Extra: min-width: 0 avoids flex overflow “snap”.
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

/* Footer */
.t-sidebar__footer {
  padding: var(--t-space-1);
  height: calc(var(--header-icon-size) * 1.4);
  font-size: 20px;
  box-sizing: content-box;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

/* Scrollbar styling */
.t-sidebar__content::-webkit-scrollbar {
  width: 6px;
}

.t-sidebar__content::-webkit-scrollbar-track {
  background: transparent;
}

.t-sidebar__content::-webkit-scrollbar-thumb {
  background: var(--t-oc-gray-7);
  border-radius: var(--t-radius-mini);
}

.t-sidebar__content::-webkit-scrollbar-thumb:hover {
  background: var(--t-oc-gray-6);
}

@media (prefers-reduced-motion: reduce) {
  .t-sidebar,
  .t-sidebar__header,
  .t-sidebar__content,
  .t-sidebar__nav-item,
  .t-sidebar__nav-icon,
  .t-sidebar__text {
    transition: none !important;
  }
}
</style>
