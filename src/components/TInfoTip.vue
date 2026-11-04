<script setup lang="ts">
import Tooltip from './TTooltip.vue'
import Icon from './TIcon.vue'
import type { TTooltipPlacement } from './TTooltip.vue'

export interface TInfoTipProps {
  text: string
  placement?: TTooltipPlacement
}

withDefaults(defineProps<TInfoTipProps>(), {
  placement: 'top',
})
</script>

<template>
  <Tooltip
    :content="text"
    :placement="placement"
  >
    <template
      v-if="$slots.default"
      #tooltip
    >
      <slot />
    </template>
    <span
      class="t-info-tip"
      tabindex="0"
      role="img"
      :aria-label="text"
    ><Icon icon="ticon:info" /></span>
  </Tooltip>
</template>

<style scoped>
.t-info-tip {
  display: inline-flex;
  color: var(--t-color-text-muted);
  cursor: help;
}
</style>
