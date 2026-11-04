# Крок 2 — K14, фокус у `TModalBox`

## Що змінено
- `src/components/modal/TModalBox.vue`: елемент, що був у фокусі, запам'ятовується під час створення; після монтування (`nextTick`) фокус іде на перше активне `input`/`textarea`/`select` вмісту, інакше на першу активну кнопку вмісту, інакше на саме вікно (`tabindex="-1"`); `onBeforeUnmount` повертає фокус на цей елемент.
- Тест у `src/__tests__/useModalManager.test.ts`: поле в фокусі (хоча кнопка стоїть перед ним); після закриття фокус повертається на кнопку-ініціатор. `VisualViewport` підмінено через stub (happy-dom його не має, а `useDragger` до нього звертається).
- `CHANGELOG.md` `[Unreleased]` → Fixed.

## Перевірки
- `npm run test -- useModalManager useDialog` — 21/21.
- `npm run check:fast` — lint чистий, 23 файли / 213 тестів зелені, build без помилок.
- Ручний перегляд у `npm run dev` не виконувався (у середовищі немає браузера).
