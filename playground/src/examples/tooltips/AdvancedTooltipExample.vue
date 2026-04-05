<template>
  <TTooltip content="Input tooltip">
    <input type="text" placeholder="Focus or hover">
  </TTooltip>
  
  <TTooltip content="Help button" placement="right">
    <button>?</button>
  </TTooltip>
  
  <TTooltip content="Disabled tooltip" :disabled="true">
    <TButton variant="neutral">Disabled</TButton>
  </TTooltip>
</template>

<script setup lang="ts">
import { TTooltip } from 't-components'
import { TButton } from 't-components'
</script>