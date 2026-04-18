<template>
  <Teleport to="body">
    <div 
      class="modal-box-host"
      :class="{ 'overlay-visible': overlayVisible }"
    >
      
      <!-- Модальні вікна -->
      <TModalBox
        v-for="modal in modalManager.modals.value"
        :key="modal.id"
        :config="modal.config"
        :is-active="modalManager.isModalActive(modal.id)"
        :is-minimized="modalManager.isModalMinimized(modal.id)"
        :label="modal.label"
        :icon="modal.icon"
        :content-component="modal.contentComponent"
        :component-props="modal.componentProps"
        @activate="modalManager.setActiveModal"
        @toggle-minimize="modalManager.toggleMinimize"
        @close="modalManager.closeModal"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import TModalBox from './TModalBox.vue'
import { overlayVisible as draggerOverlayVisible } from './useDragger'
import { modalManager } from './useModalManager'

// Computed properties
const overlayVisible = computed(() => draggerOverlayVisible.value)

// Єдиний глобальний ESC-слухач для всіх модалок.
// Закриває лише top-most active модалку, якщо вона blocking + dismissible
// і не мінімізована. Це замінює N окремих слухачів у кожному TModalBox.
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return

  const activeId = modalManager.activeModalId.value
  if (!activeId) return

  if (modalManager.isModalMinimized(activeId)) return

  const activeModal = modalManager.modals.value.find(m => m.id === activeId)
  if (!activeModal) return

  const { blocking, blockingDismissible } = activeModal.config
  if (blocking && blockingDismissible) {
    modalManager.closeModal(activeId)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})

// Експортуємо modalManager для зовнішнього доступу
defineExpose({
  modalManager
})

</script>

<style scoped>
.modal-box-host {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2000;
    padding: 10px;
    display: flex;
    flex-direction: column-reverse;
    max-height: 100vh;
    overflow: auto;
}

/* Overlay styles activated during drag operations */
.modal-box-host.overlay-visible :deep(.modal-box-overlay) {
  display: block;
}

</style>