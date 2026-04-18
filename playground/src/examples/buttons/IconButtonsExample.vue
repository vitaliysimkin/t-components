<template>
  <TButton
    variant="success"
    icon="system-uicons:check"
    label="Save"
  />
  <TButton
    variant="neutral"
    mode="plain"
    icon="system-uicons:cross"
    label="Cancel"
  />
  <TButton
    variant="accent"
    mode="plain"
    icon="system-uicons:refresh"
    label="Refresh"
  />
</template>

<script setup lang="ts">
import { TButton } from '@vitaliysimkin/t-components'
</script>
