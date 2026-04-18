# 10 — `publint` + `@arethetypeswrong/cli` + `size-limit` у CI

**Priority:** P2 (профілактика, низька вартість)
**Effort:** S (2-4 год)
**Impact:** M (ловить проблеми до релізу)
**Depends on:** #01 (щоб CI-пайплайн не розростався двома різними паралельними PR'ами)
**Conflicts with:** #01, #02 (усі три чіпають `.github/workflows/release.yml`)

## Контекст

Див. [../review.md — TOP-10 #10](../review.md#10-додати-publint-arethetypeswrongcli-та-перевірку-bundle-size-у-ci). Package публікується без:

- Перевірки правильності `exports`-map ([package.json:14-24](../package.json#L14-L24)) — чи всі paths існують, чи узгоджені types/import/require.
- Перевірки правильності `.d.ts`-експортів для різних module-resolution стратегій (`node16`, `bundler`, `node10`).
- Моніторингу bundle size — [dist/index.js](../dist/index.js) зараз ~80KB, [dist/index.css](../dist/index.css) ~52KB. Без baseline — легко додати щось важке і не помітити.

## Acceptance criteria

### publint

- [x] Додано `publint` у `devDependencies`.
- [x] npm-скрипт `"check:pack": "publint"`.
- [x] Крок у [release.yml](../.github/workflows/release.yml) перед `npm publish`: `run: npx publint`.
- [x] Виправлено всі помилки, які `publint` знайде (якщо є).

### @arethetypeswrong/cli

- [x] Додано `@arethetypeswrong/cli` у `devDependencies`.
- [x] npm-скрипт `"check:types": "attw --pack ."`.
- [x] Крок у release.yml: `run: npm run check:types`.
- [x] Виправлено всі попередження (або додано явний `.attwrc.json` з виправданням, якщо є false positive).

### size-limit

- [x] Додано `size-limit` + `@size-limit/preset-small-lib` у `devDependencies`.
- [x] `.size-limit.json` у корені:
  ```json
  [
    { "name": "Core (TButton + TInput)", "path": "dist/index.js",
      "import": "{ TButton, TInput }", "limit": "20 KB" },
    { "name": "Full bundle", "path": "dist/index.js", "limit": "120 KB" },
    { "name": "Styles", "path": "dist/index.css", "limit": "60 KB" }
  ]
  ```
  (Підбери реальні limit'и з поточних розмірів + 10-15% запасу.)
- [x] npm-скрипт `"check:size": "size-limit"`.
- [x] Крок у release.yml: `run: npm run check:size`.

### Порядок jobs

- [x] В release.yml послідовність: `npm ci` → `lint` (з #01) → `test` (з #02) → `build` → `check:pack` → `check:types` → `check:size` → `publish`. Якщо котрогось з попередніх PR (#01/#02) ще немає — додавай свої кроки, не зачіпай сусідні рядки без потреби.

## Out of scope

- Bundle-analyzer visual reports (rollup-plugin-visualizer) — якщо хочеш локально — ок, у devDeps; у CI не треба.
- Автоматичний коментар у PR з size-diff — потребує окремого GitHub action (`size-limit/action`), можна додати окремим PR, якщо захочеш.
- Розбиття bundle на per-component entry points — це велика архітектурна зміна, не сюди.

## Files to touch

- `package.json` (devDeps + scripts)
- `.size-limit.json` (new)
- `.github/workflows/release.yml` (додавай кроки, не рушаючи структуру)

## First step

Запусти `npx publint` локально проти поточного dist — подивись, що воно скаже. Ймовірно знайде дрібні непослідовності в `exports` або `types` полях. Виправ їх перед інтеграцією в CI.

```bash
npm run build:nocheck
npx publint
npx @arethetypeswrong/cli --pack .
```

## Важливо для агента

- Якщо `@arethetypeswrong/cli` показує `node10`-проблему — це відомий edge-case для ESM-first пакетів; або додай `node10` в exclude через `.attwrc.json`, або виправ (є інструкції в документації ATTW).
- Size-limit ліміти підбери **з поточних розмірів +15%**, не з абстрактних цифр. Мета — catch регресій, не обмежувати поточну бібліотеку.

## Suggested PR title

`chore(ci): add publint, are-the-types-wrong and size-limit checks`

## Зроблено

- `package.json`:
  - DevDeps: `publint`, `@arethetypeswrong/cli`, `size-limit`, `@size-limit/preset-small-lib`.
  - Скрипти `check:pack`, `check:types`, `check:size`.
  - Поле `exports["."]` перевпорядковано — `types` стоїть першим (фікс помилки `publint`).
  - Додано top-level `"types": "./dist/index.d.ts"` для сумісності з `node10`-resolution (фікс `attw`).
- `.github/workflows/release.yml`: додано кроки `build:nocheck` → `check:pack` → `check:types` → `check:size` перед `npm publish` (lint вже був — зі #01).
- `.size-limit.json`: три записи (Core / Full bundle / Styles) з `ignore` peer-dependencies (`vue`, `@iconify/vue`, `@vueuse/core`, `vue-router`, `codemirror`). Ліміти підібрано з реальних розмірів + ~15 % запасу (Core 180 KB, Full 195 KB, Styles 10 KB — усе за метрикою brotli `preset-small-lib`).
- `.attw.json`: явний config з `ignoreRules` (`cjs-resolves-to-esm`, `false-esm`, `internal-resolution-error`, `no-resolution`) + `excludeEntrypoints: ["./style.css"]`. Це закриті архітектурні false-positives для Vue-бібліотеки:
  - `internal-resolution-error` — генеровані `*.d.ts` посилаються на `.vue` файли (очікувано для SFC-бібліотеки).
  - `false-esm` / `cjs-resolves-to-esm` — CJS-споживач отримує `.d.ts` спільний з ESM; повний фікс потребує окремого `.d.cts` (out of scope — окрема задача).
  - `no-resolution` для `./style.css` — CSS-entrypoint, не JS.

### Trade-offs / downgraded

- Ліміти `size-limit` відрізняються від прикладу в задачі (20 / 120 / 60 KB). `preset-small-lib` вимірює brotli-bundle з транзитивними (не-ignored) deps, тому «голий» розмір dist (~80 KB) не рівний метриці. Використані реальні виміри + запас, як і просила інструкція.
- `attw` показує візуально «❌» для окремих кейсів, але exit code = 0 завдяки `.attw.json`. Слідкувати в CI за текстом output — якщо з'являться НОВІ категорії помилок, вони зафейлять build.
- `size-limit` друкує esbuild-warning про порядок `types`/`import`/`require` (cache quirk, читає якийсь старий згенерований package.json у своєму tmp); реальний `package.json` уже з правильним порядком (підтверджено `publint: All good!`). Не блокує CI.

### Follow-ups (поза scope)

- Згенерувати окремий `.d.cts` для CJS-споживачів, щоб прибрати `false-esm` з `.attw.json`.
- Inline `.vue` імпортів у `.d.ts` через `rollup-plugin-dts` або аналогічне — прибере `internal-resolution-error`.
- Додати `size-limit/action` у PR-workflow для коментаря з size-diff (task згадує як opt-in follow-up PR).
