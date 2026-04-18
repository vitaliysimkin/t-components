<script setup lang="ts">
import { computed, ref } from 'vue'
import { TFormField, TInput, TSelect, TSwitch, TTextarea } from '@vitaliysimkin/t-components'

const name = ref('')
const country = ref<string | number | undefined>(undefined)
const bio = ref('')
const subscribe = ref(false)

const countries = [
  { label: 'Ukraine', value: 'ua' },
  { label: 'Poland', value: 'pl' },
  { label: 'Germany', value: 'de' },
]

const submitted = ref(false)
const nameError = computed(() => (submitted.value && !name.value ? 'Name is required' : undefined))
const countryError = computed(() => (submitted.value && !country.value ? 'Please select a country' : undefined))

const onSubmit = () => {
  submitted.value = true
}
</script>

<template>
  <form class="form-grid" @submit.prevent="onSubmit">
    <TFormField label="Name" required :error="nameError">
      <template #default="{ id }">
        <TInput :id="id" v-model="name" placeholder="Your name" />
      </template>
    </TFormField>

    <TFormField label="Country" required :error="countryError" hint="Used for regional pricing.">
      <template #default="{ id }">
        <TSelect :id="id" v-model="country" :options="countries" placeholder="Select country" />
      </template>
    </TFormField>

    <TFormField label="Bio" hint="A few words about yourself.">
      <template #default>
        <TTextarea v-model="bio" :rows="4" placeholder="Tell us more..." />
      </template>
    </TFormField>

    <TFormField label="Subscribe to newsletter">
      <template #default>
        <TSwitch v-model="subscribe" />
      </template>
    </TFormField>

    <button type="submit" class="submit-btn">Submit</button>
  </form>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 420px;
}

.submit-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--t-color-border, #ddd);
  background: var(--t-color-accent, #4f46e5);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}
</style>
