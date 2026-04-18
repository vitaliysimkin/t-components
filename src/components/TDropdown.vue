<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEventListener, onClickOutside } from '@vueuse/core'

/**
 * TDropdown - Headless dropdown primitive component
 * 
 * A minimal, functional dropdown component that provides the foundation
 * for Select, Autocomplete, DropdownButton, and other dropdown-based UI elements.
 * 
 * Features:
 * - Teleports panel content to body for z-index control
 * - Multiple trigger modes: click, hover, or both
 * - Simple placement system (4 positions)
 * - Auto-close on escape, outside click, and panel click
 * - Optional width matching to trigger element
 */

export type TDropdownTrigger = 'click' | 'hover' | 'both'
export type TDropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface TDropdownProps {
  /** How the dropdown opens/closes from trigger interactions */
  trigger?: TDropdownTrigger
  /** When true, dropdown never opens and ignores interactions */
  disabled?: boolean
  /** When true, any click inside the panel closes it */
  closeOnPanelClick?: boolean
  /** Simple placement relative to trigger */
  placement?: TDropdownPlacement
  /** Gap between trigger and panel in pixels */
  offset?: number
  /** If true, set panel width to match trigger width */
  matchTriggerWidth?: boolean
  /** Additional custom styles to apply to the panel */
  customPanelStyle?: Record<string, unknown> | string
}

const props = withDefaults(defineProps<TDropdownProps>(), {
  trigger: 'click',
  disabled: false,
  closeOnPanelClick: true,
  placement: 'bottom-start',
  offset: 4,
  matchTriggerWidth: false,
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'close': []
}>()

// Refs
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

// State
const isOpen = ref(false)
const panelPosition = ref({ top: 0, left: 0 })
const panelWidth = ref<number | undefined>(undefined)

// Auto-emit when isOpen changes
watch(isOpen, (value) => {
  emit('update:isOpen', value)
})

// Hover delay timeouts
const hoverOpenTimeout = ref<number | null>(null)
const hoverCloseTimeout = ref<number | null>(null)

// Constants
const HOVER_OPEN_DELAY = 0
const HOVER_CLOSE_DELAY = 200

// Positioning
const updatePosition = () => {
  if (!triggerRef.value || !panelRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const panelRect = panelRef.value.getBoundingClientRect()
  
  // Apply matchTriggerWidth
  if (props.matchTriggerWidth) {
    panelWidth.value = triggerRect.width
  } else {
    panelWidth.value = undefined
  }
  
  let top = 0
  let left = 0

  switch (props.placement) {
    case 'bottom-start':
      top = triggerRect.bottom + props.offset
      left = triggerRect.left
      break
    case 'bottom-end':
      top = triggerRect.bottom + props.offset
      left = triggerRect.right - panelRect.width
      break
    case 'top-start':
      top = triggerRect.top - panelRect.height - props.offset
      left = triggerRect.left
      break
    case 'top-end':
      top = triggerRect.top - panelRect.height - props.offset
      left = triggerRect.right - panelRect.width
      break
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const pw = panelRect.width
  const ph = panelRect.height
  const margin = 8

  // Horizontal clamping
  if (left + pw > vw - margin) left = vw - pw - margin
  if (left < margin) left = margin

  // Vertical flip
  if (top + ph > vh - margin && props.placement.startsWith('bottom')) {
    const flipped = triggerRect.top - ph - props.offset
    if (flipped >= margin) top = flipped
  } else if (top < margin && props.placement.startsWith('top')) {
    const flipped = triggerRect.bottom + props.offset
    if (flipped + ph <= vh - margin) top = flipped
  }

  // Final vertical clamp
  if (top + ph > vh - margin) top = vh - ph - margin
  if (top < margin) top = margin

  panelPosition.value = { top, left }
}

// Core methods
const open = () => {
  if (props.disabled) return
  isOpen.value = true
  // Calculate position after opening
  requestAnimationFrame(() => {
    updatePosition()
  })
}

const close = () => {
  isOpen.value = false
  emit('close')
  // Clear any pending hover timeouts
  if (hoverOpenTimeout.value) {
    clearTimeout(hoverOpenTimeout.value)
    hoverOpenTimeout.value = null
  }
  if (hoverCloseTimeout.value) {
    clearTimeout(hoverCloseTimeout.value)
    hoverCloseTimeout.value = null
  }
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    requestAnimationFrame(() => {
      updatePosition()
    })
  }
}

// Hover handlers
const handleMouseEnter = () => {
  if (props.disabled) return
  
  // Clear any pending close timeout
  if (hoverCloseTimeout.value) {
    clearTimeout(hoverCloseTimeout.value)
    hoverCloseTimeout.value = null
  }
  
  hoverOpenTimeout.value = setTimeout(() => {
    open()
  }, HOVER_OPEN_DELAY)
}

const handleMouseLeave = () => {
  // Clear any pending open timeout
  if (hoverOpenTimeout.value) {
    clearTimeout(hoverOpenTimeout.value)
    hoverOpenTimeout.value = null
  }
  
  hoverCloseTimeout.value = setTimeout(() => {
    close()
  }, HOVER_CLOSE_DELAY)
}

// Trigger props for slot
const triggerProps = computed(() => {
  const handlers: Record<string, (event: Event) => void> = {}
  
  // Add click handler if trigger mode includes 'click' or 'both'
  if (props.trigger === 'click' || props.trigger === 'both') {
    handlers.onClick = toggle
  }
  
  // Add hover handlers if trigger mode includes 'hover' or 'both'
  if (props.trigger === 'hover' || props.trigger === 'both') {
    handlers.onMouseenter = handleMouseEnter
    handlers.onMouseleave = handleMouseLeave
  }
  
  return handlers
})

// Panel props for slot
const panelProps = computed(() => {
  const handlers: Record<string, (event: Event) => void> = {}
  
  // Add click handler if closeOnPanelClick is true
  if (props.closeOnPanelClick) {
    handlers.onClick = close
  }
  
  // Add hover handlers if trigger mode includes 'hover' or 'both'
  // This prevents the panel from closing when mouse moves from trigger to panel
  if (props.trigger === 'hover' || props.trigger === 'both') {
    handlers.onMouseenter = handleMouseEnter
    handlers.onMouseleave = handleMouseLeave
  }
  
  return handlers
})

// Panel style for positioning
const panelStyle = computed(() => {
  const style: Record<string, unknown> = {
    position: 'fixed',
    top: `${panelPosition.value.top}px`,
    left: `${panelPosition.value.left}px`,
    zIndex: 1000,
    maxHeight: `calc(100vh - 16px)`,
    overflow: 'auto',
  }
  
  if (panelWidth.value !== undefined) {
    style.minWidth = `${panelWidth.value}px`
  }
  
  // Merge custom styles
  if (props.customPanelStyle) {
    if (typeof props.customPanelStyle === 'string') {
      return [style, props.customPanelStyle]
    } else {
      Object.assign(style, props.customPanelStyle)
    }
  }
  
  return style
})

// Escape key handler
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
})

// Click outside handler
onClickOutside(
  triggerRef,
  () => {
    if (isOpen.value) {
      close()
    }
  },
  {
    ignore: [panelRef],
  }
)

// Reposition on window resize
useEventListener('resize', () => {
  if (isOpen.value) {
    updatePosition()
  }
})

// Reposition on scroll (capture phase to catch all scroll containers)
useEventListener('scroll', () => {
  if (isOpen.value) {
    updatePosition()
  }
}, { capture: true })

// Expose methods for parent components
defineExpose({
  open,
  close,
  toggle,
  isOpen: computed(() => isOpen.value)
})
</script>

<template>
  <div
    ref="triggerRef"
    class="t-dropdown"
    :data-is-open="isOpen"
    v-bind="$attrs"
  >
    <slot
      name="trigger"
      :is-open="isOpen"
      :trigger-props="triggerProps"
    />
  </div>

  <!-- Panel teleported to body -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="panelRef"
      class="t-dropdown-panel"
      v-bind="panelProps"
      :style="panelStyle"
      data-is-open="true"
    >
      <slot
        :is-open="isOpen"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.t-dropdown {
  display: inline-block;
}

.t-dropdown-panel {
  /* Panel styling will be handled via inline styles and slot content */
}
</style>
