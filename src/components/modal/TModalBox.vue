<template>
  <!-- Backdrop для блокуючих модалок -->
  <div 
    v-if="showBackdrop"
    class="modal-backdrop"
    @click="handleBackdropClick"
  ></div>
  
  <div 
    ref="modalRef"
    class="modal-box"
    :class="{ 
      'is-dragging': isDragging,
      'is-resizable': mergedConfig.resizable,
      'is-active': isActive,
      'is-minimized': isMinimized,
      'is-blocking': showBackdrop,
      'is-draggable': mergedConfig.draggable && !isMinimized
    }"
    :style="combinedStyle"
    :modal-box-id="mergedConfig.id"
    @mousedown.capture="handleActivate"
    @touchstart.capture="handleActivate"
  >
    <header 
      ref="headerRef" 
      class="modal-box-header"
    >
      <div class="header-title">
        <Icon v-if="icon" :icon="icon" class="header-icon" />
        <slot name="title">{{ label || 'Modal' }}</slot>
      </div>
      
      <div class="header-actions">
        <TButton
          v-if="mergedConfig.minimizable !== false && !isMinimized"
          variant="neutral"
          mode="text"
          size="mini"
          icon="system-uicons:scale-contract"
          @click="handleToggleMinimize"
          class="header-btn minimize-btn"
          ignore-drag="true"
        />
        
        <TButton
          v-if="mergedConfig.minimizable !== false && isMinimized"
          variant="neutral"
          mode="text"
          size="mini"
          icon="system-uicons:scale-extend"
          @click="handleToggleMinimize"
          class="header-btn maximize-btn"
          ignore-drag="true"
        />
        
        <TButton
          v-if="mergedConfig.closable !== false"
          variant="danger"
          mode="text"
          size="mini"
          icon="material-symbols:close"
          @click="handleClose"
          class="header-btn close-btn"
          ignore-drag="true"
        />
      </div>
    </header>
    <div class="modal-box-content">
      <component 
        v-if="contentComponent" 
        :is="contentComponent"
        v-bind="componentProps"
      />
      <slot v-else>
        <!-- Default content slot -->
      </slot>
    </div>
    <div class="modal-box-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, type PropType, type Component } from 'vue'
import { DEFAULT_MODAL_BOX_CONFIG, type ModalBoxConfig } from './types'
import { calculateModalPosition } from './position-utils'
import { useDragger } from './useDragger'
import { useResizer } from './useResizer'
import TButton from '../TButton.vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  config: {
    type: Object as () => ModalBoxConfig,
    default: () => (DEFAULT_MODAL_BOX_CONFIG)
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isMinimized: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  contentComponent: {
    type: [Object, Function] as PropType<Component>,
    default: null
  },
  componentProps: {
    type: Object,
    default: () => ({})
  }
})


const mergedConfig = computed<ModalBoxConfig>(() => ({
  ...DEFAULT_MODAL_BOX_CONFIG,
  ...props.config
}))

const emit = defineEmits<{
  activate: [id: string]
  'toggle-minimize': [id: string]
  close: [id: string]
}>()

// Computed для показу backdrop
const showBackdrop = computed(() => {
  return mergedConfig.value.blocking && props.isActive && !props.isMinimized
})

// Обробка кліку по backdrop
const handleBackdropClick = () => {
  if (mergedConfig.value.blocking && mergedConfig.value.blockingDismissible) {
    handleClose()
  }
}

const modalRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()

// Активація модалки
const handleActivate = () => {
  if (mergedConfig.value.id && !props.isActive) {
    emit('activate', mergedConfig.value.id)
  }
}

// Мінімізація модалки
const handleToggleMinimize = () => {
  if (mergedConfig.value.id) {
    emit('toggle-minimize', mergedConfig.value.id)
  }
}

// Закриття модалки
const handleClose = () => {
  if (mergedConfig.value.id) {
    emit('close', mergedConfig.value.id)
  }
}

// Draggable функціональність (вимкнена для мінімізованих)
const { dragStyle, setPosition, isDragging } = useDragger(
  headerRef,
  modalRef,
  { 
    enabled: mergedConfig.value.draggable && !props.isMinimized,
    onDragStart: handleActivate
  }
)

// Resizable функціональність (вимкнена для мінімізованих)
const { resizeStyle, setSize, setMinSize, setMaxSize } = useResizer(
  modalRef,
  { enabled: mergedConfig.value.resizable && !props.isMinimized }
)

// Встановлюємо початкову позицію та розмір після монтування
onMounted(() => {
  if (modalRef.value) {
    const { size, minSize, maxSize } = mergedConfig.value
    const { width = 400, height = 300 } = size || {}

    // Встановлюємо розміри
    setSize({ width, height })
    if (minSize) setMinSize(minSize)
    if (maxSize) setMaxSize(maxSize)

    calculateAndSetPosition();
      // Повторне встановлення позиції після невеликої затримки для коректного рендерингу
    // setTimeout(calculateAndSetPosition, 20)
  }
})

function calculateAndSetPosition() {
  if (modalRef.value) {
    const { position, size } = mergedConfig.value
    const { width = 400, height = 300 } = size || {}

    const containerWidth = modalRef.value.offsetWidth || (typeof width === 'number' ? width : 400)
    const containerHeight = modalRef.value.offsetHeight || (typeof height === 'number' ? height : 300)

    const calculatedPosition = calculateModalPosition(
      position,
      containerWidth,
      containerHeight,
      window.innerWidth,
      window.innerHeight
    )

    setPosition(calculatedPosition)
  }
}

// Комбіновані стилі для позиціонування та розміру
const combinedStyle = computed(() => {
  const styles: Record<string, any> = {
    // Мінімізовані модалки не мають absolute positioning
    ...(!props.isMinimized && dragStyle.value),
    ...(!props.isMinimized && resizeStyle.value)
  }
  return styles
})
</script>

<style scoped>
/* Backdrop для блокуючих модалок */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 3990;
  pointer-events: auto;
}

.modal-box {
    z-index: 3000;
    pointer-events: auto;
    background-color: var(--t-color-surface);
    border: 1px solid var(--t-color-border);
    box-shadow: var(--t-shadow-3);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-radius: var(--t-radius-default) var(--t-radius-default) 0 0;
    top: 0;
    left: 0;
    position: fixed;
    bottom: 0;
    right: 0;
}

/* Активна модалка має вищий z-index */
.modal-box.is-active {
  z-index: 4000;
}

/* Блокуюча модалка має найвищий z-index */
.modal-box.is-blocking {
  z-index: 4010;
}

/* Мінімізована модалка */
.modal-box.is-minimized {
    width: 250px !important;
    height: calc(var(--t-control-h-medium) + var(--t-space-1)) !important;
    min-width: 50px;
    min-height: calc(var(--t-control-h-medium) + var(--t-space-1)) !important;
    resize: none;
    transform: none !important;
    position: unset;
    margin-top: var(--t-space-2);
    background: color-mix(in srgb, var(--t-color-surface) 84%, transparent);
    backdrop-filter: blur(5px);
    border-radius: var(--t-radius-default);
    border: 1px solid color-mix(in srgb, var(--t-color-surface) 20%, transparent);
    resize: none !important;
    overflow: auto;
}

.modal-box.is-minimized .modal-box-content {
  display: none; /* Ховаємо контент у мінімізованому стані */
}

.modal-box.is-minimized .modal-box-header {
  cursor: pointer; /* Клікабельний заголовок для максимізації */
  padding: var(--t-space-2);
  user-select: none;
  border: none;
}

.modal-box.is-minimized .modal-box-overlay {
  display: none; /* Ховаємо overlay у мінімізованому стані */
}

.modal-box-header {
  padding: var(--t-space-2) var(--t-space-3);
  /* background-color: var(--t-color-surface-2); */
  /* border-bottom: 1px solid var(--t-color-border); */
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: var(--t-control-h-medium);
}

/* Cursor grab тільки для draggable модалок */
.modal-box.is-draggable .modal-box-header {
  cursor: grab;
}

.header-title {
  flex: 1;
  font-size: var(--t-font-size-default);
  font-weight: 500;
  color: var(--t-color-text);
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}

.header-icon {
  flex-shrink: 0;
    --size: 24px;
    width: var(--size);
    height: var(--size);
}

.header-actions {
  display: flex;
  gap: var(--t-space-1);
  align-items: center;
}

.header-btn {
  --t-btn-height: var(--t-control-h-small);
  --t-btn-radius: var(--t-radius-mini);
  --t-btn-font-size: var(--t-font-size-mini);
  padding: 0 var(--t-space-1) !important;
}

.modal-box.is-dragging .modal-box-header {
  cursor: grabbing;
}

.modal-box.is-dragging {
  user-select: none;
}

.modal-box.is-resizable {
  resize: both;
  overflow: auto;
}

/* Modal box content */
.modal-box-content {
  flex: 1;
  overflow: auto;
}

/* Modal box overlay - hidden by default */
.modal-box-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: move;
  z-index: 1;
  pointer-events: auto;
  background: transparent;
}
</style>