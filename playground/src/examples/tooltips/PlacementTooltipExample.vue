<template>
  <TTooltip content="Top" placement="top">
    <TButton variant="neutral">Top</TButton>
  </TTooltip>
  
  <TTooltip content="Right" placement="right">
    <TButton variant="neutral">Right</TButton>
  </TTooltip>
  
  <TTooltip content="Bottom" placement="bottom">
    <TButton variant="neutral">Bottom</TButton>
  </TTooltip>
  
  <TTooltip content="Left" placement="left">
    <TButton variant="neutral">Left</TButton>
  </TTooltip>
</template>

<script setup lang="ts">
import { TTooltip } from 't-components'
import { TButton } from 't-components'
</script>