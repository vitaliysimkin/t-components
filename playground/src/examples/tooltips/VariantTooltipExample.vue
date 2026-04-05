<template>
  <TTooltip content="Neutral" variant="neutral">
    <TButton variant="neutral">Neutral</TButton>
  </TTooltip>
  
  <TTooltip content="Info" variant="info">
    <TButton variant="info">Info</TButton>
  </TTooltip>
  
  <TTooltip content="Success" variant="success">
    <TButton variant="success">Success</TButton>
  </TTooltip>
  
  <TTooltip content="Warning" variant="warning">
    <TButton variant="accent">Warning</TButton>
  </TTooltip>
  
  <TTooltip content="Danger" variant="danger">
    <TButton variant="danger">Danger</TButton>
  </TTooltip>
</template>

<script setup lang="ts">
import { TTooltip } from '@vitaliysimkin/t-components'
import { TButton } from '@vitaliysimkin/t-components'
</script>