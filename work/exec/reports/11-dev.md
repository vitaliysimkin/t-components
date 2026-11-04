# Крок 11 — патч 1.5.1 (issue 03)

- `vue-router`: статичний імпорт був у `TSidebar.vue` / `TBottomNav.vue` (`useRoute`, `RouterLink`). Тепер `$route` через `getCurrentInstance()` (лише `import type`), `RouterLink` резолвиться глобально (реєструє роутер). `dist/index.{js,cjs}` без `vue-router`; для користувачів роутера поведінка та сама.
- NodeNext: у `.d.ts` відносні імпорти були без розширень. `vite.config.ts` (`beforeWriteFile`) дописує `.js` (`./X.vue` → `./X.vue.js` → `X.vue.d.ts`). У `.attw.json` прибрано ігнор `internal-resolution-error`, щоб `check:types` це ловив.
- CHANGELOG: `## [1.5.1]` Fixed. Версію не піднято, тег не створено.
- Перевірки: lint, test (245/245), build:nocheck, check:pack, check:types, check:size — ок. `npm pack` → `/tmp/tc-nn` без `vue-router`: Node ESM import головного входу і `./markdown`, `./code-editor`, `./icons` — ок; `tsc --noEmit` (NodeNext, strict, skipLibCheck false) — 0 помилок, типи не `any` (контрольна помилка на `const x: number = TButton`).
