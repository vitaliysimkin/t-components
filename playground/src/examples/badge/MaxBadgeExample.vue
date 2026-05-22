<script setup lang="ts">
import { TBadge, TButton } from '@vitaliysimkin/t-components'
</script>

<template>
  <div class="examples">
    <TBadge :value="5" :max="99">
      <TButton label="5 / max 99" />
    </TBadge>

    <TBadge :value="100" :max="99">
      <TButton label="100 / max 99 → 99+" />
    </TBadge>

    <TBadge :value="999" :max="99">
      <TButton label="999 / max 99 → 99+" />
    </TBadge>

    <TBadge :value="999" :max="9">
      <TButton label="999 / max 9 → 9+" />
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
