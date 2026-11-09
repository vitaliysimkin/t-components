<script setup lang="ts">
import { computed } from 'vue'

/*
 * Tiny SVG plot of one animation: value over time. `ease` is the CSS timing function
 * (applied per keyframe segment, as CSS does); `frames` are [offset 0..1, value] keyframes.
 */
const props = withDefaults(defineProps<{
  ease: string
  ms: number
  delay?: number
  frames?: [number, number][]
  label?: string
}>(), {
  delay: 0,
  frames: () => [[0, 0], [1, 1]],
  label: 'progress',
})

const W = 140
const H = 48

const NAMED: Record<string, number[]> = {
  'ease': [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
}

function bezier([x1, y1, x2, y2]: number[]) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  return (x: number) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2
      if (at(x1, x2, mid) < x) lo = mid
      else hi = mid
    }
    return at(y1, y2, (lo + hi) / 2)
  }
}

function easing(css: string): (x: number) => number {
  const s = css.trim()
  if (NAMED[s]) return bezier(NAMED[s])
  const args = (s.match(/\(([^)]*)\)/)?.[1] ?? '').split(',').map(Number)
  if (s.startsWith('cubic-bezier')) return bezier(args)
  if (s.startsWith('linear(') && args.length > 1) {
    return (x) => {
      const p = x * (args.length - 1)
      const i = Math.min(Math.floor(p), args.length - 2)
      return args[i] + (args[i + 1] - args[i]) * (p - i)
    }
  }
  return (x) => x
}

const total = computed(() => props.delay + props.ms)

const path = computed(() => {
  const ease = easing(props.ease)
  const f = props.frames
  const value = (t: number) => {
    const i = Math.max(0, f.findIndex(([o], k) => k > 0 && t <= o) - 1)
    const [o0, v0] = f[i]
    const [o1, v1] = f[i + 1] ?? f[i]
    return v0 + (v1 - v0) * ease(o1 > o0 ? (t - o0) / (o1 - o0) : 1)
  }
  const pts: [number, number][] = []
  if (props.delay) pts.push([0, f[0][1]])
  for (let k = 0; k <= 80; k++) pts.push([props.delay + (k / 80) * props.ms, value(k / 80)])
  const ys = pts.map((p) => p[1])
  const min = Math.min(...ys)
  const max = Math.max(...ys)
  const y = (v: number) => H - 4 - ((v - min) / (max - min || 1)) * (H - 8)
  return pts.map(([t, v], k) => `${k ? 'L' : 'M'}${((t / total.value) * W).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
})
</script>

<template>
  <figure class="graph">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      :width="W"
      :height="H"
      role="img"
      :aria-label="`${label} over ${total} ms`"
    >
      <line
        x1="0"
        :y1="H - 0.5"
        :x2="W"
        :y2="H - 0.5"
        class="graph__axis"
      />
      <path
        :d="path"
        class="graph__line"
      />
    </svg>
    <figcaption>{{ label }} · {{ delay ? `${delay} + ` : '' }}{{ ms }} ms</figcaption>
  </figure>
</template>

<style scoped>
.graph {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.graph__axis {
  stroke: var(--t-color-border);
}

.graph__line {
  fill: none;
  stroke: var(--t-color-accent);
  stroke-width: 1.5;
}
</style>
