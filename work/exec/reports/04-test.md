# Крок 4 — перевірка (тестувальник)

**Вердикт: PASS**

- `npm run check:fast` — lint чистий, 27 файлів / 220 тестів зелені, build успішний.
- Тести є: `TInfoTip` — `getByRole('img', { name })` + `tabindex="0"`; `TLogPane` — класи `is-out/is-err/is-warn`, кнопка «до кінця» з'являється після прокрутки вгору й зникає після кліку.
- Межі дотримано: `TTooltip.vue`, `TFormField.vue` у коміті 97e016e не змінено; `step` у `TLogLine` немає; стилі scoped, кольори — токени (`--t-color-danger/warning/text-muted`), іконки `ticon:info`, `ticon:arrow-down` є в наборі.
- Playground, README, CHANGELOG (Added) оновлено; тип `TLogLine` експортовано.
- Браузер (`npm run dev`, Playwright/Chromium, світла й темна): TInfoTip — `aria-label`, фокус з видимим outline, підказка при наведенні; TLogPane — моно-шрифт, кольори рядків різні в обох темах, автопрокрутка тримає низ (відстань 0), прокрутка вгору → пауза (scrollTop лишається 0) і кнопка видима, клік → назад до кінця, кнопка зникає. Помилок застосунку немає (лише `ERR_TUNNEL_CONNECTION_FAILED` для зовнішніх іконок — мережа пісочниці).

Зауваження (не блокує): підказка TInfoTip не відкривається при фокусі з клавіатури (TTooltip за замовчуванням `trigger="hover"`); план цього прямо не вимагає.
