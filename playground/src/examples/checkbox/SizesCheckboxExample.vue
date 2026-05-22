<script setup lang="ts">
import { ref } from 'vue'
import { TCheckbox } from '@vitaliysimkin/t-components'

const checked = ref(true)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <TCheckbox
      v-model="checked"
      size="mini"
      label="mini"
    />
    <TCheckbox
      v-model="checked"
      size="small"
      label="small"
    />
    <TCheckbox
      v-model="checked"
      size="default"
      label="default"
    />
    <TCheckbox
      v-model="checked"
      size="medium"
      label="medium"
    />
    <TCheckbox
      v-model="checked"
      size="large"
      label="large"
    />
  </div>
</template>
