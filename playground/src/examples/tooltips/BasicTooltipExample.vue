<template>
  <TTooltip content="Simple tooltip">
    <TButton variant="neutral">Basic</TButton>
  </TTooltip>
  
  <TTooltip>
    <template #tooltip>
      <strong>HTML content</strong><br>
      <small>Rich formatting</small>
    </template>
    <TButton variant="accent">Rich</TButton>
  </TTooltip>
</template>

<script setup lang="ts">
import { TTooltip } from '@vitaliysimkin/t-components'
import { TButton } from '@vitaliysimkin/t-components'
</script>