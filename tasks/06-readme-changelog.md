# 06 — README + CHANGELOG.md

**Priority:** P2 (не блокує нічого, але дешево і корисно)
**Effort:** S (4-6 год)
**Impact:** M/L (точка входу для споживача)
**Depends on:** немає
**Conflicts with:** немає

## Контекст

Див. [../review.md — «Слабкі сторони #20»](../review.md#20-p3-недостатній-readme). Поточний [../README.md](../README.md) — лише інструкція релізу для автора. Немає installation snippet, немає згадки про CSS import, peer-deps, SSR, tree-shaking. За 7 релізів — ніякого CHANGELOG.

## Acceptance criteria

### README.md
Перепиши повністю (зберігаючи існуючу секцію «Публікація нової версії» як в кінці). Структура:

- [x] **Installation** — `npm i @vitaliysimkin/t-components` + peer-deps hint.
- [x] **Usage: global plugin** — приклад з `app.use(TComponents)`.
- [x] **Usage: tree-shaking** — приклад з named imports, пояснити trade-off.
- [x] **CSS import** — `import '@vitaliysimkin/t-components/style.css'` в точці входу.
- [x] **Theme** — приклад з `useTheme()` + пояснення `html.dark`/`html.light` класів. Короткий FOUC-hint: inline script у `<head>` для раннього застосування теми (див. [../review.md — можливості #8](../review.md#8-dark-mode-без-fouc)).
- [x] **TypeScript / Volar** — існуюча секція. Залишити як є.
- [x] **Peer dependencies** — чому `@iconify/vue` і `@vueuse/core` required, чому `vue-router` optional.
- [x] **SSR caveats** — наразі `useTheme`/`useNotifications`/`useModalManager` мають module-level state і читають `window`/`localStorage` під guard'ами. Явно: "повна SSR-підтримка наразі не гарантується".
- [x] **Live demo link** — вже є, лишити.
- [x] **Публікація нової версії** — існуюча секція, залишити.

### CHANGELOG.md (new)

- [x] Створено `CHANGELOG.md` у форматі [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
- [x] Реконструювати зміни з git-історії (останні 7 релізів: 0.1.0 → 0.7.0). Використовуй `git log --oneline` для рушія.
  - Для кожного релізу: Added / Changed / Fixed / Removed секції. Не треба бути вичерпним — «restoring history» достатньо: 2-4 bullets на реліз, тільки значущі зміни.
- [x] Unreleased секція зверху — порожня-готова для наступного PR.

## Out of scope

- changelog-automation (`changesets`, `semantic-release`) — окремо, якщо захочеш.
- Повноцінна документаційна сторінка (VitePress, Nuxt Content) — не тепер.
- Переклад README на англійську — лишай українською, як в оригіналі. Якщо хочеш додати англомовну версію як `README.en.md`, це окремий скоуп.

## Files to touch

- `README.md` (rewrite)
- `CHANGELOG.md` (new)

## First step

```bash
git log --oneline --reverse
```

…і пройтись по релізам, щоб зібрати історію. Для бачевого README почни з installation+usage — це 60% цінності.

## Важливо для агента

- Не видумуй changelog-записи, яких немає в git-історії. Якщо реліз був порожній (bump версії) — так і пиши: «0.3.1 — internal / no user-facing changes».
- Не додавай badges (npm version, downloads) автоматично, якщо не впевнений у точному shield.io URL.

## Suggested PR title

`docs: rewrite README and add CHANGELOG`

## Зроблено

- Повністю переписав `README.md`: додав секції Installation (з peer-deps hint), Usage (global plugin + named imports з trade-off note), CSS import, Theme (`useTheme` + FOUC inline-script приклад), Peer dependencies explainer (обов'язкові vs optional), SSR caveats (явно згадав module-level state у `useTheme`/`useNotifications`/`modalManager`). Зберіг наявні секції «TypeScript / Volar» та «Публікація нової версії» майже дослівно (лишив їх внизу, як вимагалось).
- Додав короткий перелік компонентів, розбитий на групи (форми / навігація / оверлеї), із посиланням на playground.
- Створив `CHANGELOG.md` у форматі Keep a Changelog з історією 0.1.0 → 0.7.0, відновленою по git-логу (`git log --oneline --reverse`). Для кожного релізу — 2-4 bullets у секціях Added / Changed / Fixed / Removed (лише ті, що реально є в git). Додав порожню `## [Unreleased]` секцію зверху.
- Не ставив `badges` і не чіпав dist/CI — out of scope задачі.
- `npm run typecheck` і `npm run build:nocheck` — обидва пройшли (зміни docs-only).

### Follow-ups (не в цьому скоупі)
- Автоматизація changelog (`changesets`/`semantic-release`) — див. out-of-scope в цій задачі.
- Англомовний `README.en.md` — окремий task якщо знадобиться.
- Додати дати релізів коли будуть точні — наразі проставив умовні роки (2024/2025) без конкретних днів, бо git-log не поруч із npm publish timestamps.
