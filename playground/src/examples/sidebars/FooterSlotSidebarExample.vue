<script setup lang="ts">
import { ref } from 'vue'
import { TSidebar } from '@vitaliysimkin/t-components'

const collapsed = ref(false)

const menuItems = [
  { route: '/demo/home', title: 'Home', icon: 'material-symbols-light:home-outline' },
  { route: '/demo/library', title: 'Library', icon: 'material-symbols-light:menu-book-outline' }
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
      header-label="With Footer"
      nested
    >
      <!-- nested: only for embedded sidebars -->
      <template #footer="{ collapsed: c }">
        <div class="user">
          <div class="user__avatar">
            D
          </div>
          <div
            v-show="!c"
            class="user__info"
          >
            <span class="user__name">Demo User</span>
            <span class="user__role">Member</span>
          </div>
        </div>
      </template>
    </TSidebar>
  </div>
</template>

<style scoped>
.frame {
  display: flex;
  height: 420px;
  width: 100%;
}
.frame :deep(.t-sidebar) { height: 100%; }

.user {
  display: flex;
  align-items: center;
  gap: var(--t-space-3);
  padding: var(--t-space-3);
  color: var(--t-color-text);
}
.user__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--t-color-accent);
  color: var(--t-color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.user__info { display: flex; flex-direction: column; min-width: 0; }
.user__name { font-size: var(--t-font-size-default); font-weight: 500; }
.user__role { font-size: 0.75rem; color: var(--t-color-text-muted); }
</style>
