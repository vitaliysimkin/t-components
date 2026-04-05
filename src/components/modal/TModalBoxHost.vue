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
import { computed } from 'vue'
import TModalBox from './TModalBox.vue'
import { overlayVisible as draggerOverlayVisible } from './useDragger'
import { modalManager } from './useModalManager'

// Computed properties
const overlayVisible = computed(() => draggerOverlayVisible.value)

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