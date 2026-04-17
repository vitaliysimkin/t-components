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

- [ ] Створено `eslint.config.js` у корені (flat config, Vue 3.5+ style).
- [ ] Підключено `@vue/eslint-config-typescript` + `eslint-plugin-vue` (recommended + vue/recommended).
- [ ] Правило `no-console: ['error', { allow: ['warn', 'error'] }]` — `console.log` забороняє, `console.warn/error` дозволяє.
- [ ] Додано npm-скрипт `"lint": "eslint ."` та `"lint:fix": "eslint . --fix"`.
- [ ] Прибрано `console.log('ESC key pressed', event)` з [TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189).
- [ ] `npm run lint` проходить без помилок.
- [ ] `npm run typecheck` і `npm run build:nocheck` проходять після змін.
- [ ] Додано крок `run: npm run lint` у [.github/workflows/release.yml](../.github/workflows/release.yml) перед build'ом (або окремий `lint.yml` на PR).

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
