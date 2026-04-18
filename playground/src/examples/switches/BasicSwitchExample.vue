<script setup lang="ts">
import { ref } from 'vue'
import { TSwitch } from '@vitaliysimkin/t-components'

const checked = ref(false)
</script>

<template>
  <TSwitch
    v-model="checked"
    label="Enable notifications"
  />
</template>
