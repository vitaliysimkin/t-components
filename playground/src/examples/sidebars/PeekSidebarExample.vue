<script setup lang="ts">
import { ref } from 'vue'
import { TSidebar } from '@vitaliysimkin/t-components'

const collapsed = ref(true)

const menuItems = [
  { route: '/demo/dashboard', title: 'Dashboard', icon: 'material-symbols-light:space-dashboard-outline', group: 'Main' },
  { route: '/demo/inbox', title: 'Inbox', icon: 'material-symbols-light:inbox-outline', group: 'Main' },
  { route: '/demo/reports', title: 'Reports', icon: 'material-symbols-light:bar-chart', group: 'Workspace' },
  { route: '/demo/settings', title: 'Settings', icon: 'material-symbols-light:settings-outline', group: 'Workspace' }
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
      expand-mode="peek"
      nested
    /> <!-- peek: hover (or Tab into) the rail to see it over the content; the pin keeps it open -->
    <div class="content">
      Content stays in place while the sidebar peeks; it moves once when pinned ({{ collapsed ? 'collapsed' : 'pinned' }}).
    </div>
  </div>
</template>

<style scoped>
.frame {
  display: flex;
  height: 420px;
  width: 100%;
}
.frame :deep(.t-sidebar) { height: 100%; }
.content {
  flex: 1;
  padding: var(--t-space-4);
  color: var(--t-color-text-muted);
}
</style>
