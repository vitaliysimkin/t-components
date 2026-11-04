# Крок 1 — K12, K13, K15

## Що змінено
- K12 `src/components/TTextarea.vue`: `inheritAttrs: false`; `class`/`style` — на корінь, решта атрибутів (`id`, `aria-*`, `name`…) — на `<textarea>`. Тест `src/__tests__/TTextarea.test.ts`.
- K13 `TButtonGroup`: код не мінявся. Додано тест у `src/__tests__/TButtonGroup.test.ts`: у `<form>` з полем і групою немає кнопки за замовчуванням (`button[type=submit]` / без `type`), тож Enter у `<input>` не «натискає» сегмент. happy-dom не робить неявної відправки, тому тест перевіряє саму умову; контроль: з `type="submit"` тест падає.
- K15 `src/components/TDropdown.vue`: проп `card` (за замовчуванням `false`) — клас `is-card` на панелі: фон `--t-color-surface`, рамка `--t-color-border`, радіус `--t-radius-medium`, тінь `--t-shadow-3`. Тест `src/__tests__/TDropdown.test.ts`.
- `CHANGELOG.md` `[Unreleased]`: Added (`TDropdown card`), Fixed (`TTextarea`).

## Перевірки
- `npm run test -- TButtonGroup` — 5/5.
- `npm run check:fast` — lint чистий, 23 файли / 212 тестів зелені, build без помилок.
- Ручний перегляд у `npm run dev` не виконувався (немає браузера в середовищі).
- `package-lock.json` не синхронний з `package.json` (`npm ci` падає); залежності встановлено `npm install`, lock не змінено.
