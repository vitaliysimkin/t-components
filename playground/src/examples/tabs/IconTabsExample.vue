<template>
  <TTabs v-model="tab" :tabs="items">
    <template #panel-profile>
      <div class="panel">Profile settings.</div>
    </template>
    <template #panel-security>
      <div class="panel">Password & 2FA.</div>
    </template>
    <template #panel-tokens>
      <div class="panel">API tokens.</div>
    </template>
    <template #panel-prefs>
      <div class="panel">Preferences (theme, language).</div>
    </template>
  </TTabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TTabs } from '@vitaliysimkin/t-components'
import type { TTabItem } from '@vitaliysimkin/t-components'

const tab = ref<string | number>('profile')

const items: TTabItem[] = [
  { value: 'profile', label: 'Profile', icon: 'material-symbols-light:person-outline' },
  { value: 'security', label: 'Security', icon: 'material-symbols-light:lock-outline' },
  { value: 'tokens', label: 'API tokens', icon: 'material-symbols-light:key-outline', badge: 3 },
  { value: 'prefs', label: 'Preferences', icon: 'material-symbols-light:tune' }
]
</script>

<style scoped>
.panel {
  padding: var(--t-space-4);
  color: var(--t-color-text);
}
</style>
