# Крок 9 — K08 `TLogView`, частина `./code-editor`

## Що змінено
- `src/code-editor/logView.ts` — розширення CodeMirror з `B/lib/logView.ts`: підсвітка записів log4net / NLog (лише видимі рядки), позначки збігів, Ctrl+F; чисті функції `buildSearchRegExp`, `findMatches`, `filterMatchingLines`, `parseLogLine`. Коментарі англійською; `onView` прибрано — `view` дає `TCodeEditor` через `defineExpose`.
- `src/code-editor/TLogView.vue` — загальна частина `LogFileViewer.vue`: `TCodeEditor` лише для читання + панель пошуку (регістр, regex, ціле слово, ↑/↓, Enter / Shift+Enter, «N of M», «лише рядки зі збігами», debounce 200 мс). Пропи `text`, `format` (`auto`/`log4net`/`nlog`/`none` замість селектора), `height` (або `fill`), тексти панелі англійською за замовчуванням. Повідомлення про невалідний regex — текст помилки рушія (без окремого пропа, бо він уже містить «Invalid regular expression»). Стилі `lx-*` scoped на токенах.
- `src/code-editor/index.ts` — `TLogView`, типи `TLogViewProps`, `TLogFormat`. Не в `componentRegistry`.
- `vite.config.ts` (entry `code-editor`, виключення `code-editor/index.d.ts`), `package.json` `exports["./code-editor"]`, `.size-limit.json` «Code editor (opt-in)» 10 KB (виміряно 7.78 KB + ~20 %, рішення 02), alias у `playground/vite.config.ts`.
- `@codemirror/search` не додано: бібліотека його не імпортує (пошук власний, як у Bombadil); `@codemirror/state` / `view` уже optional peers.
- Тест `src/__tests__/logView.test.ts` — розбір log4net і NLog (`[WARN]`), рядок-продовження, «лише збіги», regex/ціле слово/помилка.
- Playground «TLogView», README (абзац «Code editor», перелік), CHANGELOG Added.

## Перевірки
- `npm run check` — зелено: lint, 31 файл / 245 тестів, build, publint (лише давнє попередження), attw `./code-editor` 🟢, size: Code editor 7.74/10 KB, Styles 13.06/15 KB, Full 29.36/36 KB.
- `dist/code-editor.js` — `@codemirror` лише в двох `import` (`state`, `view`); спільні компоненти — у спільному чанку з `index.js`.
- `npm run dev` + Playwright/Chromium, світла й темна: рівні/логер/метод/рядки-продовження підсвічені, Ctrl+F в редакторі фокусує пошук, «error» → 12 збігів, Enter перемикає поточний, «лише рядки зі збігами» → 12 рядків, невалідний regex показано під полем; помилок сторінки немає.
