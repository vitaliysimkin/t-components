<script setup lang="ts">
import { ref } from 'vue'
import { TCheckbox } from '@vitaliysimkin/t-components'

const checked = ref(true)
const unchecked = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <TCheckbox v-model="unchecked" disabled label="Disabled unchecked" />
    <TCheckbox v-model="checked"   disabled label="Disabled checked" />
  </div>
</template>
