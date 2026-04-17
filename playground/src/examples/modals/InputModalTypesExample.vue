<script setup lang="ts">
import { modalManager } from '@vitaliysimkin/t-components'
import { TButton } from '@vitaliysimkin/t-components'

const openAdvancedModal = () => {
  modalManager.openInputModal({
    label: 'User Registration',
    inputs: [
      { code: 'name', label: 'Name', type: 'text', placeholder: 'Enter name', attrs: { required: true, minlength: 2 } },
      { code: 'email', label: 'Email', type: 'email', placeholder: 'Enter email', attrs: { required: true } },
      { code: 'age', label: 'Age', type: 'number', placeholder: 'Enter age', attrs: { min: 18, max: 120 } },
      { code: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell us about yourself...', attrs: { rows: 3 } },
      { code: 'json', label: 'Profile Data', type: 'code', defaultValue: '{ "key": "value" }', attrs: { language: 'json', maxHeight: '200px' } },
      { code: 'subscribe', label: '', type: 'swtich', placeholder: 'Subscribe to newsletter', defaultValue: true }
    ],
    onSubmit: (values) => {
      alert('Registration submitted!\n' + JSON.stringify(values, null, 2))
    }
  })
}
</script>

<template>
    <TButton @click="openAdvancedModal">Open Advanced Modal</TButton>
</template>
