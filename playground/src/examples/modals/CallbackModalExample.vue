<template>
  <div>
    <TButton @click="openCallbackModal">Open Callback Modal</TButton>
    
    <div v-if="lastRequestTime">
      <strong>Last data request at:</strong> {{ lastRequestTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TButton } from 't-components'
import { modalManager } from 't-components'
import CallbackModalContent from './CallbackModalContent.vue'

const lastRequestTime = ref('')

const openCallbackModal = () => {
  modalManager.openModal({
    label: 'Callback Modal',
    icon: 'system-uicons:arrow-up-down',
    contentComponent: CallbackModalContent,
    componentProps: {
      onDataRequest: async () => {
        // Імітація асинхронного запиту
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Записуємо час запиту
        lastRequestTime.value = new Date().toLocaleTimeString()
        
        // Повертаємо прості дані
        return {
          message: 'Hello from parent!',
          timestamp: new Date().toLocaleTimeString(),
          randomNumber: Math.floor(Math.random() * 100)
        }
      }
    }
  })
}
</script>