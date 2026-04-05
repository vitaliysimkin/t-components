<template>
  <div class="app">
    <header class="app-header">
      <span class="app-title">t-components</span>
      <div class="theme-toggle">
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          :class="['theme-btn', { active: currentTheme === opt.value }]"
          :title="opt.label"
          @click="setTheme(opt.value)"
        >
          <Icon :icon="opt.icon" />
        </button>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { currentTheme, applyTheme, type Theme } from 't-components'

const themeOptions = [
  { value: 'light' as Theme, icon: 'system-uicons:sun', label: 'Light' },
  { value: 'dark' as Theme, icon: 'system-uicons:moon', label: 'Dark' },
  { value: 'auto' as Theme, icon: 'system-uicons:refresh', label: 'Auto' },
]

function setTheme(theme: Theme) {
  currentTheme.value = theme
  applyTheme(theme)
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--t-space-3) var(--t-space-5);
  background: var(--t-color-surface);
  border-bottom: 1px solid var(--t-color-border);
}

.app-title {
  font-weight: 600;
  font-size: var(--t-font-size-large);
  color: var(--t-color-text);
}

.theme-toggle {
  display: flex;
  gap: var(--t-space-1);
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.theme-btn:hover {
  background: var(--t-color-surface-2);
  color: var(--t-color-text);
}

.theme-btn.active {
  background: var(--t-color-accent-plain-bg);
  color: var(--t-color-accent);
  border-color: var(--t-color-accent);
}

.app-main {
  flex: 1;
}
</style>
