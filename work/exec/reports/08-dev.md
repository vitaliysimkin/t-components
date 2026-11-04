# Крок 8 — K10 + K11: `TCodeEditor` і `TDiffEditor`

## Що змінено
- `src/components/code-language.ts` — спільне динамічне завантаження мови (`json` / `markdown` / `xml` / `text`); `@codemirror/lang-xml` — у devDependencies.
- `TCodeEditor`: `language: 'xml'`; `height="fill"` — корінь і контейнер на всю висоту батька (flex, `min-height: 0`, прокрутка всередині CodeMirror); `defineExpose({ view, scrollToEnd })` (`view` — `shallowRef` з `EditorView`).
- `TDiffEditor`: пропи `language`, `orientation` (`vertical` — сторони одна над одною через CSS `.cm-mergeViewEditors`), `readonlyOriginal` (за замовчуванням `true`, як було; `false` → подія `update:original`), `originalLabel` / `modifiedLabel` (панель CodeMirror над стороною; без підпису нічого не показується, вигляд за замовчуванням не змінився). Старі пропи без змін.
- `package.json`: `codemirror`, `@codemirror/{view,state,merge,theme-one-dark,lang-json,lang-markdown,lang-xml}` — optional `peerDependencies` (`^6.0.0`).
- Тести: новий `src/__tests__/TCodeEditor.test.ts` (xml, `height="fill"`, `view` + `scrollToEnd`), у `TDiffEditor.test.ts` — vertical, language + підписи, `readonlyOriginal`.
- Playground: XML у «Languages» `TCodeEditor`; новий приклад `diff-editor/VerticalDiffEditorExample.vue` (vertical, XML, підписи). README (абзац про optional peers CodeMirror), CHANGELOG Added.

## Перевірки
- `npm run check` — lint чистий, 30 файлів / 240 тестів зелені, build, publint (лише давнє попередження про `types` для `require`), attw 🟢, size-limit у межах.
- size-limit: Core 5.77 / 180 KB (було 159.5), Full 29.25 / 205 KB (було 190.39), Icons 18.49, Markdown 1.55, Styles 12.75 / 15 KB (було 12.68). Падіння JS — бо size-limit не рахує peer-залежності: раніше `@codemirror/*` (їх не було в `ignore`) входили в замір. Ліміти тепер із великим запасом — переглянути окремо, не в цьому кроці.
- `dist/index.js` — CodeMirror лише як `import("@codemirror/…")`, `lang-xml` включно.
- `npm run dev` + Playwright/Chromium, світла й темна: XML-підсвітка в `TCodeEditor`, вертикальне порівняння з підписами «Backup (read-only)» / «Current»; помилок сторінки немає (лише недоступні мережеві іконки iconify).
