<script setup lang="ts">
import { TEmpty } from '@vitaliysimkin/t-components'
</script>

<template>
  <div class="demo">
    <TEmpty description="No cache entries yet" />
    <TEmpty
      icon="material-symbols-light:folder-open-outline"
      description="No files found"
    />
    <TEmpty description="Everything looks clear here" />
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
