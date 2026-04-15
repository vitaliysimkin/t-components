<template>
  <span 
    class="t-tag" 
    :class="[
      `t-tag--${variant}`,
      `t-tag--${size}`,
      { 't-tag--removable': removable }
    ]"
  >
    <slot>{{ label }}</slot>
    <button 
      v-if="removable" 
      class="t-tag__remove"
      @click="$emit('remove')"
      type="button"
      aria-label="Remove tag"
    >
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
export interface TTagProps {
  label?: string
  variant?: 'gray' | 'blue' | 'red' | 'green' | 'teal' | 'yellow' | 'orange'
  size?: 'small' | 'medium' | 'large'
  removable?: boolean
}

export interface TTagEmits {
  (e: 'remove'): void
}

withDefaults(defineProps<TTagProps>(), {
  variant: 'gray',
  size: 'medium',
  removable: false
})

defineEmits<TTagEmits>()
</script>

<style scoped>
.t-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  cursor: default;
}

/* Sizes */
.t-tag--small {
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.3;
}

.t-tag--medium {
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.4;
}

.t-tag--large {
  padding: 6px 10px;
  font-size: 13px;
  line-height: 1.4;
}

/* Color variants */
.t-tag--gray {
  color: var(--t-color-tag-gray);
  background: var(--t-color-tag-gray-bg);
}

.t-tag--blue {
  color: var(--t-color-tag-blue);
  background: var(--t-color-tag-blue-bg);
}

.t-tag--red {
  color: var(--t-color-tag-red);
  background: var(--t-color-tag-red-bg);
}

.t-tag--green {
  color: var(--t-color-tag-green);
  background: var(--t-color-tag-green-bg);
}

.t-tag--teal {
  color: var(--t-color-tag-gray);
  background: color-mix(
  in srgb,
  var(--t-color-tag-gray-bg) 50%,
  transparent
);
}

.t-tag--yellow {
  color: var(--t-color-tag-yellow);
  background: var(--t-color-tag-yellow-bg);
}

.t-tag--orange {
  color: var(--t-color-tag-orange);
  background: var(--t-color-tag-orange-bg);
}

/* Remove button */
.t-tag__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.t-tag__remove:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.t-tag__remove:active {
  background: color-mix(in srgb, currentColor 25%, transparent);
}

.t-tag--removable {
  padding-right: 4px;
}

.t-tag--small.t-tag--removable {
  padding-right: 2px;
}

.t-tag--small .t-tag__remove {
  width: 14px;
  height: 14px;
  font-size: 12px;
  margin-left: 1px;
}

.t-tag--large .t-tag__remove {
  width: 18px;
  height: 18px;
  font-size: 16px;
  margin-left: 3px;
}
</style>