# t-components

## TypeScript / Volar support

Підказки по `T*`-компонентах у `.vue`-шаблонах споживача (autocomplete тегів, типи `props`/`emits`, `Ctrl+Click` до визначення) працюють із коробки після встановлення пакета й підключення плагіна в `main.ts` — без додаткових `shims.d.ts` та без імпортів типів. Якщо у VSCode підказки не з'явились після оновлення версії — `Vue: Restart Vue Server` через Command Palette.

## Публікація нової версії

Налаштовано через GitHub Actions — публікація відбувається автоматично при пуші git-тегу `v*`.

### Реліз однією командою

```bash
npm run release:patch   # 0.2.0 → 0.2.1
npm run release:minor   # 0.2.0 → 0.3.0
npm run release:major   # 0.2.0 → 1.0.0
```

Команда: піднімає версію в `package.json`, створює комміт + git-тег, пушить комміт і тег на GitHub. Далі workflow [.github/workflows/release.yml](.github/workflows/release.yml) збере пакет і опублікує його в npm.

### Одноразове налаштування (вже зроблено)

Публікація використовує **npm Trusted Publishing (OIDC)** — токен не потрібен. Довіра налаштована на npmjs.com: *Package → Settings → Publishing access → Trusted Publisher* (GitHub Actions, repo `vitaliysimkin/t-components`, workflow `release.yml`).

Після цього достатньо `npm run release:patch` — все інше зробить CI, включно з npm provenance.
