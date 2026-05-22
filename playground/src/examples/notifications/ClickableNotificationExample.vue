<script setup lang="ts">
import { ref } from 'vue'
import { TButton, useNotifications } from '@vitaliysimkin/t-components'

const { push, info, error } = useNotifications()
const clickLog = ref<string[]>([])

function showClickable() {
  push('info', 'New deployment available — click to review', {
    timeoutMs: 0,
    onClick: () => {
      clickLog.value.unshift('Notification clicked at ' + new Date().toLocaleTimeString())
    },
  })
}

function showClickableError() {
  error('Connection lost — click to retry', {
    timeoutMs: 0,
    onClick: () => {
      clickLog.value.unshift('Retry triggered at ' + new Date().toLocaleTimeString())
    },
  })
}

function showPlain() {
  info('This notification has no click handler (auto-dismisses)')
}
</script>

<template>
  <div class="demo">
    <div class="buttons">
      <TButton
        label="Clickable info (persistent)"
        @click="showClickable"
      />
      <TButton
        label="Clickable error (persistent)"
        variant="danger"
        @click="showClickableError"
      />
      <TButton
        label="Plain (no onClick)"
        mode="plain"
        @click="showPlain"
      />
    </div>

    <div
      v-if="clickLog.length"
      class="log"
    >
      <p class="log__title">
        Click events:
      </p>
      <ul>
        <li
          v-for="(entry, i) in clickLog"
          :key="i"
        >
          {{ entry }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.log {
  font-size: 0.85rem;
  color: var(--t-color-text-secondary, #888);
}

.log__title {
  margin: 0 0 0.25rem;
  font-weight: 600;
}

.log ul {
  margin: 0;
  padding-left: 1.2rem;
}
</style>
