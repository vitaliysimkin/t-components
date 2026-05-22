<script setup lang="ts">
import { TCard, TButton } from '@vitaliysimkin/t-components'
</script>

<template>
  <TCard header="Confirm Action">
    <p>Are you sure you want to proceed? This operation cannot be undone.</p>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <TButton mode="plain" label="Cancel" />
        <TButton variant="danger" label="Delete" />
      </div>
    </template>
  </TCard>
</template>

<style scoped>
p {
  margin: 0;
}
</style>
