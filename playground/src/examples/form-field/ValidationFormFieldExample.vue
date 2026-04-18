<script setup lang="ts">
import { computed, ref } from 'vue'
import { TFormField, TInput } from '@vitaliysimkin/t-components'

const email = ref('')
const touched = ref(false)

const emailError = computed(() => {
  if (!touched.value) return undefined
  if (!email.value) return 'Email is required'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) return 'Invalid email format'
  return undefined
})
</script>

<template>
  <div class="form-grid">
    <TFormField
      label="Email"
      required
      hint="We'll only use this to send order confirmation."
      :error="emailError"
    >
      <template #default="{ id, ariaDescribedby, ariaInvalid, ariaRequired }">
        <TInput
          :id="id"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          :aria-describedby="ariaDescribedby"
          :aria-invalid="ariaInvalid || undefined"
          :aria-required="ariaRequired || undefined"
          @blur="touched = true"
        />
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
