# Крок 6 — K05 `TMarkdown`, частина `./markdown`

## Що змінено
- `src/markdown/markdown.ts` — парсер із `B/lib/markdown.ts` без змін синтаксису (коментарі англійською, `!` під `noUncheckedIndexedAccess`, клас таблиці `t-markdown__table`); назовні лише `renderMarkdown`.
- `src/markdown/TMarkdown.vue` (проп `source`, `v-html`), `src/markdown/index.ts` (`TMarkdown`, `renderMarkdown`). Не в `componentRegistry`.
- `src/styles/markdown.css` (імпорт у `index.css`) — `.t-markdown` зі спільних правил трьох копій Bombadil на токенах; шрифт `code`/`pre` дає `base.css`; додано лише колір посилань `--t-color-accent` (у темній темі стандартний синій погано видно).
- `vite.config.ts` — entry `markdown`, виключення `markdown/index.d.ts` з `/// <reference …>`; `package.json` — `exports["./markdown"]`; `.size-limit.json` — «Markdown (opt-in)», 2 KB (виміряно 1.55 KB + ~20 %, рішення 02).
- `src/__tests__/markdown.test.ts` — XSS (`<script>`, `javascript:`), таблиця, вкладені списки, код, компонент.
- Playground: приклад «TMarkdown» (+ alias `@vitaliysimkin/t-components/markdown` у `playground/vite.config.ts`). README — абзац «Markdown» і рядок у переліку; CHANGELOG — Added.

## Перевірки
- `npm run check` — зелено: lint чистий, 28 файлів / 229 тестів, build, publint (лише давнє попередження про `"."`), attw — `./markdown` 🟢 скрізь, size: Markdown 1.55/2 KB, Styles 12.26/15 KB, Full 188.59/205 KB.
- `npm run dev` + Playwright/Chromium, світла й темна: усі блоки рендеряться, `<script>` показано текстом (елементів `script` 0), помилок сторінки немає.
