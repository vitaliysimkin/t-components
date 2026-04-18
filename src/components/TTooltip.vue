<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, useAttrs } from 'vue'

export type TTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TTooltipVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export type TTooltipTrigger = 'hover' | 'click' | 'focus' | 'manual'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

export interface TTooltipProps {
  content?: string
  placement?: TTooltipPlacement
  variant?: TTooltipVariant
  disabled?: boolean
  trigger?: TTooltipTrigger
}

const props = withDefaults(defineProps<TTooltipProps>(), {
  placement: 'top',
  variant: 'neutral',
  disabled: false,
  trigger: 'hover'
})


const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const isVisible = ref(false)
const positionReady = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

const shouldShow = computed(() => !props.disabled && (props.content || !!slots.tooltip))

let timeoutId: number | null = null

const calculatePosition = async () => {
  if (!triggerRef.value || !tooltipRef.value) {
    // If tooltip ref is not available yet, try again after a short delay
    setTimeout(() => calculatePosition(), 10)
    return
  }

  await nextTick()

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollTop - tooltipRect.height - 8
      left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2
      break
    case 'bottom':
      top = triggerRect.bottom + scrollTop + 8
      left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2
      break
    case 'left':
      top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2
      left = triggerRect.left + scrollLeft - tooltipRect.width - 8
      break
    case 'right':
      top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2
      left = triggerRect.right + scrollLeft + 8
      break
  }

  // Keep tooltip within viewport bounds
  const padding = 8
  const maxLeft = window.innerWidth + scrollLeft - tooltipRect.width - padding
  const maxTop = window.innerHeight + scrollTop - tooltipRect.height - padding

  left = Math.max(padding + scrollLeft, Math.min(left, maxLeft))
  top = Math.max(padding + scrollTop, Math.min(top, maxTop))

  tooltipPosition.value = { top, left }
  positionReady.value = true
}

const showTooltip = async () => {
  if (!shouldShow.value) return
  
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  
  isVisible.value = true
  positionReady.value = false
  // Wait for DOM update and then calculate position
  await nextTick()
  await nextTick() // Double nextTick to ensure Teleport is fully rendered
  await calculatePosition()
}

const hideTooltip = () => {
  timeoutId = window.setTimeout(() => {
    isVisible.value = false
    positionReady.value = false
    timeoutId = null
  }, 100)
}

const handleScroll = () => {
  if (isVisible.value) {
    calculatePosition()
  }
}

const handleResize = () => {
  if (isVisible.value) {
    calculatePosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

// Get slots for checking if tooltip slot exists
const slots = defineSlots<{
  default(): unknown
  tooltip?(): unknown
}>()
</script>

<template>
  <span class="t-tooltip-root">
    <div
      ref="triggerRef"
      class="t-tooltip"
      :class="{ 't-tooltip--disabled': disabled }"
      v-bind="attrs"
      @mouseenter="props.trigger === 'hover' ? showTooltip() : undefined"
      @mouseleave="props.trigger === 'hover' ? hideTooltip() : undefined"
      @focusin="props.trigger === 'focus' ? showTooltip() : undefined"
      @focusout="props.trigger === 'focus' ? hideTooltip() : undefined"
      @click="props.trigger === 'click' ? (isVisible ? hideTooltip() : showTooltip()) : undefined"
    >
      <slot />
    </div>

    <Teleport
      v-if="shouldShow && isVisible"
      to="body"
    >
      <div
        ref="tooltipRef"
        class="t-tooltip__popup"
        :class="`t-tooltip__popup--${placement}`"
        :data-variant="variant"
        :style="{
          position: 'absolute',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          zIndex: 9999,
          opacity: positionReady ? undefined : 0,
          pointerEvents: 'none'
        }"
        role="tooltip"
      >
        <div class="t-tooltip__content">
          <slot name="tooltip">{{ content }}</slot>
        </div>
        <div class="t-tooltip__arrow" />
      </div>
    </Teleport>
  </span>
</template>

<style scoped>

.t-tooltip-root { display: inline-block; }

.t-tooltip {
  position: relative;
  display: inline-block;
}

.t-tooltip__popup {
  padding: var(--t-space-2) var(--t-space-3);
  border-radius: var(--t-radius-default);
  font-size: var(--t-font-size-small);
  font-family: var(--t-font-ui);
  line-height: var(--t-line-height);
  max-width: 300px;
  width: max-content;
  word-wrap: break-word;
  pointer-events: none;
  box-shadow: var(--t-shadow-2);
}

.t-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

/* Arrow positioning for each placement */
.t-tooltip__popup--top .t-tooltip__arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--tooltip-bg);
}

.t-tooltip__popup--bottom .t-tooltip__arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--tooltip-bg);
}

.t-tooltip__popup--left .t-tooltip__arrow {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--tooltip-bg);
}

.t-tooltip__popup--right .t-tooltip__arrow {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--tooltip-bg);
}

/* Variants */
.t-tooltip__popup[data-variant="neutral"] {
  --tooltip-bg: var(--t-color-surface-2);
  --tooltip-color: var(--t-color-text);
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}

.t-tooltip__popup[data-variant="info"] {
  --tooltip-bg: var(--t-color-info);
  --tooltip-color: var(--t-color-info-contrast);
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}

.t-tooltip__popup[data-variant="success"] {
  --tooltip-bg: var(--t-color-success);
  --tooltip-color: var(--t-color-success-contrast);
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}

.t-tooltip__popup[data-variant="warning"] {
  --tooltip-bg: var(--t-color-warning);
  --tooltip-color: var(--t-color-warning-contrast);
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}

.t-tooltip__popup[data-variant="danger"] {
  --tooltip-bg: var(--t-color-danger);
  --tooltip-color: var(--t-color-danger-contrast);
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}
</style>