# Крок 6 — тест (K05 `TMarkdown`, `./markdown`)

**Вердикт: PASS**

## Що перевірено
- `npm run check` (commit 18cd3b5) — exit 0: eslint чистий, 28 файлів / 229 тестів, build, publint (без нових попереджень), attw — `./markdown` 🟢 (node10, node16 CJS/ESM, bundler), size: Markdown 1.55/2 KB, Styles 12.26/15 KB, Full 188.59/205 KB.
- Пакет із `npm pack` встановлено в окремий проєкт поза репо:
  - ESM `import { TMarkdown, renderMarkdown } from '@vitaliysimkin/t-components/markdown'` і CJS `require(...)` працюють; SSR `TMarkdown` → `<div class="t-markdown">…`.
  - `<script>` і `[x](javascript:…)` виходять текстом; таблиця (вирівнювання), вкладений список, ```-код екрановано.
  - `dist/markdown.js` імпортує лише `vue`; у `dist/markdown/index.d.ts` немає `/// <reference …globalComponents.d.ts>`; tsc (`moduleResolution: bundler`) типи бачить коректно.
- Не в `componentRegistry`/основному `index`; стиль `.t-markdown` у `src/styles/markdown.css`, імпортований у `index.css`; README (розділ «Markdown») і CHANGELOG (Added) є; тести парсера покривають XSS, таблицю, списки, код, компонент.
- `npm run dev` + Playwright/Chromium, `/components/markdown`, світла й темна (`html.light`/`html.dark`): усі блоки рендеряться, `script`-елементів 0, alert не спрацював, page errors немає; токени розв’язуються, кольори посилань/фонів/рамок змінюються з темою, контраст нормальний (скріншоти переглянуто). Консольні помилки — лише ERR_TUNNEL_CONNECTION_FAILED на зовнішніх ресурсах (мережа пісочниці).

## Зауваження (не блокують)
- `moduleResolution: node16/nodenext`: типи `./markdown` зводяться до `any` (безрозширенні відносні імпорти в .d.ts) — та сама давня поведінка, що й у кореневої точки входу; attw це ігнорує правилом `internal-resolution-error`.
- `SAFE_URL` пропускає `//host` (протокол-відносне зовнішнє посилання) як «`/…`» — відповідає плану й Bombadil.
