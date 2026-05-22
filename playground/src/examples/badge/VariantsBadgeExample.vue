<script setup lang="ts">
import { TBadge, TButton } from '@vitaliysimkin/t-components'

const variants = ['danger', 'accent', 'success', 'warning', 'info', 'neutral'] as const
</script>

<template>
  <div class="examples">
    <TBadge
      v-for="v in variants"
      :key="v"
      :value="7"
      :variant="v"
    >
      <TButton :label="v" />
    </TBadge>
  </div>

  <div class="examples" style="margin-top: 1.5rem;">
    <TBadge
      v-for="v in variants"
      :key="v"
      dot
      :variant="v"
    >
      <TButton :label="`dot · ${v}`" />
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
