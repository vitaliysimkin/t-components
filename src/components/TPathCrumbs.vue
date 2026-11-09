<script setup lang="ts">
import { computed } from 'vue'

export interface TPathCrumbsProps {
  /** `/`-separated path: folders muted, the file name bold */
  path: string
}

const props = defineProps<TPathCrumbsProps>()

const parts = computed(() => props.path.split('/').filter(Boolean))
</script>

<template>
  <span
    class="t-path-crumbs"
    :title="path"
  >
    <template
      v-for="(p, i) in parts.slice(0, -1)"
      :key="i"
    >
      <span
        class="t-path-crumbs__dir"
        :title="p"
      >{{ p }}</span>
      <span
        class="t-path-crumbs__sep"
        aria-hidden="true"
      >›</span>
    </template>
    <Transition
      enter-active-class="t-path-crumbs__name--enter"
      leave-active-class="t-path-crumbs__name--leave"
    >
      <b
        :key="path"
        class="t-path-crumbs__name"
      >{{ parts[parts.length - 1] }}</b>
    </Transition>
    <slot />
  </span>
</template>

<style scoped>
.t-path-crumbs {
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-1);
  min-width: 0;
  white-space: nowrap;
}

.t-path-crumbs__dir {
  min-width: 2ch;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--t-color-text-muted);
}

.t-path-crumbs__sep {
  flex: none;
  color: var(--t-color-border-strong);
}

.t-path-crumbs__name {
  min-width: 4ch;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: var(--t-font-weight-semibold);
}

/* Name rises and fades in on path change. No movement at reduced, instant at off. */
.t-path-crumbs__name--enter {
  animation: t-path-crumbs-rise var(--t-duration) var(--t-ease);
}

/* The old name is removed at once (no overlap with the new one). */
.t-path-crumbs__name--leave {
  display: none;
}

@keyframes t-path-crumbs-rise {
  from { opacity: 0; transform: translateY(calc(4px * var(--t-motion-move))); }
}
</style>
