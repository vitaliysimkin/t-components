<template>
  <div>
    <TButton @click="openModal">Open Modal</TButton>
    <div style="margin-top: 10px;">
      <label>Demo Value: </label>
      <input v-model="demoValue" type="text" placeholder="Demo value..." />
      {{ pressedButton }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TButton } from 't-components'
import { modalManager } from 't-components'
import SimpleInputModal from './SimpleInputModal.vue'

const demoValue = ref('Initial value')

const pressedButton = ref('')

const openModal = () => {
  modalManager.openModal({
    label: 'Input Modal',
    icon: 'system-uicons:book-text',
    contentComponent: SimpleInputModal,
    componentProps: {
      demoValue: demoValue,
      'onUpdate:demoValue': (value: string) => {
        demoValue.value = value
      },
      onButtonPressed: (button: string) => {
        pressedButton.value = button
      }
    }
  })
}
</script>