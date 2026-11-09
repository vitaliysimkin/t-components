<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import Button from './TButton.vue'

export interface TLogLine {
  id: number | string
  text: string
  kind?: 'out' | 'err' | 'warn' | 'info'
  prefix?: string
}

export interface TLogPaneProps {
  lines: TLogLine[]
  dropped?: number
  height?: string
  emptyText?: string
  droppedText?: string
  toEndLabel?: string
}

const props = withDefaults(defineProps<TLogPaneProps>(), {
  dropped: 0,
  height: '320px',
  emptyText: 'Empty so far…',
  droppedText: '… {count} older lines not shown',
  toEndLabel: 'Autoscroll paused — to the end',
})

// Lines present at mount are not flashed.
const initialIds = new Set(props.lines.map((l) => l.id))
const el = ref<HTMLElement>()
const follow = ref(true)
const scrolled = ref(false)

function scrollToEnd() {
  void nextTick(() => {
    if (el.value) el.value.scrollTop = el.value.scrollHeight
  })
}

function onScroll() {
  const e = el.value
  if (!e) return
  follow.value = e.scrollHeight - e.scrollTop - e.clientHeight < 24
  scrolled.value = e.scrollTop > 0
}

function toEnd() {
  follow.value = true
  scrollToEnd()
}

watch(() => [props.lines.length, props.lines[props.lines.length - 1]?.id], () => {
  if (follow.value) scrollToEnd()
})
</script>

<template>
  <div
    class="t-log-pane"
    :class="{ 'is-scrolled': scrolled }"
  >
    <div
      ref="el"
      class="t-log-pane__lines"
      :style="{ height }"
      role="log"
      aria-live="off"
      @scroll="onScroll"
    >
      <div
        v-if="dropped"
        class="is-info"
      >
        {{ droppedText.replace('{count}', String(dropped)) }}
      </div>
      <div
        v-if="!lines.length"
        class="is-info"
      >
        {{ emptyText }}
      </div>
      <div
        v-for="l in lines"
        :key="l.id"
        :class="[l.kind && `is-${l.kind}`, { 'is-new': !initialIds.has(l.id) }]"
      >
        <span
          v-if="l.prefix"
          class="t-log-pane__prefix"
        >{{ l.prefix + ' ' }}</span>{{ l.text }}
      </div>
    </div>
    <Button
      v-if="!follow"
      class="t-log-pane__to-end"
      type="button"
      size="small"
      icon="ticon:arrow-down"
      :label="toEndLabel"
      @click="toEnd"
    />
  </div>
</template>

<style scoped>
.t-log-pane {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Scroll edge: the top of the content fades out once scrolled (opacity only). */
.t-log-pane::before {
  content: '';
  position: absolute;
  inset: 1px 1px auto;
  height: 28px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(var(--t-color-surface-2), transparent);
  opacity: 0;
  transition: opacity var(--t-duration) var(--t-ease);
}

.t-log-pane.is-scrolled::before {
  opacity: 1;
}

.t-log-pane__lines {
  font-family: var(--t-font-mono);
  font-size: var(--t-font-size-mini);
  line-height: var(--t-line-height);
  background: var(--t-color-surface-2);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  padding: var(--t-space-2) var(--t-space-3);
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.is-err {
  color: var(--t-color-danger);
}

.is-warn {
  color: var(--t-color-warning);
}

.is-info {
  color: var(--t-color-text-muted);
  font-style: italic;
}

/* New line: accent background fades out (plays once on insert; none at motion off). */
.is-new {
  animation: t-flash calc(1s * var(--t-motion-scale)) ease-out;
}

.t-log-pane__prefix {
  color: var(--t-color-text-muted);
}

.t-log-pane__to-end {
  position: absolute;
  right: var(--t-space-3);
  bottom: var(--t-space-3);
}
</style>
