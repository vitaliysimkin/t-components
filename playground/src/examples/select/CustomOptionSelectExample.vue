<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { TSelect } from '@vitaliysimkin/t-components'

interface Environment {
  value: string
  label: string
  icon: string
  description: string
  status: 'online' | 'offline' | 'degraded'
}

const selectedEnv = ref<Environment | null>(null)

const environments: Environment[] = [
  {
    value: 'prod',
    label: 'Production',
    icon: 'system-uicons:cloud',
    description: 'Live environment',
    status: 'online',
  },
  {
    value: 'staging',
    label: 'Staging',
    icon: 'system-uicons:layers',
    description: 'Pre-release testing',
    status: 'degraded',
  },
  {
    value: 'dev',
    label: 'Development',
    icon: 'system-uicons:terminal',
    description: 'Local dev environment',
    status: 'offline',
  },
]

const statusColor: Record<Environment['status'], string> = {
  online: 'var(--t-color-success, #22c55e)',
  degraded: 'var(--t-color-warning, #f59e0b)',
  offline: 'var(--t-color-danger, #ef4444)',
}
</script>

<template>
  <div class="demo">
    <TSelect
      v-model="selectedEnv"
      :options="environments"
      label-key="label"
      value-key="value"
      value-mode="option"
      placeholder="Choose an environment"
      clearable
    >
      <!-- option scoped slot: receives { option, selected, active } -->
      <template #option="{ option, selected }">
        <span class="env-option">
          <Icon :icon="option.icon" class="env-icon" />
          <span class="env-text">
            <span class="env-label" :class="{ 'env-label--selected': selected }">
              {{ option.label }}
            </span>
            <span class="env-desc">{{ option.description }}</span>
          </span>
          <span
            class="env-dot"
            :style="{ background: statusColor[option.status] }"
            :title="option.status"
          />
        </span>
      </template>
    </TSelect>

    <p v-if="selectedEnv" class="result">
      Selected: <strong>{{ selectedEnv.label }}</strong>
      &mdash; status: <em>{{ selectedEnv.status }}</em>
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 320px;
}

.result {
  margin: 0;
  font-size: 0.875rem;
  color: var(--t-color-text-secondary);
}

/* Styles for the custom option layout rendered inside the slot */
.env-option {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  width: 100%;
}

.env-icon {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: var(--t-color-text-secondary);
}

.env-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.env-label {
  font-size: 0.875rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.env-label--selected {
  font-weight: 600;
}

.env-desc {
  font-size: 0.75rem;
  color: var(--t-color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.env-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
