<script setup lang="ts">
import { TCard, TTag } from '@vitaliysimkin/t-components'
</script>

<template>
  <TCard>
    <template #header>
      <span style="display: flex; align-items: center; gap: 8px;">
        Custom Header
        <TTag label="new" variant="blue" size="small" />
      </span>
    </template>
    The <code>#header</code> slot overrides the <code>header</code> prop and
    accepts rich VNode content — here with an inline TTag badge.
  </TCard>
</template>
