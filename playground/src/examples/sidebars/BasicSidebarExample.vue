<script setup lang="ts">
import { ref } from 'vue'
import { TSidebar } from '@vitaliysimkin/t-components'

const collapsed = ref(true)

const menuItems = [
  { route: '/demo/dashboard', title: 'Dashboard', icon: 'material-symbols-light:space-dashboard-outline' },
  { route: '/demo/prompts', title: 'Prompts', icon: 'material-symbols-light:integration-instructions-outline' },
  { route: '/demo/settings', title: 'Settings', icon: 'material-symbols-light:settings-outline' }
]
</script>

<template>
  <!-- swallow demo nav -->
  <div
    class="frame"
    @click.capture.prevent
  >
    <TSidebar
      v-model:collapsed="collapsed"
      :menu-items="menuItems"
      header-icon="system-uicons:document-stack"
      header-label="Demo App"
      nested
    /> <!-- nested: only for embedded sidebars -->
  </div>
</template>

<style scoped>
.frame {
  display: flex;
  height: 420px;
  width: 100%;
}
.frame :deep(.t-sidebar) { height: 100%; }
</style>
