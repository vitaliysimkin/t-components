# Крок 3 — K01 `TCopyField` + K02 `TCopyChip`

## Що змінено
- `src/components/clipboard.ts`: `copyText(text)` — `navigator.clipboard.writeText`, fallback через приховану `textarea` + `execCommand('copy')`; повертає `true`/`false`.
- `src/components/TCopyField.vue`: `TInput readonly` + `TButton`; пропи `value`, `copyLabel` (`Copy`), `copiedLabel` (`Copied`); після успіху 1,5 с — `copiedLabel`, `ticon:check`, `variant="success"`; події `copy` / `copy-error`.
- `src/components/TCopyChip.vue`: кнопка-чіп з `label ?? value` та `ticon:copy`; пропи `value`, `label`, `title` (`Copy`); події `copy` / `copy-error`. Стилі з Bombadil, px замінено токенами.
- `src/icons/ticon-set.ts`: `ticon:copy` (content-copy-outline), `ticon:check` (Material Symbols).
- Реєстрація: `registry.ts`, `index.ts` (+ типи `TCopyFieldProps`, `TCopyChipProps`), `globalComponents.ts`.
- Тести `src/__tests__/TCopyField.test.ts`, `TCopyChip.test.ts` (мок `navigator.clipboard`): `copy` зі значенням, `copy-error` при помилці, стан «скопійовано» спадає через 1,5 с.
- Playground: `playground/src/examples/copy/` (сторінки TCopyField, TCopyChip; повідомлення показує сам приклад через `useNotifications`), `examples/index.ts`.
- README (перелік «Форми»), CHANGELOG `[Unreleased]` → Added.

## Перевірки
- `npm run check:fast` — lint чистий, 25 файлів / 217 тестів зелені, build без помилок.
- `npm run check:size` — у межах: Full bundle 187.92 / 195 kB, Styles 11.94 / 12 kB (запас малий), Core 159.31 / 180 kB.
- `npm run build:playground` — зібрано.
- Ручний перегляд у `npm run dev` не виконувався (у середовищі немає браузера).
- Рев'ю 3: з `TCopyChip` прибрано `:focus-visible` (є глобальний у base.css) і `vertical-align`; `color: inherit` лишено свідомо (інакше `button` бере системний колір тексту й у темній темі текст темний); `TCopyField` зберігає id таймера, `clearTimeout` перед новим і в `onBeforeUnmount`. `npm run check:fast` зелений (217 тестів), `check:size`: Full 188.1 / 195 kB, Styles 11.92 / 12 kB.
