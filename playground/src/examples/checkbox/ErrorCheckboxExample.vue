<script setup lang="ts">
import { ref, computed } from 'vue'
import { TCheckbox, TFormField } from '@vitaliysimkin/t-components'

const agreed = ref(false)
const errorMsg = computed(() => agreed.value ? false : 'You must accept the terms to continue')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- Standalone error via prop -->
    <TCheckbox
      v-model="agreed"
      :error="errorMsg"
      label="I accept the terms and conditions"
    />

    <!-- Error propagated from TFormField context -->
    <TFormField
      label="Agreement (via TFormField)"
      :error="errorMsg"
    >
      <TCheckbox v-model="agreed" label="I accept the terms and conditions" />
    </TFormField>
  </div>
</template>
