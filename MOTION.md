# Motion architecture

How animation works in t-components. This document defines the foundation only; it contains no concrete animations (no button press, ripple or other effects).

Goals:

1. Animations are **on by default**. No configuration, no migration: existing apps get motion with the next release.
2. Individual JS effects are **opt-in and tree-shakable**.
3. **Minimal performance cost.**
4. **One global switch** turns all motion off or down to a simpler fallback.

---

## 1. Rules

| Rule | Why |
|---|---|
| **CSS-first.** Anything expressible with CSS transitions/keyframes stays in CSS. JS only when CSS cannot do it (e.g. pointer-position effects). | Zero JS cost, runs on the compositor, reacts to tokens for free. |
| **Animate only `transform` and `opacity`.** `color` / `background-color` / `border-color` transitions are allowed for state changes. Never animate layout properties (`width`, `height`, `top`, `margin`, …) or `box-shadow`. | `transform`/`opacity` skip layout and paint; color changes are a cheap paint. Layout and shadow animation repaint/reflow every frame. |
| **Springs are CSS `linear()` easing tokens** (`--t-ease-spring`). No JS spring solver. | Same feel, no runtime cost, no dependency. |
| **No permanent `will-change`.** Add it only where profiling shows a need, and only for the duration of the animation. | Permanent layers waste memory and can slow the page. |
| **Every duration uses motion tokens and respects the level.** No literal `ms` in component styles. | One switch must reach every animation. |
| **Every new animation is performance-checked before it is accepted** (DevTools Performance panel: no layout/paint thrash, holds frame rate). | Requirement 3 is verified, not assumed. |
| **Components never import JS effects.** The app opts in by importing an effect and applying it. | Core stays small; unused effects are never bundled. |
| **No per-component motion props.** Local control is the `data-t-motion` attribute on a container. | One mechanism instead of N props. |

Existing literal transitions are migrated to tokens later, when each component is touched.

The per-component `@media (prefers-reduced-motion: reduce)` block with `transition: none !important` in `TBottomNav` ignores `setMotion('full')`; it is migrated to tokens later, like the literal transitions.

---

## 2. Tokens

In [`src/styles/tokens.css`](src/styles/tokens.css), next to the existing motion tokens:

| Token | full | reduced | off | Use |
|---|---|---|---|---|
| `--t-motion-scale` | `1` | `1` | `0` | duration multiplier; `0` = off |
| `--t-motion-move` | `1` | `0` | `0` | movement multiplier for transform distances/scales; `0` = no movement |
| `--t-duration` | `150ms` | `150ms` | `0ms` | colors, background, borders, opacity (`150ms × scale`) |
| `--t-duration-slow` | `280ms` | `0ms` | `0ms` | movement and size changes (`280ms × scale × move`) |
| `--t-ease` | `cubic-bezier(0.2, 0, 0, 1)` | | | default easing |
| `--t-ease-spring` | `linear(…)` | | | springy movement (~10% overshoot) |

`--t-duration-slow` is the movement/size duration, so it disappears at `reduced`; `--t-duration` stays for opacity/color feedback.

```css
:root {
  --t-motion-scale: 1;
  --t-motion-move: 1;
  --t-ease: cubic-bezier(0.2, 0, 0, 1);
  --t-ease-spring: linear(0, 0.128, 0.393, 0.666, 0.88, 1.016, 1.08, 1.095, 1.08, 1.054,
    1.029, 1.009, 0.997, 0.992, 0.991, 0.993, 0.995, 0.998, 0.999, 1);
}

/* Derived tokens are re-declared on every scope so a subtree override recomputes them
   (custom properties resolve var() where declared, not where inherited). */
:root, [data-t-motion] {
  --t-duration: calc(150ms * var(--t-motion-scale));
  --t-duration-slow: calc(280ms * var(--t-motion-scale) * var(--t-motion-move));
}

[data-t-motion="full"]    { --t-motion-scale: 1; --t-motion-move: 1; }
[data-t-motion="reduced"] { --t-motion-scale: 1; --t-motion-move: 0; }
[data-t-motion="off"]     { --t-motion-scale: 0; --t-motion-move: 0; }

/* Before JS runs (SSR, first paint): follow the OS. */
@media (prefers-reduced-motion: reduce) {
  :root:not([data-t-motion]) { --t-motion-move: 0; }
}
```

The current `@media (prefers-reduced-motion: reduce)` block that zeroes `--t-duration` / `--t-duration-slow` is replaced by the rules above: under reduced motion, short color/opacity feedback stays, movement goes.

Writing an animation with tokens:

```css
.t-thing {
  transition:
    transform var(--t-duration-slow) var(--t-ease-spring),
    opacity var(--t-duration) var(--t-ease);
}
.t-thing.is-entering {
  opacity: 0;
  transform: translateY(calc(8px * var(--t-motion-move)))
             scale(calc(1 - 0.04 * var(--t-motion-move)));
}
```

At `reduced` the same rule degrades to a pure fade; at `off` nothing animates. Custom durations follow the same pattern: `calc(200ms * var(--t-motion-scale))`.

---

## 3. Levels and the global switch

| Level | Meaning |
|---|---|
| `full` | All motion. |
| `reduced` | Transform-based motion, scaling and particles fall back to a short opacity/color change. Feedback stays, movement goes. |
| `off` | No animation; changes are instant. |
| `auto` (default setting) | `prefers-reduced-motion: reduce` → `reduced`, otherwise `full`. |

`auto` is a setting, not a level: `<html>` always carries a resolved level.

### API

File: `src/composables/useMotion.ts`, mirroring [`src/composables/useTheme.ts`](src/composables/useTheme.ts).

```ts
export type MotionLevel = 'full' | 'reduced' | 'off'
export type MotionSetting = MotionLevel | 'auto'

export const currentMotion: Readonly<Ref<MotionSetting>>   // reactive setting (may be 'auto')
export const motionLevel: Readonly<Ref<MotionLevel>>       // reactive resolved level on <html>
export function setMotion(setting: MotionSetting): void
export function getMotionLevel(el?: Element): MotionLevel  // shared level helper
```

- `setMotion(setting)` does everything synchronously, with no watcher: sets `currentMotion`, writes the setting to `localStorage` under key **`t-motion`** (this is the only place that persists), resolves it, sets `motionLevel` and `data-t-motion="full|reduced|off"` on `document.documentElement`.
- `motionLevel` is a `readonly(shallowRef)` written only by the internal apply step (from `setMotion`, the initial restore and the OS change listener). It always equals the `<html>` attribute.
- An explicit `full` / `reduced` / `off` overrides the OS. `setMotion('auto')` returns to following the OS.
- `getMotionLevel(el)` returns the level of the nearest `[data-t-motion]` ancestor of `el` (including `el`), else the `<html>` level, else `full`. Every JS effect calls it before running; `off` → do nothing, `reduced` → simple fallback or nothing.

### Initialization (no user action required)

Same as `applyTheme()` / `currentTheme`: on module load in the browser (`typeof window !== 'undefined'`), the persisted setting is read from `localStorage` (`t-motion`, default `auto`) and applied to `<html>`. While the setting is `auto`, a `matchMedia('(prefers-reduced-motion: reduce)')` change listener re-applies it. The restore only applies the stored value and does not write it back. Because the module is imported by the core entry, this happens whenever the library is imported. Plugin `install()` stays unchanged.

This is intentionally a non-pure module, like `useTheme.ts`. Adding `"sideEffects": false` to `package.json` would let bundlers drop both restores.

Apps MAY call `setMotion()` (e.g. from a settings screen); calling it is optional. With no call, `auto` applies and animations work. Without JS (SSR, before hydration) the CSS defaults and the media-query fallback in §2 apply.

### Where it is exported from

`setMotion`, `currentMotion`, `motionLevel`, `getMotionLevel` and the types are exported from the **core entry** (`src/index.ts`, `@vitaliysimkin/t-components`), next to `applyTheme`. Reason: the switch and tokens are part of every component's behavior ("all motion code ships in core"), they are tiny, and the persisted level must be restored even when an app imports no effect.

The **`/motion` entry** (`@vitaliysimkin/t-components/motion`, `src/motion/index.ts`) holds only opt-in JS effects. It ships empty in the foundation. Effects import `getMotionLevel` internally from `src/composables/useMotion.ts`; the build shares that module with core instead of duplicating it.

---

## 4. Opt-in JS effects

- An effect is a plain function: `effect(el: HTMLElement, options?): () => void` — applies the effect and returns a cleanup function.
- A thin directive may wrap a function where declarative use helps.
- The first thing an effect does on each run is `getMotionLevel(el)`.
- Effects live in `src/motion/` and are exported from `src/motion/index.ts`. Components never import them; apps do:

```ts
import { someEffect } from '@vitaliysimkin/t-components/motion'
const stop = someEffect(el, { /* options */ })
```

### Foundation wiring for `/motion`

Same as the existing `markdown` / `code-editor` opt-in entries:

- `package.json` `exports["./motion"]`: `types ./dist/motion/index.d.ts`, `import ./dist/motion.js`, `require ./dist/motion.cjs`.
- `vite.config.ts` `build.lib.entry.motion: resolve(__dirname, 'src/motion/index.ts')`; add `motion` to the `globalComponents` dts exclusion regex.
- `.size-limit.json` entry `"Motion (opt-in)"`, `path: dist/motion.js`, same `ignore` list as the other opt-in entries.

### Tests

`src/__tests__/useMotion.test.ts` (vitest): each level sets the right `data-t-motion` value and `motionLevel`; `auto` resolves via `prefers-reduced-motion` (`reduced` when it matches, `full` otherwise); explicit setting overrides the OS; setting is persisted under `t-motion` and restored on load; `getMotionLevel` honors the nearest `[data-t-motion]` ancestor.

---

## 5. Switching motion off

Globally:

```ts
import { setMotion } from '@vitaliysimkin/t-components'
setMotion('off')      // or 'reduced'; setMotion('auto') to follow the OS again
```

Per subtree (CSS tokens and JS effects both honor it):

```html
<section data-t-motion="off">…</section>
<section data-t-motion="reduced">…</section>
```

---

## 6. Checklist for a new animation

1. Follows every rule in §1 and the token patterns in §2.
2. Checked at all three levels (`full`, `reduced`, `off`) and under a subtree override in the playground.
3. Profiled in the DevTools Performance panel: no layout/paint thrash, holds frame rate. Not accepted without this.
4. JS effect: `npm run check:size` passes.
