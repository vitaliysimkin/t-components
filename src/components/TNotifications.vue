<template>
  <Teleport to="body">
    <div
      class="t-notifications"
      :class="`t-notifications--${placement}`"
      aria-live="polite"
    >
      <TransitionGroup name="t-notification">
        <div
          v-for="n in items"
          :key="n.id"
          class="t-notification"
          :class="[`t-notification--${n.kind}`, { 't-notification--clickable': !!n.onClick }]"
          :role="n.onClick ? 'button' : 'status'"
          :tabindex="n.onClick ? 0 : undefined"
          :aria-label="n.onClick ? n.text : undefined"
          :style="(n.timeoutMs ?? 0) > 0 ? { '--t-notification-ms': n.timeoutMs } : undefined"
          @click="handleClick(n)"
          @keydown.enter.space.prevent="n.onClick && handleClick(n)"
        >
          <span class="t-notification__text">{{ n.text }}</span>
          <button
            v-if="closable"
            class="t-notification__close"
            type="button"
            aria-label="Dismiss"
            @click.stop="dismiss(n.id)"
          >
            ×
          </button>
          <span
            v-if="(n.timeoutMs ?? 0) > 0"
            class="t-notification__timer"
            aria-hidden="true"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications'
import type { Notification } from '../composables/useNotifications'

type Placement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

withDefaults(defineProps<{
  placement?: Placement
  closable?: boolean
}>(), {
  placement: 'top-right',
  closable: true,
})

const { items, dismiss } = useNotifications()

function handleClick(n: Notification): void {
  if (n.onClick) {
    n.onClick()
  } else {
    dismiss(n.id)
  }
}
</script>

<style scoped>
.t-notifications {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(420px, calc(100vw - 2rem));
  pointer-events: none;
}

.t-notifications--top-right    { top: 1rem; right: 1rem; }
.t-notifications--top-left     { top: 1rem; left: 1rem; }
.t-notifications--bottom-right { bottom: 1rem; right: 1rem; flex-direction: column-reverse; }
.t-notifications--bottom-left  { bottom: 1rem; left: 1rem;  flex-direction: column-reverse; }

.t-notification {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--t-radius-medium);
  font-size: var(--t-font-size-small);
  line-height: 1.4;
  background: var(--t-color-surface);
  color: var(--t-color-text);
  border: 1px solid var(--t-color-border);
  box-shadow: var(--t-shadow-2);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.t-notification--clickable {
  cursor: pointer;
}

.t-notification--clickable:hover {
  border-color: var(--t-color-border-strong);
}

.t-notification--clickable:focus-visible {
  outline: 2px solid var(--t-color-accent);
  outline-offset: 2px;
}

.t-notification--info {
  background: color-mix(in srgb, var(--t-color-accent-plain-bg), var(--t-color-surface));
  border-color: color-mix(in srgb, var(--t-color-accent) 35%, var(--t-color-border));
}
.t-notification--success {
  background: color-mix(in srgb, var(--t-color-success-plain-bg), var(--t-color-surface));
  border-color: color-mix(in srgb, var(--t-color-success) 35%, var(--t-color-border));
}
.t-notification--warning {
  background: color-mix(in srgb, var(--t-color-warning-plain-bg), var(--t-color-surface));
  border-color: color-mix(in srgb, var(--t-color-warning) 35%, var(--t-color-border));
}
.t-notification--error {
  background: color-mix(in srgb, var(--t-color-danger-plain-bg), var(--t-color-surface));
  border-color: color-mix(in srgb, var(--t-color-danger) 35%, var(--t-color-border));
}

.t-notification__text {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.t-notification__close {
  flex-shrink: 0;
  background: transparent;
  border: 0;
  color: currentColor;
  opacity: 0.6;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
}

.t-notification__close:hover {
  opacity: 1;
}

/* Remaining-time bar: thins out over the timeout (no animation at off). */
.t-notification__timer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: currentColor;
  opacity: 0.5;
  transform-origin: left;
  pointer-events: none;
  animation: t-notification-timer calc(var(--t-notification-ms) * 1ms * var(--t-motion-scale)) linear forwards;
}

@keyframes t-notification-timer {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Enter/leave: slide from beyond the screen edge (fade only at reduced motion) */
.t-notifications--top-left,
.t-notifications--bottom-left { --t-notification-dir: -1; }

.t-notification-enter-active,
.t-notification-leave-active {
  transition:
    transform var(--t-duration-slow) var(--t-ease),
    opacity var(--t-duration) var(--t-ease);
}
.t-notification-enter-from,
.t-notification-leave-to {
  transform: translateX(calc(110% * var(--t-motion-move) * var(--t-notification-dir, 1)));
  opacity: 0;
}
</style>
