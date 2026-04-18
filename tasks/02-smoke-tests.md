# 02 — Smoke-тести через Vitest + @testing-library/vue

**Priority:** P0
**Effort:** M (1-2 дні)
**Impact:** XL
**Depends on:** немає
**Conflicts with:** немає (лише нові файли)

## Контекст

Див. [../review.md — TOP-10 #2](../review.md#2-smoke-тести-vitest--testing-libraryvue-для-топ-5-компонентів) + [«Приховані ризики #1»](../review.md#1-відсутність-будь-яких-тестів). У репо **нуль** тестів. Це означає: будь-який рефакторинг після цього коміта — російська рулетка. Мета — закрити базові сценарії для 5 найкритичніших компонентів, щоб наступні задачі (#03, #04, #05, #08) могли виконуватись без регресій.

## Acceptance criteria

- [x] Додано `vitest`, `@testing-library/vue`, `@vue/test-utils`, `happy-dom` у devDeps (обрано `happy-dom`, `jsdom` не додавали — тільки один environment).
- [x] `vitest.config.ts` у корені з `environment: 'happy-dom'` і `globals: true`.
- [x] npm-скрипти: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [x] Папка `src/__tests__/` — обраний стиль для всіх тестів.
- [x] Тести (мінімум 2-4 кейси на компонент):
  - `TButton` — рендер label/icon/slot, emit click при кліку, `disabled` через `$attrs` fallthrough.
  - `TInput` — v-model two-way, `clearable` → emit `clear` + empty string, `prefixIcon` фокусує input при `@mousedown`.
  - `TSelect` — вибір value-mode `option` vs `value`, clearable; falsy-bug (`modelValue: 0`) задокументований через `it.fails(...)` з TODO-коментарем "fixed in #05".
  - `TDatePicker` — single-mode emit, range-mode з двома кліками + обмін start/end, коли другий клік раніший за перший.
  - `useModalManager` — `openModal` → `closeModal` → стан очищується; `closeAllModals` повертає count; `toggleMinimize` двічі → не мінімізована; `setActiveModal`.
- [x] `npm run test` проходить локально (21 passed + 1 expected fail).
- [x] Додано step `run: npm run test` у [.github/workflows/release.yml](../.github/workflows/release.yml).

## Out of scope

- E2E / Playwright — окрема задача, не тепер.
- Visual regression (Chromatic, Percy) — не тепер.
- Покриття > 70% — ціль цього PR: **critical path**, не coverage-score.
- Тести на всі варіанти розмірів/варіантів (TButton × 5 size × 5 variant × 4 mode) — це snapshot-паста. Уникати.

## Files to touch

- `vitest.config.ts` (new)
- `package.json` (scripts, devDeps)
- `src/__tests__/TButton.test.ts` (new)
- `src/__tests__/TInput.test.ts` (new)
- `src/__tests__/TSelect.test.ts` (new)
- `src/__tests__/TDatePicker.test.ts` (new)
- `src/__tests__/useModalManager.test.ts` (new)
- `.github/workflows/release.yml` (додати test step)

## First step

```bash
npm i -D vitest @testing-library/vue @vue/test-utils happy-dom
```

Мінімальний `vitest.config.ts`:
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
```

Починай з `TButton.test.ts` — найпростіший кейс, швидкий win, перевіриш, чи config працює.

## Важливо для агента

Тест на falsy-bug у `TSelect` — **не виправляй** баг у цій задачі. Це скоуп задачі #05. Поточний тест лише документує наявний баг через `test.fails(...)` або skip з коментарем.

## Suggested PR title

`test: add vitest setup and smoke tests for critical components`

## Зроблено

- `package.json` — додано devDeps: `vitest@^4.1.4`, `@testing-library/vue@^8.1.0`, `@vue/test-utils@^2.4.6`, `happy-dom@^20.9.0`; скрипти `"test": "vitest run"` і `"test:watch": "vitest"`. `jsdom` свідомо не додавали — happy-dom покриває всі потреби й швидший.
- `vitest.config.ts` (new) — мінімальний конфіг з `environment: 'happy-dom'` і `globals: true`.
- `tsconfig.app.json` — додано `exclude` для `src/**/__tests__/**` + `*.test.ts` / `*.spec.ts`. Без цього `vite-plugin-dts` під час `build:nocheck` намагався згенерувати `.d.ts` для тестів і ловив TS2345 на нетипізованих `querySelector` результатах. Продакшн-білд це не ламало, але сміттям у логах. Тести не потрапляють у `dist`, типи від `vitest/globals` через глобальне оголошення в `vitest` + `tsconfig`-ексклюд працюють.
- `src/__tests__/TButton.test.ts` (new) — 5 кейсів: label, slot-override, icon, click-emit, `$attrs` fallthrough для `disabled` (до задачі #03).
- `src/__tests__/TInput.test.ts` (new) — 5 кейсів: reflect modelValue, v-model update, clearable emit `clear` + `''`, clear-icon прихований при пустому, prefix-icon фокусує input при mousedown.
- `src/__tests__/TSelect.test.ts` (new) — 4 кейси: valueMode `option` / `value` emit, clear emit, + задокументований falsy-bug через `it.fails(...)` (`modelValue: 0` має бути selected — на даний момент фейлиться в `isSelected` через `if (!props.modelValue) return false`; fix у #05).
- `src/__tests__/TDatePicker.test.ts` (new) — 3 кейси: single-mode emit дати, range-mode два кліки, range-swap коли другий клік раніший за перший (логіка на `TDatePicker.vue:378-380`).
- `src/__tests__/useModalManager.test.ts` (new) — 5 кейсів: openModal/closeModal round-trip, closeModal для unknown id, closeAllModals, toggleMinimize двічі, setActiveModal. Використовується `beforeEach` з `closeAllModals()` для ізоляції, бо `useModalManager` ділить module-scope state.
- `.github/workflows/release.yml` — додано `npm run test` step між `lint` і `publish`.

**Результат:** 21 passed + 1 expected fail (документує баг #05). `npm run typecheck` і `npm run build:nocheck` — чисто. `npm run lint` — 0 errors (warnings залишаються під задачу #11).
