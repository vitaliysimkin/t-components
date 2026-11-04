# Крок 2 — тест (K14, фокус у `TModalBox`)

**Вердикт: PASS**

- `npm run test -- useModalManager useDialog` — 2 файли, 21/21 зелені (є тест: поле в фокусі → після закриття фокус на ініціаторі).
- `npm run check:fast` — lint чистий, 23 файли / 213 тестів, build без помилок.
- Playwright + Chromium на `npm run dev`:
  - `/components/dialog`, prompt (обидва) → фокус на `input` у вікні; Esc / «Скасувати» → фокус на кнопці-ініціаторі.
  - confirm ×3, alert ×3 (лише кнопки) → фокус на першу кнопку вікна; Esc → фокус на ініціаторі.
  - `/components/modal`, «Open Modal» → фокус на поле (хоча кнопки поруч); закриття хрестиком → фокус на «Open Modal».
- CHANGELOG `[Unreleased]` → Fixed: рядок є. Межі дотримано (drag/resize, ESC, `useModalManager` не змінено).

## Повторно: PASS

`npm run check:fast` (після 1dbbeb6): eslint чистий (0 warnings), 23 файли / 213 тестів зелені, vue-tsc та build без помилок, exit 0.
