# Крок 9 — тест (1299cc6)

**Вердикт: PASS**

## Що перевірено
- `npm run check` — зелено (lint, тести включно з `logView.test.ts`: log4net, NLog `[WARN]`, продовження, «лише збіги», regex/ціле слово/помилка; build, publint, attw, size: Code editor 7.74/10 KB).
- `dist/code-editor.js`: `@codemirror` — 2 входження, обидва статичні `import` (`state`, `view`); CodeMirror не вбудовано. Спільний чанк вантажить CodeMirror лише через `import()`.
- `exports["./code-editor"]`, entry у `vite.config.ts`, виключення `code-editor/index.d.ts`, `.size-limit.json`, README, CHANGELOG (Added), playground «TLogView» — на місці.
- `npm pack` → чистий проєкт: ESM-імпорт `.`, `./markdown`, `./code-editor` працює (`./code-editor` → `TLogView`; `./markdown` → `TMarkdown`, `renderMarkdown`); `tsc` (moduleResolution Bundler, strict, без skipLibCheck) — типи `TLogView`, `TLogViewProps`, `TLogFormat` резолвляться, невалідний `format` відхиляється.
- Playwright/Chromium, `npm run dev`, світла й темна: підсвічено час/потік/рівень (ERROR/WARN/INFO різні кольори)/логер/метод/рядки-продовження; у темній — фон one-dark і світліші кольори токенів. Ctrl+F у редакторі фокусує поле; «error» → 12 збігів (з верху — «1 of 12»), Enter/Shift+Enter перемикають; Aa → «No matches»; regex `ERROR|WARN` → 32; невалідний `(` → повідомлення під полем; ціле слово `Supervis` → 0, `Supervisor` → 180; «лише рядки зі збігами» → 12 рядків, зняття → повний текст; введення в редактор не змінює текст. Помилок сторінки немає (лише мережеві помилки Iconify CDN — середовище).

## Зауваження (не блокують)
- Поточний збіг відрізняється від решти лише обведенням: `--t-color-warning-plain-bg` і `--t-color-tag-yellow-bg` дають однаковий фон.
- Давнє, не з цього кроку: `import '@vitaliysimkin/t-components'` у Node падає без `vue-router` (optional peer); під `moduleResolution: NodeNext` типи всіх точок входу не резолвляться (`.vue`-шляхи без розширень) — так само для `.`/`./markdown`.
