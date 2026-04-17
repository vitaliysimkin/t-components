# 02 — Smoke-тести через Vitest + @testing-library/vue

**Priority:** P0
**Effort:** M (1-2 дні)
**Impact:** XL
**Depends on:** немає
**Conflicts with:** немає (лише нові файли)

## Контекст

Див. [../review.md — TOP-10 #2](../review.md#2-smoke-тести-vitest--testing-libraryvue-для-топ-5-компонентів) + [«Приховані ризики #1»](../review.md#1-відсутність-будь-яких-тестів). У репо **нуль** тестів. Це означає: будь-який рефакторинг після цього коміта — російська рулетка. Мета — закрити базові сценарії для 5 найкритичніших компонентів, щоб наступні задачі (#03, #04, #05, #08) могли виконуватись без регресій.

## Acceptance criteria

- [ ] Додано `vitest`, `@testing-library/vue`, `@vue/test-utils`, `jsdom`, `happy-dom` (обрати одне — рекомендую `happy-dom`, швидший) у devDeps.
- [ ] `vitest.config.ts` у корені з `environment: 'happy-dom'` і `globals: true`.
- [ ] npm-скрипти: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] Папка `src/__tests__/` (або `src/components/*.test.ts` рядом з компонентами — обери один стиль і консистентно).
- [ ] Тести (мінімум 2-4 кейси на компонент):
  - `TButton` — рендер label/icon/slot, emit click при кліку, `disabled` (після задачі #03 — якщо #03 ще не змержено, тест за fallthrough через `$attrs`).
  - `TInput` — v-model two-way, `clearable` → emit `clear` + empty string, `prefixIcon` фокусує input при `@mousedown`.
  - `TSelect` — вибір value-mode `option` vs `value`, `isSelected` для falsy values (`0`, `''`, `false`) — **цей тест буде червоним** до виконання #05, залиш `test.fails` або skip з TODO коментарем "fixed in #05".
  - `TDatePicker` — single-mode emit, range-mode з двома кліками (включно з обміном start/end, коли другий клік раніший за перший — логіка на [TDatePicker.vue:378-380](../src/components/TDatePicker.vue#L378-L380)).
  - `useModalManager` (unit-тест, не компонент) — `openModal` → `closeModal` → стан повертається до пустого; `toggleMinimize` двічі → модалка не мінімізована.
- [ ] `npm run test` проходить локально.
- [ ] Додано step `run: npm run test` у [.github/workflows/release.yml](../.github/workflows/release.yml).

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
