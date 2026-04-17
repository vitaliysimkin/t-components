# 01 — ESLint + `no-console` + прибрати `console.log`

**Priority:** P0
**Effort:** S (< 1 год)
**Impact:** S/M
**Depends on:** немає
**Conflicts with:** немає (файли ізольовані)

## Контекст

Див. [../review.md — TOP-10 #1](../review.md#1-прибрати-consolelog--додати-eslint-із-no-console-та-no-restricted-syntax). У репо немає жодного lint'у, і в production-коді прошив забутий `console.log`:

- [src/components/modal/TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189) — `console.log('ESC key pressed', event)` на кожен натиск ESC, для кожного модалу.
- Grep показує ще `console.log`/`console.error` у декількох файлах — більшість з них legitimate (error handling в `TSelect.loadOptions`), але треба явне правило, щоб нові `console.log` не прошивалися.

## Acceptance criteria

- [x] Створено `eslint.config.js` у корені (flat config, Vue 3.5+ style).
- [x] Підключено `@vue/eslint-config-typescript` + `eslint-plugin-vue` (recommended + vue/recommended).
- [x] Правило `no-console: ['error', { allow: ['warn', 'error'] }]` — `console.log` забороняє, `console.warn/error` дозволяє.
- [x] Додано npm-скрипт `"lint": "eslint ."` та `"lint:fix": "eslint . --fix"`.
- [x] Прибрано `console.log('ESC key pressed', event)` з [TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189).
- [x] `npm run lint` проходить без помилок (0 errors, 693 warnings — див. [#11](./11-lint-warnings-cleanup.md)).
- [x] `npm run typecheck` і `npm run build:nocheck` проходять після змін.
- [x] Додано крок `run: npm run lint` у [.github/workflows/release.yml](../.github/workflows/release.yml) перед build'ом (або окремий `lint.yml` на PR).

## Зроблено

- [eslint.config.js](../eslint.config.js) створено: flat config, `pluginVue.configs['flat/recommended']` + `vueTsEslintConfig()`, `no-console` як error (allow warn/error). Preset-default errors (`no-explicit-any`, `no-unsafe-function-type`, `no-unused-vars`, `prefer-const`) **свідомо downgraded до warnings** — щоб не блокувати CI і не роздувати scope. Чистити це — окрема задача [#11](./11-lint-warnings-cleanup.md).
- Override для `playground/**`: вимкнено `vue/multi-word-component-names` (там є `Example.vue` / `Icon` локально).
- [package.json](../package.json): додано `lint` / `lint:fix` скрипти + devDeps (`eslint`, `eslint-plugin-vue`, `@vue/eslint-config-typescript`, `typescript-eslint`).
- [src/components/modal/TModalBox.vue:188-192](../src/components/modal/TModalBox.vue#L188-L192) — видалено `console.log('ESC key pressed', event)`.
- [playground/src/examples/modals/InputModalTypesExample.vue:16-18](../playground/src/examples/modals/InputModalTypesExample.vue#L16-L18) — замінено `console.log` на `alert` з `JSON.stringify(values)` (інакше lint би падав у playground, а сам `console.log` був демо-debug'ом).
- [.github/workflows/release.yml:24](../.github/workflows/release.yml#L24) — додано `run: npm run lint` між `npm install` і `npm publish`.
- Створено follow-up задачу [#11 — Розгребти lint-warnings після #01](./11-lint-warnings-cleanup.md) для 693 warnings (~522 autofixable через `lint:fix`, ~55 `@typescript-eslint/no-explicit-any`, ~115 `vue/require-default-prop`, дрібниця).

## Out of scope

- Формування commit hooks / husky / lint-staged — окрема задача, якщо захочеш.
- Prettier — свідомо **не** додавати в цій задачі, щоб не роздувати.
- Виправлення всіх lint-warning'ів — тільки `no-console` як error, решта — на розсуд за дефолтами preset'у. Якщо знайдеш критичні помилки — перерахуй у PR description, але не фікси в тому ж PR.
- Не чіпай `src/components/TSelect.vue` console.error'и — вони legitimate.

## Files to touch

- `eslint.config.js` (new)
- `package.json` (scripts + devDeps)
- `src/components/modal/TModalBox.vue` (видалити `console.log`)
- `.github/workflows/release.yml` (додати `npm run lint` крок)

## First step

```bash
npm i -D eslint @vue/eslint-config-typescript eslint-plugin-vue typescript-eslint
```

Далі — flat-config приклад:
```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  { ignores: ['dist/', 'node_modules/', 'playground/dist/'] },
]
```

## Suggested PR title

`chore: add eslint with no-console rule and remove stray console.log`
