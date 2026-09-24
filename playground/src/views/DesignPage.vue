<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { currentTheme, TCard, TTag, TButton } from '@vitaliysimkin/t-components'
import { watch } from 'vue'

/* Read live values of tokens so the page always reflects the active theme. */
const colorRoles = [
  ['--t-color-bg', 'Page background. Sidebars and nav sit on it too.'],
  ['--t-color-surface', 'Cards, inputs, popovers, table body.'],
  ['--t-color-surface-2', 'Inset areas: code blocks, disabled inputs, segmented track.'],
  ['--t-color-border', 'The only line color. Hairlines everywhere.'],
  ['--t-color-border-strong', 'Hover on borders, drag handles.'],
  ['--t-color-text', 'Primary text.'],
  ['--t-color-text-muted', 'Secondary text, labels, icons at rest.'],
  ['--t-color-hover', 'Transparent hover overlay, works on any surface.'],
  ['--t-color-accent', 'One accent. Primary buttons, links, active icons.'],
  ['--t-color-accent-plain-bg', 'Soft accent tint for selected / active states.'],
  ['--t-color-success', 'Positive status.'],
  ['--t-color-warning', 'Attention status.'],
  ['--t-color-danger', 'Errors and destructive actions.'],
  ['--t-color-info', 'Muted secondary actions (TButton variant="info").'],
] as const

const radii = ['mini', 'small', 'default', 'medium', 'large', 'pill'] as const
const radiiUse: Record<(typeof radii)[number], string> = {
  mini: 'checkbox, inline code',
  small: 'small controls',
  default: 'buttons, inputs, menu items',
  medium: 'toasts, dropdown lists',
  large: 'cards, modals, tables',
  pill: 'tags, badges, switches',
}

const spaces = [1, 2, 3, 4, 5, 6, 7, 8] as const
const fontSizes = ['mini', 'small', 'default', 'medium', 'large', 'xlarge', 'h1', 'h2', 'h3'] as const
const shadows = [1, 2, 3] as const

const values = ref<Record<string, string>>({})

function readTokens() {
  const cs = getComputedStyle(document.documentElement)
  const out: Record<string, string> = {}
  const names = [
    ...colorRoles.map((r) => r[0]),
    ...radii.map((r) => `--t-radius-${r}`),
    ...spaces.map((s) => `--t-space-${s}`),
    ...fontSizes.map((f) => `--t-font-size-${f}`),
    '--t-font-ui', '--t-font-mono',
  ]
  for (const n of names) out[n] = cs.getPropertyValue(n).trim()
  values.value = out
}

onMounted(readTokens)
watch(currentTheme, () => requestAnimationFrame(readTokens))
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-head__title">
        Design tokens
      </h1>
      <span class="page-head__meta">live values for the active theme · full rules in <code>DESIGN.md</code></span>
    </header>

    <TCard header="Principles">
      <ul class="rules">
        <li><b>One line color.</b> Everything is separated with <code>--t-color-border</code> hairlines, not shadows. Shadows are reserved for things that float (popovers, toasts, modals).</li>
        <li><b>Two surfaces.</b> Page is <code>bg</code>, things on it are <code>surface</code>. Don't invent a third; use <code>surface-2</code> only for insets.</li>
        <li><b>One accent.</b> Terracotta marks the primary action and the active state. Semantic colors are muted and used only for status.</li>
        <li><b>Weight over size.</b> Hierarchy comes from 500 / 600 weight and muted text, not from big type. Body 14px, headings 20 / 16 / 14.</li>
        <li><b>Radius by role.</b> 8px for controls, 12px for containers, pill for chips. Never mix on the same element family.</li>
      </ul>
    </TCard>

    <TCard header="Colors (roles)">
      <div class="swatches">
        <div
          v-for="[name, hint] in colorRoles"
          :key="name"
          class="swatch"
        >
          <i
            class="swatch__chip"
            :style="{ background: `var(${name})` }"
          />
          <div class="swatch__meta">
            <code class="swatch__name">{{ name }}</code>
            <span class="swatch__value">{{ values[name] }}</span>
            <span class="swatch__hint">{{ hint }}</span>
          </div>
        </div>
      </div>
    </TCard>

    <div class="two-col">
      <TCard header="Radius">
        <div class="radii">
          <div
            v-for="r in radii"
            :key="r"
            class="radius"
          >
            <i
              class="radius__chip"
              :style="{ borderRadius: `var(--t-radius-${r})` }"
            />
            <div class="swatch__meta">
              <code class="swatch__name">--t-radius-{{ r }}</code>
              <span class="swatch__value">{{ values[`--t-radius-${r}`] }} · {{ radiiUse[r] }}</span>
            </div>
          </div>
        </div>
      </TCard>

      <TCard header="Spacing">
        <div class="spaces">
          <div
            v-for="s in spaces"
            :key="s"
            class="space"
          >
            <code class="swatch__name">--t-space-{{ s }}</code>
            <i
              class="space__bar"
              :style="{ width: `var(--t-space-${s})` }"
            />
            <span class="swatch__value">{{ values[`--t-space-${s}`] }}</span>
          </div>
        </div>
      </TCard>
    </div>

    <TCard header="Typography">
      <div class="type">
        <div class="type__row">
          <span class="swatch__value">--t-font-ui</span>
          <span class="type__sample">{{ values['--t-font-ui'] }}</span>
        </div>
        <div class="type__row">
          <span class="swatch__value">--t-font-mono</span>
          <code class="type__sample">{{ values['--t-font-mono'] }}</code>
        </div>
        <div
          v-for="f in fontSizes"
          :key="f"
          class="type__row"
        >
          <span class="swatch__value">--t-font-size-{{ f }} · {{ values[`--t-font-size-${f}`] }}</span>
          <span
            class="type__sample"
            :style="{ fontSize: `var(--t-font-size-${f})`, fontWeight: f.startsWith('h') ? 600 : 400 }"
          >The quick brown fox jumps over the lazy dog</span>
        </div>
      </div>
    </TCard>

    <div class="two-col">
      <TCard header="Shadows">
        <div class="shadows">
          <div
            v-for="s in shadows"
            :key="s"
            class="shadow"
            :style="{ boxShadow: `var(--t-shadow-${s})` }"
          >
            <code class="swatch__name">--t-shadow-{{ s }}</code>
            <span class="swatch__hint">{{ ['resting lift', 'popovers, toasts', 'modals, drawers'][s - 1] }}</span>
          </div>
        </div>
      </TCard>

      <TCard header="Status recipe">
        <p class="muted">
          Status = soft tint + muted text of the same hue. Same recipe in tags, banners and toasts.
        </p>
        <div class="row">
          <TTag variant="green">
            працює
          </TTag>
          <TTag variant="yellow">
            увага
          </TTag>
          <TTag variant="red">
            помилка
          </TTag>
          <TTag variant="gray">
            зупинено
          </TTag>
          <TTag variant="orange">
            accent
          </TTag>
        </div>
        <div class="row">
          <TButton>Neutral</TButton>
          <TButton variant="accent">
            Accent
          </TButton>
          <TButton
            variant="danger"
            mode="plain"
          >
            Danger
          </TButton>
          <TButton
            variant="info"
            mode="ghost"
          >
            Ghost
          </TButton>
        </div>
      </TCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-5) var(--t-space-6) var(--t-space-7);
  max-width: 1100px;
}

.page-head {
  display: flex;
  align-items: baseline;
  gap: var(--t-space-3);
  flex-wrap: wrap;
}

.page-head__title {
  margin: 0;
  font-size: var(--t-font-size-h1);
  font-weight: var(--t-font-weight-semibold);
  line-height: var(--t-line-height-tight);
}

.page-head__meta {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--t-space-4);
  align-items: start;
}

.rules {
  margin: 0;
  padding-left: 1.2em;
  display: flex;
  flex-direction: column;
  gap: var(--t-space-2);
}

.muted { color: var(--t-color-text-muted); margin: 0 0 var(--t-space-3); }
.row { display: flex; flex-wrap: wrap; gap: var(--t-space-2); align-items: center; }
.row + .row { margin-top: var(--t-space-3); }

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--t-space-3);
}

.swatch { display: flex; gap: var(--t-space-3); align-items: flex-start; }
.swatch__chip {
  display: block;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: var(--t-radius-default);
  border: 1px solid var(--t-color-border);
}
.swatch__meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.swatch__name { font-size: var(--t-font-size-mini); color: var(--t-color-text); }
.swatch__value { font-size: var(--t-font-size-mini); color: var(--t-color-text-muted); font-family: var(--t-font-mono); }
.swatch__hint { font-size: var(--t-font-size-mini); color: var(--t-color-text-muted); }

.radii { display: flex; flex-direction: column; gap: var(--t-space-3); }
.radius { display: flex; gap: var(--t-space-3); align-items: center; }
.radius__chip {
  display: block;
  flex: none;
  width: 44px;
  height: 32px;
  border: 1px solid var(--t-color-border-strong);
  background: var(--t-color-surface-2);
}

.spaces { display: flex; flex-direction: column; gap: var(--t-space-2); }
.space { display: grid; grid-template-columns: 96px 1fr 44px; align-items: center; gap: var(--t-space-3); }
.space__bar { display: block; height: 10px; border-radius: 2px; background: var(--t-color-accent); }

.type { display: flex; flex-direction: column; gap: var(--t-space-3); }
.type__row { display: grid; grid-template-columns: 200px 1fr; gap: var(--t-space-3); align-items: baseline; }
.type__sample { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.shadows { display: flex; flex-direction: column; gap: var(--t-space-4); padding: var(--t-space-2) 0; }
.shadow {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--t-space-3) var(--t-space-4);
  border-radius: var(--t-radius-medium);
  background: var(--t-color-surface);
  border: 1px solid var(--t-color-border);
}

@media (max-width: 760px) {
  .page { padding: var(--t-space-4); }
  .type__row { grid-template-columns: 1fr; }
}
</style>
