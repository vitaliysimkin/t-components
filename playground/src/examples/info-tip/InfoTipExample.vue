<script setup lang="ts">
import { TInfoTip } from '@vitaliysimkin/t-components'
</script>

<template>
  <div class="demo">
    Port
    <TInfoTip text="Leave empty to pick a free port automatically" />
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}
</style>
