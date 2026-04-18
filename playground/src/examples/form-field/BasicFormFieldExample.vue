<script setup lang="ts">
import { ref } from 'vue'
import { TFormField, TInput } from '@vitaliysimkin/t-components'

const email = ref('')
const fullName = ref('')
</script>

<template>
  <div class="form-grid">
    <TFormField label="Full name">
      <template #default="{ id }">
        <TInput :id="id" v-model="fullName" placeholder="Jane Doe" />
      </template>
    </TFormField>

    <TFormField label="Email">
      <template #default="{ id }">
        <TInput :id="id" v-model="email" type="email" placeholder="you@example.com" />
      </template>
    </TFormField>
  </div>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
}
</style>
