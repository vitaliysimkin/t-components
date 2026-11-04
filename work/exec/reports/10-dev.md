# Крок 10 — випуск

- Версія: 1.5.0 (`npm version minor`), коміти `docs(changelog): 1.5.0`, `1.5.0`; main запушено.
- Тег `v1.5.0` створено локально; push тегу відхилено проксі сесії (HTTP 403), тож Release workflow не запущено. Потрібно: `git push origin v1.5.0` з машини з доступом.
- Issue 01 (lockfile): `package-lock.json` уже синхронізовано (з 4f1ea28); `npm install` змін не дає, `npm ci` у чистій копії проходить.
- Перевірки як у release.yml: lint, test (245/245), build:nocheck, check:pack, check:types, check:size (6/6 у лімітах) — усі пройшли.
