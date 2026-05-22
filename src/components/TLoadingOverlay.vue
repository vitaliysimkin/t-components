<template>
  <!-- Full-screen overlays — teleported to <body> -->
  <Teleport to="body">
    <TransitionGroup name="t-loading-fade">
      <div
        v-for="inst in fullscreenInstances"
        :key="inst.id"
        class="t-loading-overlay t-loading-overlay--fullscreen"
        role="status"
        :aria-label="inst.text || 'Loading'"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="t-loading-overlay__box">
          <svg class="t-loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
            <circle
              class="t-loading-spinner__track"
              cx="25" cy="25" r="20"
              fill="none"
              stroke-width="4"
            />
            <circle
              class="t-loading-spinner__arc"
              cx="25" cy="25" r="20"
              fill="none"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
          <span v-if="inst.text" class="t-loading-overlay__text">{{ inst.text }}</span>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>

  <!-- Element-scoped overlays — rendered into their target via Teleport -->
  <template v-for="inst in scopedInstances" :key="inst.id">
    <Teleport :to="inst.target!">
      <Transition name="t-loading-fade">
        <div
          class="t-loading-overlay t-loading-overlay--scoped"
          role="status"
          :aria-label="inst.text || 'Loading'"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="t-loading-overlay__box">
            <svg class="t-loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
              <circle
                class="t-loading-spinner__track"
                cx="25" cy="25" r="20"
                fill="none"
                stroke-width="4"
              />
              <circle
                class="t-loading-spinner__arc"
                cx="25" cy="25" r="20"
                fill="none"
                stroke-width="4"
                stroke-linecap="round"
              />
            </svg>
            <span v-if="inst.text" class="t-loading-overlay__text">{{ inst.text }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLoading } from '../composables/useLoading'

const { instances } = useLoading()

const fullscreenInstances = computed(() =>
  instances.value.filter(i => i.fullscreen || !i.target)
)

const scopedInstances = computed(() =>
  instances.value.filter(i => !i.fullscreen && !!i.target)
)

// ── Scroll locking ────────────────────────────────────────────────────────────

const lockedElements = new Map<HTMLElement | typeof document.body, number>()

function lockEl(el: HTMLElement | null): void {
  const target = el ?? document.body
  const count = lockedElements.get(target) ?? 0
  if (count === 0) {
    ;(target as HTMLElement).style.overflow = 'hidden'
  }
  lockedElements.set(target, count + 1)
}

function unlockEl(el: HTMLElement | null): void {
  const target = el ?? document.body
  const count = lockedElements.get(target) ?? 0
  const next = Math.max(0, count - 1)
  if (next === 0) {
    ;(target as HTMLElement).style.overflow = ''
    lockedElements.delete(target)
  } else {
    lockedElements.set(target, next)
  }
}

// Watch for instances being added / removed and apply lock/unlock.
watch(
  instances,
  (newList, oldList) => {
    const oldIds = new Set((oldList ?? []).map(i => i.id))
    const newIds = new Set(newList.map(i => i.id))

    // Added
    for (const inst of newList) {
      if (!oldIds.has(inst.id) && inst.lock) {
        lockEl(inst.fullscreen ? null : inst.target)
      }
    }

    // Removed
    for (const inst of (oldList ?? [])) {
      if (!newIds.has(inst.id) && inst.lock) {
        unlockEl(inst.fullscreen ? null : inst.target)
      }
    }
  },
  { deep: false }
)
</script>

<style scoped>
/* ── Overlay base ────────────────────────────────────────────────────────────*/
.t-loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--t-color-bg, #000) 70%, transparent);
  backdrop-filter: blur(2px);
  z-index: 9998;
}

.t-loading-overlay--fullscreen {
  position: fixed;
  inset: 0;
}

.t-loading-overlay--scoped {
  position: absolute;
  inset: 0;
}

/* ── Spinner box ─────────────────────────────────────────────────────────────*/
.t-loading-overlay__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--t-space-3, 0.75rem);
}

.t-loading-overlay__text {
  font-size: var(--t-font-size-default, 0.875rem);
  color: var(--t-color-text, #fff);
  text-align: center;
  max-width: 20rem;
  line-height: var(--t-line-height, 1.5);
}

/* ── SVG spinner ─────────────────────────────────────────────────────────────*/
.t-loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  animation: t-loading-rotate 1.4s linear infinite;
}

.t-loading-spinner__track {
  stroke: color-mix(in srgb, var(--t-color-accent, #4dabf7) 25%, transparent);
}

.t-loading-spinner__arc {
  stroke: var(--t-color-accent, #4dabf7);
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: t-loading-dash 1.4s ease-in-out infinite;
}

@keyframes t-loading-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes t-loading-dash {
  0%   { stroke-dasharray: 1, 200;  stroke-dashoffset: 0; }
  50%  { stroke-dasharray: 100, 200; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 100, 200; stroke-dashoffset: -125; }
}

/* ── Fade transition ─────────────────────────────────────────────────────────*/
.t-loading-fade-enter-active,
.t-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}
.t-loading-fade-enter-from,
.t-loading-fade-leave-to {
  opacity: 0;
}
</style>
