<script setup lang="ts">
import { TBadge, TButton } from '@vitaliysimkin/t-components'
</script>

<template>
  <div class="examples">
    <TBadge :value="3">
      <TButton label="Messages" />
    </TBadge>

    <TBadge value="new">
      <TButton label="Updates" />
    </TBadge>

    <TBadge :value="0">
      <TButton label="Zero count" />
    </TBadge>
  </div>
</template>

<style scoped>
.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
}
</style>
