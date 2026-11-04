<script setup lang="ts">
import { TCopyChip, useNotifications } from '@vitaliysimkin/t-components'

const { info } = useNotifications()
</script>

<template>
  <div class="demo">
    <TCopyChip
      value="npm run check:fast"
      title="Copy command"
      @copy="info('Copied: npm run check:fast')"
    />
    <TCopyChip
      value="Review the diff and fix the failing tests."
      label="Prompt for agent"
      title="Copy prompt"
      @copy="info('Prompt copied')"
    />
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  gap: var(--t-space-3);
  flex-wrap: wrap;
}
</style>
