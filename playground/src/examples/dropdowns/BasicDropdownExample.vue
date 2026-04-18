<script setup lang="ts">
import { TButton } from '@vitaliysimkin/t-components';
import { TDropdown } from '@vitaliysimkin/t-components'
// import { TButton } from '@vitaliysimkin/t-components'
</script>

<template>
  <TDropdown
    trigger="both"
    :offset="8"
  >
    <template #trigger="{ triggerProps }">
      <TButton
        v-bind="triggerProps"
        label="Open Dropdown"
      />
    </template>
      
    <template #default>
      <div 
        style="background: white; border: 1px solid #ccc; border-radius: 4px; padding: 8px;"
      >
        <div style="padding: 8px;">
          Action 1
        </div>
        <div style="padding: 8px;">
          Action 2
        </div>
        <div style="padding: 8px;">
          Action 3
        </div>
      </div>
    </template>
  </TDropdown>
</template>

<style scoped>
</style>
