<script setup lang="ts">
import Icon from './TIcon.vue'

export interface TEmptyProps {
  description?: string
  icon?: string
}

withDefaults(defineProps<TEmptyProps>(), {
  icon: 'ticon:inbox',
})
</script>

<template>
  <div class="t-empty">
    <div class="t-empty__icon">
      <slot name="icon">
        <Icon
          :icon="icon"
          class="t-empty__icon-svg"
        />
      </slot>
    </div>
    <p
      v-if="description"
      class="t-empty__description"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="t-empty__content"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.t-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--t-space-3);
  padding: var(--t-space-7) var(--t-space-4);
  text-align: center;
}

.t-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--t-color-text-muted);
}

.t-empty__icon-svg {
  font-size: 3rem;
}

.t-empty__description {
  margin: 0;
  font-size: var(--t-font-size-default);
  color: var(--t-color-text-muted);
  line-height: var(--t-line-height);
}

.t-empty__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--t-space-2);
}
</style>
