# t-components

## TypeScript / Volar support

Підказки по `T*`-компонентах у `.vue`-шаблонах споживача (autocomplete тегів, типи `props`/`emits`, `Ctrl+Click` до визначення) працюють із коробки після встановлення пакета й підключення плагіна в `main.ts` — без додаткових `shims.d.ts` та без імпортів типів. Якщо у VSCode підказки не з'явились після оновлення версії — `Vue: Restart Vue Server` через Command Palette.

## Публікація нової версії в npm

1. Переконайся, що робоче дерево чисте: `git status`.
2. Підняти версію в [package.json](package.json) або через:
   ```bash
   npm version patch   # 0.2.0 → 0.2.1
   npm version minor   # 0.2.0 → 0.3.0
   npm version major   # 0.2.0 → 1.0.0
   ```
   (команда створить комміт і git-тег).
3. (Опційно) перевірити вміст пакета:
   ```bash
   npm publish --dry-run
   ```
4. Залогінитись у npm (один раз):
   ```bash
   npm login
   ```
5. Опублікувати (білд запускається автоматично через `prepare`-скрипт):
   ```bash
   npm publish --access public --otp=<код-з-authenticator>
   ```
   Прапор `--access public` обов'язковий для scoped-пакетів. `--otp` потрібен, якщо ввімкнено 2FA.
6. Запушити комміт і тег:
   ```bash
   git push && git push --tags
   ```
