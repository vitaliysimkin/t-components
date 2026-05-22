<script setup lang="ts">
import { ref } from 'vue'
import { TCheckbox } from '@vitaliysimkin/t-components'

const accepted = ref(false)
const subscribed = ref(true)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <TCheckbox
      v-model="accepted"
      label="Accept terms and conditions"
    />
    <TCheckbox
      v-model="subscribed"
      label="Subscribe to newsletter"
    />
    <p style="font-size: 0.875rem; color: var(--t-color-text-muted);">
      accepted: {{ accepted }}, subscribed: {{ subscribed }}
    </p>
  </div>
</template>
