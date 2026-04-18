<template>
  <TButtonGroup :options="basicOptions" />
  
  <TButtonGroup>
    <TButton
      variant="neutral"
      label="Edit"
      icon="system-uicons:create"
    />
    <TButton
      variant="danger"
      label="Delete"
      icon="system-uicons:trash"
    />
    <TButton
      variant="info"
      label="Info"
      icon="system-uicons:book-text"
    />
    <TButton
      variant="success"
      label="Save"
      icon="system-uicons:check"
    />
  </TButtonGroup>
</template>

<script setup lang="ts">
import { TButtonGroup } from '@vitaliysimkin/t-components'
import { TButton } from '@vitaliysimkin/t-components'
import type { TButtonGroupOption } from '@vitaliysimkin/t-components'

const basicOptions: TButtonGroupOption[] = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2' },
  { value: 3, label: 'Option 3' }
]

</script>
