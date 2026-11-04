# Крок 8 — тест (commit 4f1ea28)

**Вердикт: PASS**

## Перевірено
- `npm run check` — exit 0: eslint чистий, 30 файлів / 240 тестів, build, publint (лише давнє попередження `types` для `require`), attw 🟢, size-limit у межах (Core 5.77, Full 29.25, Styles 12.75 KB).
- `package.json`: `codemirror`, `@codemirror/{view,state,merge,theme-one-dark,lang-json,lang-markdown,lang-xml}` — `^6.0.0`, усі `optional` у `peerDependenciesMeta`. У `dist/index.{js,cjs}` CodeMirror лише через динамічний `import()` (`lang-xml` включно).
- Тести на нові пропи: `TCodeEditor.test.ts` (xml, `height="fill"`, `view` + `scrollToEnd`), `TDiffEditor.test.ts` (vertical, language + підписи, `readonlyOriginal`). README (optional peers), CHANGELOG — є.
- Playground (`npm run dev`, Chromium, світла й темна): XML-підсвітка в «Languages»; «Vertical, XML, side labels» — сторони одна над одною, підписи «Backup (read-only)» / «Current», у темній — oneDark. Помилок сторінки немає.
- `npm pack` → свіжий проєкт у /tmp: `npm i <tgz> vue @vueuse/core @iconify/vue` CodeMirror не тягне (optional). ESM і CJS головний вхід, `./icons`, `./markdown` імпортуються. Vite-збірка з `TCodeEditor`/`TDiffEditor` без CodeMirror проходить, але ці модулі стають заглушками `throw "Could not resolve @codemirror/… Is it installed?"`. Тож споживач, який використовує редактори, мусить сам поставити `codemirror @codemirror/view @codemirror/state @codemirror/theme-one-dark` + потрібну мову (`lang-json` / `lang-markdown` / `lang-xml`) і `@codemirror/merge` для `TDiffEditor` (як і написано в README). З ними в браузері: `height="fill"`, exposed `view` (EditorView), реальний `scrollToEnd()` доскролює до останнього рядка, vertical-diff з підписами — без помилок.

## Зауваги (не блокують)
- `./code-editor` у `exports` ще немає (з'являється в кроці 9) — імпорт дає `ERR_PACKAGE_PATH_NOT_EXPORTED`, очікувано.
- Давнє, не з цього кроку: головний вхід статично імпортує `vue-router` (optional peer) — без нього `import` пакета в Node падає `ERR_MODULE_NOT_FOUND`.
- Давнє: приклад «Read-only Diff» у playground виходить за правий край картки (довгі рядки); так само до 4f1ea28.
