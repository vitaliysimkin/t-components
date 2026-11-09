<template>
  <div class="anim-page">
    <h1 class="anim-page__title">
      Button animations
    </h1>

    <div class="anim-controls">
      <div class="anim-controls__item">
        <span>Mode</span>
        <TButtonGroup
          v-model="mode"
          :options="modes.map(v => ({ value: v, label: v }))"
          size="small"
          mandatory
        />
      </div>
      <div class="anim-controls__item">
        <span>Color</span>
        <TButtonGroup
          v-model="variant"
          :options="variants.map(v => ({ value: v, label: v }))"
          size="small"
          mandatory
        />
      </div>
      <div class="anim-controls__item">
        <span>Size</span>
        <TButtonGroup
          v-model="size"
          :options="sizes.map(v => ({ value: v, label: v }))"
          size="small"
          mandatory
        />
      </div>
      <div class="anim-controls__item">
        <span>Icon</span>
        <TSwitch v-model="withIcon" />
      </div>
    </div>

    <div class="anim-grid">
      <div
        v-for="(a, i) in animations"
        :key="a.key"
        class="anim-card"
      >
        <div class="anim-card__stage">
          <TButton
            :variant="variant as TButtonVariant"
            :mode="mode as TButtonMode"
            :size="size as TButtonSize"
            :icon="withIcon ? iconFor(a) : undefined"
            :label="labelFor(a)"
            :class="a.base"
            @click="(e: MouseEvent) => run(a, e)"
            @pointerdown="(e: PointerEvent) => down(a, e)"
            @pointerup="(e: PointerEvent) => up(a, e)"
            @pointerleave="(e: PointerEvent) => up(a, e)"
            @pointercancel="(e: PointerEvent) => up(a, e)"
          />
        </div>
        <div class="anim-card__name">
          {{ i + 1 }}. {{ a.name }}
        </div>
        <div class="anim-card__desc">
          {{ a.desc }}
        </div>
        <div
          class="anim-card__perf"
          :data-level="perf[a.key].level"
        >
          <span class="anim-card__perf-badge">perf impact: {{ perf[a.key].level }}</span>
          {{ perf[a.key].note }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  TButton,
  TButtonGroup,
  TSwitch,
  type TButtonVariant,
  type TButtonSize
} from '@vitaliysimkin/t-components'

type TButtonMode = 'filled' | 'plain' | 'ghost' | 'text'
const modes: TButtonMode[] = ['filled', 'plain', 'ghost', 'text']
const variants: TButtonVariant[] = ['neutral', 'accent', 'danger', 'success', 'warning', 'info']
const sizes: TButtonSize[] = ['small', 'default', 'medium', 'large']

const mode = ref<string | number | null>('filled')
const variant = ref<string | number | null>('accent')
const size = ref<string | number | null>('medium')
const withIcon = ref(true)

interface Anim {
  key: string
  name: string
  desc: string
  icon: string
  label?: string
  base?: string
  cls?: string
  kind?: 'class' | 'ripple' | 'confetti' | 'success' | 'sink' | 'sink-ripple' | 'press-ripple'
}

const animations: Anim[] = [
  { key: 'press', name: 'Press', desc: 'Squash on press, spring back', icon: 'system-uicons:check', cls: 'anim-press' },
  { key: 'ripple', name: 'Ripple', desc: 'Material ink ripple from click point', icon: 'system-uicons:target', base: 'anim-clip', kind: 'ripple' },
  { key: 'pop', name: 'Pop', desc: 'Quick overshoot scale', icon: 'system-uicons:heart', cls: 'anim-pop' },
  { key: 'shake', name: 'Shake', desc: 'Horizontal shake (error / denied)', icon: 'system-uicons:cross', cls: 'anim-shake' },
  { key: 'pulse', name: 'Pulse ring', desc: 'Expanding outline ring', icon: 'system-uicons:bell', cls: 'anim-pulse' },
  { key: 'jelly', name: 'Jelly', desc: 'Rubber-band wobble', icon: 'system-uicons:star', cls: 'anim-jelly' },
  { key: 'shine', name: 'Shine', desc: 'Light sweep across the surface', icon: 'system-uicons:sun', base: 'anim-clip', cls: 'anim-shine' },
  { key: 'spin', name: 'Icon spin', desc: 'Only the icon rotates', icon: 'system-uicons:refresh', cls: 'anim-spin' },
  { key: 'confetti', name: 'Confetti', desc: 'Particle burst around the button', icon: 'system-uicons:gift', kind: 'confetti' },
  { key: 'success', name: 'Loading → success', desc: 'Spinner, then check mark', icon: 'system-uicons:upload', kind: 'success' },
  { key: 'press-ripple', name: 'Press + ripple', desc: 'Squash + ink ripple from click point', icon: 'system-uicons:check', base: 'anim-clip', kind: 'press-ripple' },
  { key: 'sink', name: 'Sink, then spring', desc: 'Hold at 95%, release with spring overshoot', icon: 'system-uicons:arrow-right', kind: 'sink' },
  { key: 'sink-ripple', name: 'Sink, then spring + ripple', desc: 'Ripple from touch point, sink while held, spring on release', label: 'Sink + ripple', icon: 'system-uicons:arrow-right', base: 'anim-clip', kind: 'sink-ripple' }
]

type PerfLevel = 'low' | 'medium' | 'high'
const perf: Record<string, { level: PerfLevel, note: string }> = {
  press: { level: 'low', note: 'transform only, runs on compositor' },
  ripple: { level: 'low', note: '1 DOM node per click; transform + opacity' },
  pop: { level: 'low', note: 'transform only' },
  shake: { level: 'low', note: 'transform only' },
  pulse: { level: 'medium', note: 'animates box-shadow → repaint every frame' },
  jelly: { level: 'low', note: 'transform only' },
  shine: { level: 'low', note: 'pseudo-element transform; overflow clip' },
  spin: { level: 'low', note: 'transform on inline SVG' },
  confetti: { level: 'medium', note: '24 DOM nodes per click; layout on insert' },
  success: { level: 'low', note: 'Vue re-render of icon/label; looped spin while loading' },
  'press-ripple': { level: 'low', note: 'press + ripple: transform/opacity, 1 node' },
  sink: { level: 'low', note: 'transform only; 3–4 pointer listeners' },
  'sink-ripple': { level: 'low', note: 'sink + 1 ripple node per press' }
}

type SuccessState = 'idle' | 'loading' | 'done'
const successState = reactive<Record<string, SuccessState>>({})

function iconFor(a: Anim) {
  if (a.kind === 'success') {
    const s = successState[a.key] ?? 'idle'
    if (s === 'loading') return 'system-uicons:loader'
    if (s === 'done') return 'system-uicons:check'
  }
  return a.icon
}

function labelFor(a: Anim) {
  if (a.kind === 'success') {
    const s = successState[a.key] ?? 'idle'
    if (s === 'loading') return 'Saving…'
    if (s === 'done') return 'Saved'
    return 'Save'
  }
  return a.label ?? a.name
}

function replayClass(el: HTMLElement, cls: string) {
  el.classList.remove(cls)
  void el.offsetWidth
  el.classList.add(cls)
  const done = (ev: AnimationEvent) => {
    if (ev.target !== el && !el.contains(ev.target as Node)) return
    el.classList.remove(cls)
    el.removeEventListener('animationend', done)
  }
  el.addEventListener('animationend', done)
}

function ripple(el: HTMLElement, e: MouseEvent) {
  const r = el.getBoundingClientRect()
  const d = Math.max(r.width, r.height) * 2
  const s = document.createElement('span')
  s.className = 'anim-ripple'
  s.style.width = s.style.height = `${d}px`
  s.style.left = `${(e.clientX || r.left + r.width / 2) - r.left - d / 2}px`
  s.style.top = `${(e.clientY || r.top + r.height / 2) - r.top - d / 2}px`
  el.appendChild(s)
  s.addEventListener('animationend', () => s.remove())
}

const confettiColors = ['--t-terra-5', '--t-blue-5', '--t-green-5', '--t-violet-5', '--t-amber-5', '--t-rose-5']

function confetti(el: HTMLElement) {
  const stage = el.parentElement!
  const r = el.getBoundingClientRect()
  const sr = stage.getBoundingClientRect()
  const cx = r.left - sr.left + r.width / 2
  const cy = r.top - sr.top + r.height / 2
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('span')
    p.className = 'anim-particle'
    const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3
    const dist = 50 + Math.random() * 40
    p.style.left = `${cx}px`
    p.style.top = `${cy}px`
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
    p.style.setProperty('--rot', `${Math.random() * 540 - 270}deg`)
    p.style.background = `var(${confettiColors[i % confettiColors.length]})`
    stage.appendChild(p)
    p.addEventListener('animationend', () => p.remove())
  }
  replayClass(el, 'anim-pop')
}

function success(a: Anim, el: HTMLElement) {
  if ((successState[a.key] ?? 'idle') !== 'idle') return
  successState[a.key] = 'loading'
  el.classList.add('anim-loading')
  setTimeout(() => {
    el.classList.remove('anim-loading')
    successState[a.key] = 'done'
    replayClass(el, 'anim-done')
    setTimeout(() => { successState[a.key] = 'idle' }, 1400)
  }, 1200)
}

function isSink(a: Anim) {
  return a.kind === 'sink' || a.kind === 'sink-ripple'
}

function down(a: Anim, e: PointerEvent) {
  if (!isSink(a) || e.button !== 0) return
  const el = e.currentTarget as HTMLElement
  el.classList.remove('anim-spring')
  el.classList.add('anim-sunk')
  if (a.kind === 'sink-ripple') ripple(el, e)
}

function up(a: Anim, e: PointerEvent) {
  if (!isSink(a)) return
  const el = e.currentTarget as HTMLElement
  if (!el.classList.contains('anim-sunk')) return
  el.classList.remove('anim-sunk')
  replayClass(el, 'anim-spring')
}

function run(a: Anim, e: MouseEvent) {
  if (isSink(a)) {
    // Keyboard activation (Enter/Space) has no pointer events.
    if (e.detail === 0) replayClass(e.currentTarget as HTMLElement, 'anim-spring')
    return
  }
  const el = e.currentTarget as HTMLElement
  if (a.kind === 'ripple') return ripple(el, e)
  if (a.kind === 'press-ripple') {
    ripple(el, e)
    return replayClass(el, 'anim-press')
  }
  if (a.kind === 'confetti') return confetti(el)
  if (a.kind === 'success') return success(a, el)
  if (a.cls) replayClass(el, a.cls)
}
</script>

<style scoped>
.anim-page {
  padding: var(--t-space-6, 24px);
  max-width: 1100px;
}

.anim-page__title {
  margin: 0 0 var(--t-space-4, 16px);
  font-size: var(--t-font-size-large, 20px);
  color: var(--t-color-text);
}

.anim-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--t-space-4, 16px) var(--t-space-6, 24px);
  padding: var(--t-space-3, 12px) var(--t-space-4, 16px);
  margin-bottom: var(--t-space-5, 20px);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium, 8px);
  background: var(--t-color-surface);
  position: sticky;
  top: 0;
  z-index: 5;
}

.anim-controls__item {
  display: flex;
  align-items: center;
  gap: var(--t-space-2, 8px);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.anim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--t-space-4, 16px);
}

.anim-card {
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium, 8px);
  background: var(--t-color-surface);
  padding: var(--t-space-3, 12px);
}

.anim-card__stage {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anim-card__name {
  font-weight: 600;
  color: var(--t-color-text);
  font-size: var(--t-font-size-default);
}

.anim-card__perf {
  margin-top: var(--t-space-2, 8px);
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.anim-card__perf-badge {
  display: inline-block;
  margin-right: 4px;
  padding: 0 6px;
  border-radius: 4px;
  font-weight: 600;
  background: color-mix(in srgb, var(--perf-c) 18%, transparent);
  color: var(--perf-c);
}

.anim-card__perf[data-level='low'] { --perf-c: var(--t-green-5); }
.anim-card__perf[data-level='medium'] { --perf-c: var(--t-amber-5); }
.anim-card__perf[data-level='high'] { --perf-c: var(--t-rose-5); }

.anim-card__desc {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}
</style>

<!-- Global: classes are toggled / elements injected at runtime. -->
<style>
.anim-clip {
  position: relative;
  overflow: hidden;
}

/* 1. Press */
.anim-press { animation: anim-press 0.35s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes anim-press {
  0% { transform: scale(1); }
  30% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

/* 2. Ripple */
.anim-ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  transform: scale(0);
  pointer-events: none;
  animation: anim-ripple 0.6s ease-out forwards;
}
@keyframes anim-ripple {
  to { transform: scale(1); opacity: 0; }
}

/* 3. Pop */
.anim-pop { animation: anim-pop 0.4s cubic-bezier(.2, 1.8, .4, 1); }
@keyframes anim-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* 4. Shake */
.anim-shake { animation: anim-shake 0.45s ease-in-out; }
@keyframes anim-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(7px); }
  45% { transform: translateX(-5px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}

/* 5. Pulse ring */
.anim-pulse { animation: anim-pulse 0.7s ease-out; }
@keyframes anim-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 50%, transparent); }
  100% { box-shadow: 0 0 0 16px color-mix(in srgb, currentColor 0%, transparent); }
}

/* 6. Jelly */
.anim-jelly { animation: anim-jelly 0.7s ease; }
@keyframes anim-jelly {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.2, 0.8); }
  45% { transform: scale(0.85, 1.15); }
  60% { transform: scale(1.08, 0.94); }
  75% { transform: scale(0.97, 1.03); }
  100% { transform: scale(1, 1); }
}

/* 7. Shine */
.anim-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: anim-shine 0.7s ease-out;
  pointer-events: none;
}
@keyframes anim-shine {
  to { transform: translateX(120%); }
}

/* 8. Icon spin */
.anim-spin svg { animation: anim-spin 0.6s cubic-bezier(.5, 0, .3, 1); }
@keyframes anim-spin {
  to { transform: rotate(360deg); }
}

/* 9. Confetti */
.anim-particle {
  position: absolute;
  width: 6px;
  height: 10px;
  border-radius: 1px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: anim-particle 0.8s cubic-bezier(.1, .7, .3, 1) forwards;
}
@keyframes anim-particle {
  to {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot));
    opacity: 0;
  }
}

/* 10. Loading → success */
.anim-loading { pointer-events: none; }
.anim-loading svg { animation: anim-spin-loop 0.8s linear infinite; }
@keyframes anim-spin-loop {
  to { transform: rotate(360deg); }
}
.anim-done { animation: anim-pop 0.4s cubic-bezier(.2, 1.8, .4, 1); }
.anim-done svg { animation: anim-check 0.4s cubic-bezier(.2, 1.8, .4, 1); }
@keyframes anim-check {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* 11–12. Sink, then spring */
.anim-sunk {
  transform: scale(0.95);
  transition: transform 0.12s cubic-bezier(.3, 0, .2, 1) !important;
}
.anim-spring { animation: anim-spring 0.55s linear; }
@keyframes anim-spring {
  0% { transform: scale(0.95); animation-timing-function: cubic-bezier(.3, 0, .4, 1); }
  40% { transform: scale(1.025); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  70% { transform: scale(0.994); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  88% { transform: scale(1.003); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  [class*='anim-'] { animation-duration: 0.01ms !important; }
}
</style>
