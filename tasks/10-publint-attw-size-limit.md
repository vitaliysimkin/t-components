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

- [ ] Додано `publint` у `devDependencies`.
- [ ] npm-скрипт `"check:pack": "publint"`.
- [ ] Крок у [release.yml](../.github/workflows/release.yml) перед `npm publish`: `run: npx publint`.
- [ ] Виправлено всі помилки, які `publint` знайде (якщо є).

### @arethetypeswrong/cli

- [ ] Додано `@arethetypeswrong/cli` у `devDependencies`.
- [ ] npm-скрипт `"check:types": "attw --pack ."`.
- [ ] Крок у release.yml: `run: npm run check:types`.
- [ ] Виправлено всі попередження (або додано явний `.attwrc.json` з виправданням, якщо є false positive).

### size-limit

- [ ] Додано `size-limit` + `@size-limit/preset-small-lib` у `devDependencies`.
- [ ] `.size-limit.json` у корені:
  ```json
  [
    { "name": "Core (TButton + TInput)", "path": "dist/index.js",
      "import": "{ TButton, TInput }", "limit": "20 KB" },
    { "name": "Full bundle", "path": "dist/index.js", "limit": "120 KB" },
    { "name": "Styles", "path": "dist/index.css", "limit": "60 KB" }
  ]
  ```
  (Підбери реальні limit'и з поточних розмірів + 10-15% запасу.)
- [ ] npm-скрипт `"check:size": "size-limit"`.
- [ ] Крок у release.yml: `run: npm run check:size`.

### Порядок jobs

- [ ] В release.yml послідовність: `npm ci` → `lint` (з #01) → `test` (з #02) → `build` → `check:pack` → `check:types` → `check:size` → `publish`. Якщо котрогось з попередніх PR (#01/#02) ще немає — додавай свої кроки, не зачіпай сусідні рядки без потреби.

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
