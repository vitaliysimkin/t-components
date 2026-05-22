<script setup lang="ts">
import { TCard } from '@vitaliysimkin/t-components'
</script>

<template>
  <TCard header="Card Title">
    <p>This card uses the <code>header</code> prop to set its title.</p>
    <p>The body accepts any content via the default slot.</p>
  </TCard>
</template>

<style scoped>
p {
  margin: 0 0 0.5rem;
}
p:last-child {
  margin-bottom: 0;
}
</style>
