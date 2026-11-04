# Крок 5 — S03 `TSelect` з завантаженням варіантів

## Що змінено
- `src/components/TSelect.vue`: `valueKey` / `labelKey` — `string | ((option) => string)`; новий проп `filterLoaded` — у режимі `loadOptions` варіанти фільтруються на клієнті (`filterFn` або підрядок підпису без регістру); відхилений проміс `loadOptions` (останнього запиту) → подія `load-error` з помилкою. Без нових пропів поведінка та сама.
- `src/__tests__/TSelect.test.ts`: +3 тести (ключі-функції, `filterLoaded`, `load-error`); наявні не змінено.
- `playground/src/examples/select/SelectLoadingExample.vue` («Async Loading»): сирі об'єкти `User`, ключі-функції, `filter-loaded`, помилка через `@load-error` → `error` (запит «error» імітує збій); прибрано неіснуючий проп `min-query-length`.
- `CHANGELOG.md` — рядок у `[Unreleased] / Added`.

## Перевірки
- `npm run test -- TSelect` — 8/8 зелені; тест `filterLoaded` падає без пропа (перевірено).
- `npm run check:fast` — lint чистий, 27 файлів / 223 тести зелені, build без помилок.
- `npm run dev` + Playwright/Chromium, світла й темна: «kip» → лише «Kip Neath», «Kip Critchlow»; вибір показує підпис; «error» → «Could not load users» під полем; помилок сторінки немає.
