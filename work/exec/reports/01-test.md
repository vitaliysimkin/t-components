# Крок 1 — тест

**Вердикт: PASS**

- `npm run test -- TButtonGroup` — 5/5 зелені.
- `npm run check:fast` — exit 0: eslint чистий, 23 файли / 212 тестів, build без помилок.
- K12: `TTextarea` — `inheritAttrs: false`, `id`/`aria-*` на `<textarea>`, `class`/`style` на корені; тест це перевіряє (і що на корені немає `id`).
- K13: код не мінявся, додано тест «у формі немає кнопки за замовчуванням» (happy-dom не робить неявної відправки — перевірка умови, прийнятно).
- K15: проп `card` (default `false`), клас `is-card` на самій панелі; у `dist/index.css` є `.t-dropdown-panel.is-card[data-v-…]` з `--t-color-surface`, `--t-color-border`, `--t-radius-medium`, `--t-shadow-3` (токени існують). Тінь на елементі з `overflow:auto` не обрізається його власним overflow — збігається з `dropdownPanelStyle` Bombadil.
- CHANGELOG `[Unreleased]`: Added (TDropdown card), Fixed (TTextarea).

Зауваження (не блокують): візуальний перегляд у браузері (світла/темна теми) не робився; `package-lock.json` не синхронний з `package.json` (`npm ci` падає) — успадкована проблема, не з цього кроку.
