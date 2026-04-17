<template>
  <div class="app">
    <TSidebar
      v-model:collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      header-icon="material-symbols-light:widgets-outline"
      header-label="t-components"
    >
      <template #footer>
        <button
          type="button"
          class="theme-cycle"
          :class="{ 'theme-cycle--collapsed': sidebarCollapsed }"
          :title="themeTitle"
          :aria-label="themeTitle"
          @click.stop="cycleTheme"
        >
          <Icon :icon="themeIcon" class="theme-cycle__icon" />
          <span
            class="theme-cycle__label"
            :class="{ 'theme-cycle__label--hidden': sidebarCollapsed }"
          >
            {{ themeLabels[currentTheme] }}
          </span>
        </button>
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

const sidebarCollapsed = ref(
  localStorage.getItem('playground:sidebarCollapsed') === 'true'
)
watchEffect(() => {
  localStorage.setItem(
    'playground:sidebarCollapsed',
    String(sidebarCollapsed.value)
  )
})

const menuItems = computed(() =>
  elements.map((el) => ({
    route: `/components/${el.slug}`,
    title: el.label,
    icon: el.icon,
    activeRoutes: [`/components/${el.slug}`]
  }))
)

const themeOrder: Theme[] = ['light', 'dark', 'auto']
const themeIcons: Record<Theme, string> = {
  light: 'system-uicons:sun',
  dark: 'system-uicons:moon',
  auto: 'system-uicons:display-alt'
}
const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Theme: auto'
}

const themeIcon = computed(() => themeIcons[currentTheme.value])
const themeTitle = computed(() => `Theme: ${themeLabels[currentTheme.value]}`)

function cycleTheme() {
  const idx = themeOrder.indexOf(currentTheme.value)
  const next = themeOrder[(idx + 1) % themeOrder.length]
  currentTheme.value = next
  applyTheme(next)
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

.theme-cycle {
  display: flex;
  align-items: center;
  gap: var(--t-space-3);
  width: 100%;
  padding: var(--t-space-3);
  background: transparent;
  border: none;
  color: var(--t-color-text-muted);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: background 160ms ease, color 160ms ease;
}

.theme-cycle:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
  color: var(--t-color-text);
}

.theme-cycle--collapsed {
  justify-content: center;
  gap: 0;
}

.theme-cycle__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.theme-cycle__label {
  font-size: var(--t-font-size-default);
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
  max-width: 240px;
  opacity: 1;
  transform: translateX(0);
  transition:
    max-width 280ms cubic-bezier(0.2, 0, 0, 1),
    opacity 180ms ease,
    transform 220ms ease;
}

.theme-cycle__label--hidden {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
  pointer-events: none;
}
</style>
