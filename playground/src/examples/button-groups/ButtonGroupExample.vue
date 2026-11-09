<template>
  <div
    v-for="mode in modes"
    :key="mode"
  >
    <div class="example-label">
      Button set, mode="{{ mode }}"
    </div>
    <div class="example-row">
      <TButtonGroup :mode="mode">
        <TButton
          variant="accent"
          label="Save"
          icon="system-uicons:check"
        />
        <TButton label="Cancel" />
        <TButton
          icon="system-uicons:menu-vertical"
          title="More"
          aria-label="More"
        />
      </TButtonGroup>

      <TButtonGroup :mode="mode">
        <TButton
          icon="system-uicons:create"
          title="Edit"
          aria-label="Edit"
        />
        <TButton
          icon="system-uicons:duplicate"
          title="Duplicate"
          aria-label="Duplicate"
        />
        <TButton
          variant="danger"
          icon="system-uicons:trash"
          title="Delete"
          aria-label="Delete"
          disabled
        />
      </TButtonGroup>

      <TButtonGroup :mode="mode">
        <TButton
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { TButtonGroup, TButton } from '@vitaliysimkin/t-components'
import type { TButtonGroupMode } from '@vitaliysimkin/t-components'

const modes: TButtonGroupMode[] = ['segmented', 'plain']
</script>

<style scoped>
.example-label {
  font-size: 0.875rem;
  color: var(--t-color-text-secondary);
  margin-bottom: var(--t-space-1);
}

.example-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--t-space-3);
}
</style>
