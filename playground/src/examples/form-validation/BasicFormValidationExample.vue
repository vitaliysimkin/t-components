<script setup lang="ts">
import { reactive } from 'vue'
import { TFormField, TInput } from '@vitaliysimkin/t-components'
// NOTE: once useFormValidation is exported from src/index.ts, change this to:
// import { useFormValidation, type FormValidationRules } from '@vitaliysimkin/t-components'
import { useFormValidation } from '../../../../src/composables/useFormValidation'
import type { FormValidationRules } from '../../../../src/composables/useFormValidation'

interface RegistrationForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const model = reactive<RegistrationForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules: FormValidationRules<RegistrationForm> = {
  username: [
    { required: true, message: "Username is required", trigger: 'blur' },
    { min: 3, max: 20, message: "Must be 3–20 characters", trigger: 'blur' },
    {
      pattern: /^[a-z0-9_]+$/,
      message: "Lowercase letters, digits and _ only",
      trigger: 'change',
    },
  ],
  email: [
    { required: true, message: "Email is required", trigger: 'blur' },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
      trigger: 'blur',
    },
    {
      asyncValidator: async (value) => {
        // Simulate an async uniqueness check
        await new Promise<void>(r => setTimeout(r, 300))
        return value !== 'taken@example.com' || 'This email is already registered'
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: "Password is required", trigger: 'blur' },
    { min: 8, message: "At least 8 characters required", trigger: 'change' },
  ],
  confirmPassword: [
    { required: true, message: "Please confirm your password", trigger: 'blur' },
    {
      validator: (_value, m) =>
        m.confirmPassword === m.password || "Passwords do not match",
      trigger: 'blur',
    },
  ],
}

const { errors, validate, clearErrors, handleBlur, handleChange } =
  useFormValidation(model, rules)

let submitResult = $ref<'idle' | 'success' | 'error'>('idle')

async function onSubmit() {
  submitResult = 'idle'
  const valid = await validate()
  submitResult = valid ? 'success' : 'error'
}
</script>

<template>
  <div class="fv-wrapper">
    <h3 class="fv-title">
      Registration Form
    </h3>

    <form
      class="fv-form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <!-- Username -->
      <TFormField
        label="Username"
        required
        :error="errors.username"
      >
        <template #default="{ id, ariaDescribedby, ariaInvalid, ariaRequired }">
          <TInput
            :id="id"
            v-model="model.username"
            placeholder="e.g. john_doe"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid || undefined"
            :aria-required="ariaRequired || undefined"
            @blur="handleBlur('username')"
            @update:model-value="handleChange('username')"
          />
        </template>
      </TFormField>

      <!-- Email -->
      <TFormField
        label="Email"
        required
        :error="errors.email"
        hint="Try typing taken@example.com to see async validation."
      >
        <template #default="{ id, ariaDescribedby, ariaInvalid, ariaRequired }">
          <TInput
            :id="id"
            v-model="model.email"
            type="email"
            placeholder="you@example.com"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid || undefined"
            :aria-required="ariaRequired || undefined"
            @blur="handleBlur('email')"
          />
        </template>
      </TFormField>

      <!-- Password -->
      <TFormField
        label="Password"
        required
        :error="errors.password"
      >
        <template #default="{ id, ariaDescribedby, ariaInvalid, ariaRequired }">
          <TInput
            :id="id"
            v-model="model.password"
            type="password"
            placeholder="At least 8 characters"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid || undefined"
            :aria-required="ariaRequired || undefined"
            @blur="handleBlur('password')"
            @update:model-value="handleChange('password')"
          />
        </template>
      </TFormField>

      <!-- Confirm Password -->
      <TFormField
        label="Confirm Password"
        required
        :error="errors.confirmPassword"
      >
        <template #default="{ id, ariaDescribedby, ariaInvalid, ariaRequired }">
          <TInput
            :id="id"
            v-model="model.confirmPassword"
            type="password"
            placeholder="Repeat your password"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid || undefined"
            :aria-required="ariaRequired || undefined"
            @blur="handleBlur('confirmPassword')"
          />
        </template>
      </TFormField>

      <!-- Actions -->
      <div class="fv-actions">
        <button
          type="submit"
          class="fv-btn fv-btn--primary"
        >
          Register
        </button>
        <button
          type="button"
          class="fv-btn"
          @click="clearErrors"
        >
          Clear errors
        </button>
      </div>

      <p
        v-if="submitResult === 'success'"
        class="fv-result fv-result--success"
      >
        Form is valid — ready to submit!
      </p>
      <p
        v-else-if="submitResult === 'error'"
        class="fv-result fv-result--error"
      >
        Please fix the errors above.
      </p>
    </form>
  </div>
</template>

<style scoped>
.fv-wrapper {
  max-width: 420px;
}

.fv-title {
  margin: 0 0 1.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--t-color-text);
}

.fv-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fv-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.fv-btn {
  padding: 0.45rem 1.1rem;
  border-radius: var(--t-radius-base, 6px);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--t-color-border, #d1d5db);
  background: var(--t-color-surface, #fff);
  color: var(--t-color-text, #111);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.fv-btn--primary {
  background: var(--t-color-accent, #6366f1);
  color: #fff;
  border-color: var(--t-color-accent, #6366f1);
}

.fv-btn--primary:hover {
  filter: brightness(1.1);
}

.fv-result {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.fv-result--success {
  color: var(--t-color-success, #22c55e);
}

.fv-result--error {
  color: var(--t-color-danger, #ef4444);
}
</style>
