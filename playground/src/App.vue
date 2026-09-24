<template>
  <div class="app">
    <TSidebar
      v-model:collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      header-icon="material-symbols-light:widgets-outline"
      header-label="t-components"
    >
      <template #footer>
        <div
          class="sidebar-foot"
          :class="{ 'sidebar-foot--collapsed': sidebarCollapsed }"
        >
          <span
            class="sidebar-foot__version"
            :class="{ 'sidebar-foot__version--hidden': sidebarCollapsed }"
          >v{{ version }}</span>

          <!-- Expanded: segmented light / auto / dark -->
          <div
            v-if="!sidebarCollapsed"
            class="theme-seg"
            role="radiogroup"
            aria-label="Theme"
          >
            <button
              v-for="t in themeOrder"
              :key="t"
              type="button"
              class="theme-seg__btn"
              role="radio"
              :aria-checked="currentTheme === t"
              :title="themeLabels[t]"
              @click.stop="setTheme(t)"
            >
              <Icon :icon="themeIcons[t]" />
            </button>
          </div>

          <!-- Collapsed: single button that cycles -->
          <button
            v-else
            type="button"
            class="theme-cycle"
            :title="themeTitle"
            :aria-label="themeTitle"
            @click.stop="cycleTheme"
          >
            <Icon :icon="themeIcon" />
          </button>
        </div>
      </template>
    </TSidebar>

    <main class="app-main">
      <RouterView />
    </main>
    <TNotifications />
    <TModalBoxHost />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { Icon } from '@iconify/vue'
import {
  currentTheme,
  applyTheme,
  type Theme,
  TSidebar,
  TNotifications,
  TModalBoxHost
} from '@vitaliysimkin/t-components'
import { elements } from './examples/index'
import pkg from '../../package.json'

const version = pkg.version

const sidebarCollapsed = ref(
  localStorage.getItem('playground:sidebarCollapsed') === 'true'
)
watchEffect(() => {
  localStorage.setItem(
    'playground:sidebarCollapsed',
    String(sidebarCollapsed.value)
  )
})

/* Menu groups. Order here = order in the sidebar. Slugs not listed fall into "Other". */
const groupOrder = ['Guide', 'Actions', 'Forms', 'Data', 'Navigation', 'Feedback', 'Other'] as const
const groupBySlug: Record<string, (typeof groupOrder)[number]> = {
  button: 'Actions', 'button-group': 'Actions', dropdown: 'Actions',
  input: 'Forms', textarea: 'Forms', select: 'Forms', checkbox: 'Forms', switch: 'Forms',
  'date-input': 'Forms', 'time-input': 'Forms', 'datetime-input': 'Forms', 'date-picker': 'Forms',
  'form-field': 'Forms', 'form-validation': 'Forms',
  table: 'Data', tag: 'Data', badge: 'Data', card: 'Data', tree: 'Data', empty: 'Data',
  icons: 'Data', tooltip: 'Data', 'code-editor': 'Data', 'diff-editor': 'Data',
  sidebar: 'Navigation', 'bottom-nav': 'Navigation', tabs: 'Navigation',
  modal: 'Feedback', dialog: 'Feedback', notifications: 'Feedback', loading: 'Feedback',
  'collapse-transition': 'Feedback'
}

const menuItems = computed(() => {
  const items = elements.map((el) => ({
    route: `/components/${el.slug}`,
    title: el.label,
    icon: el.icon,
    activeRoutes: [`/components/${el.slug}`],
    group: groupBySlug[el.slug] ?? 'Other'
  }))
  const guide = [{
    route: '/design',
    title: 'Design tokens',
    icon: 'material-symbols-light:palette-outline',
    activeRoutes: ['/design'],
    group: 'Guide' as const
  }]
  return [...guide, ...items].sort(
    (a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)
  )
})

const themeOrder: Theme[] = ['light', 'auto', 'dark']
const themeIcons: Record<Theme, string> = {
  light: 'system-uicons:sun',
  dark: 'system-uicons:moon',
  auto: 'system-uicons:display-alt'
}
const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto (system)'
}

const themeIcon = computed(() => themeIcons[currentTheme.value])
const themeTitle = computed(() => `Theme: ${themeLabels[currentTheme.value]}`)

function setTheme(t: Theme) {
  currentTheme.value = t
  applyTheme(t)
}

function cycleTheme() {
  const idx = themeOrder.indexOf(currentTheme.value)
  setTheme(themeOrder[(idx + 1) % themeOrder.length])
}
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  background: var(--t-color-bg);
}

.sidebar-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--t-space-2);
  padding: var(--t-space-2) var(--t-space-3);
  min-height: 2.75rem;
}

.sidebar-foot--collapsed {
  justify-content: center;
  padding: var(--t-space-2);
}

.sidebar-foot__version {
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  max-width: 120px;
  transition: max-width var(--t-duration-slow) var(--t-ease), opacity var(--t-duration) ease;
}

.sidebar-foot__version--hidden {
  max-width: 0;
  opacity: 0;
}

.theme-seg {
  display: inline-flex;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  background: var(--t-color-surface);
  overflow: hidden;
}

.theme-seg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background var(--t-duration) ease, color var(--t-duration) ease;
}

.theme-seg__btn + .theme-seg__btn {
  border-left: 1px solid var(--t-color-border);
}

.theme-seg__btn:hover {
  background: var(--t-color-hover);
  color: var(--t-color-text);
}

.theme-seg__btn[aria-checked='true'] {
  background: var(--t-color-accent-plain-bg);
  color: var(--t-color-accent);
}

.theme-cycle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--t-radius-default);
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  transition: background var(--t-duration) ease, color var(--t-duration) ease;
}

.theme-cycle:hover {
  background: var(--t-color-hover);
  color: var(--t-color-text);
}
</style>
