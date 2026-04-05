<template>
    <TButton @click="openBlockingModal" variant="danger">Open Blocking Modal</TButton>
</template>

<script setup lang="ts">
import { TButton } from 't-components'
import { modalManager } from 't-components'
import SimpleContent from './SimpleContent.vue'

const openBlockingModal = () => {
  let modalId = modalManager.openModal({
    label: 'Блокуюча модалка',
    icon: 'system-uicons:lock',
    contentComponent: SimpleContent,
    componentProps: {
      title: 'Блокуюча модалка',
      message: 'Це блокуюча модалка з backdrop. Вона блокує весь інший контент.',
      onAction() {
        modalManager.closeModal(modalId)
      }
    },
    position: 'center',
    blocking: true,
    minimizable: false,
    resizable: false,
    draggable: false,
    closable: false
  })
}
</script>