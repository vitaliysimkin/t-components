<script setup lang="ts">
import { computed, ref } from 'vue'
import { TInput, TTextarea, TSelect, TSwitch } from '@vitaliysimkin/t-components'

const email = ref('invalid-email')
const description = ref('')
const fruit = ref<string | null>(null)
const accept = ref(false)

const emailError = computed(() =>
  email.value && !email.value.includes('@') ? 'Please enter a valid email address' : ''
)

const descriptionError = computed(() =>
  description.value.length > 0 && description.value.length < 10
    ? 'Description must be at least 10 characters'
    : ''
)

const fruitError = computed(() => (!fruit.value ? 'Please pick a fruit' : ''))

const acceptError = computed(() => !accept.value)
</script>

<template>
  <div class="error-examples">
    <label>
      Email (string error → message under the field)
      <TInput
        v-model="email"
        placeholder="name@example.com"
        :error="emailError"
      />
    </label>

    <label>
      Description (≥10 chars)
      <TTextarea
        v-model="description"
        :error="descriptionError"
        placeholder="Tell us more..."
      />
    </label>

    <label>
      Fruit (TSelect error)
      <TSelect
        v-model="fruit"
        value-mode="value"
        :options="['Apple', 'Banana', 'Cherry']"
        :error="fruitError"
        placeholder="Pick one"
      />
    </label>

    <TSwitch
      v-model="accept"
      :error="acceptError"
      label="Accept terms (boolean error = visual only)"
    />
  </div>
</template>

<style scoped>
.error-examples {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}
</style>
