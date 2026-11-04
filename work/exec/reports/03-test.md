# Крок 3 — тест (K01 `TCopyField` + K02 `TCopyChip`, коміт 1ba0c9e)

**Вердикт: PASS**

## Команди
- `npm run check:fast` — exit 0: lint чистий, 25 файлів / 217 тестів зелені, build ок.
- `npm run check:size` — у межах: Core 159.31/180 kB, Full bundle 187.92/195 kB, Icons 18.35/30 kB, Styles 11.94/12 kB (запас 0,06 kB — див. `work/exec/issues/02-size-limit.md`).

## «Готово, коли»
- Тести з моком `navigator.clipboard`: `copy` зі значенням, `copy-error` при відмові (fallback `execCommand` → false), «скопійовано» спадає через 1,5 с — є, зелені.
- Playground `/components/copy-field`, `/components/copy-chip`; README (перелік «Форми»), CHANGELOG `[Unreleased]` Added; реєстрація в `registry.ts`, `index.ts` (+типи), `globalComponents.ts`; `ticon:copy`, `ticon:check` у `ticon-set.ts`.

## Ручна перевірка (Playwright/Chromium, `npm run dev`, світла й темна теми)
- `TCopyField`: input `readonly`, моноширинний; клік → у буфері `/var/lib/app/data`, кнопка «Copied» (success, `ticon:check`), через ~1,6 с знову «Copy». Обидві теми читаються коректно.
- `TCopyChip`: обидва чіпи рендеряться (`value` і `label`), клік копіює `value`; hover підсвічує іконку акцентом; рамки/фон за токенами в обох темах.
- Помилок сторінки немає; консольні `ERR_TUNNEL_CONNECTION_FAILED` — завантаження іконок навігації playground з мережі (середовище), не стосується кроку.

## Зауваження (не блокують)
- `TCopyField`: таймер 1,5 с не скидається при повторному кліку і не чиститься при unmount (повторний клік через <1,5 с скине стан раніше).

## Повторно: PASS (коміт f9919a0)

`npm run check:fast` — exit 0 (lint, тести, build зелені) після виправлень рев'ю; зауваження про таймер `TCopyField` усунуто.
