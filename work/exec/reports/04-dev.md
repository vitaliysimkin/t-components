# Крок 4 — K03 `TInfoTip` + K04 `TLogPane`

## Що змінено
- `src/components/TInfoTip.vue`: `ticon:info` у `TTooltip`; `tabindex="0"`, `role="img"`, `aria-label` = `text`; пропи `text`, `placement` (`top`); слот замінює вміст підказки.
- `src/components/TLogPane.vue`: проп `lines: TLogLine[]` (`id`, `text`, `kind?: 'out'|'err'|'warn'|'info'`, `prefix?`; без `step`), `dropped`, `height` (`320px`); тексти-пропи `emptyText`, `droppedText` (`{count}`), `toEndLabel`. Автопрокрутка, пауза при прокрутці вгору, кнопка «до кінця» (`TButton`, `ticon:arrow-down`). Стилі `.log` з Bombadil — scoped, кольори за `kind` — токени статусів, px → токени.
- Реєстрація: `registry.ts`, `index.ts` (+ типи `TInfoTipProps`, `TLogPaneProps`, `TLogLine`), `globalComponents.ts`.
- Тести `src/__tests__/TInfoTip.test.ts` (фокусований, доступне ім'я), `TLogPane.test.ts` (клас за `kind`, кнопка «до кінця» після прокрутки вгору і зникає після кліку).
- Playground: `playground/src/examples/info-tip/`, `log-pane/` (рядки додаються таймером), `examples/index.ts`.
- README (перелік: `TInfoTip` у «Навігація / лейаут», новий рядок «Логи: `TLogPane`»), CHANGELOG `[Unreleased]` → Added.
- Рішення 02: `.size-limit.json` — `Styles` 12 → 15 KB, `Full bundle` 195 → 205 KB.

## Перевірки
- `npm run check:fast` — lint чистий, 27 файлів / 220 тестів зелені, build без помилок.
- `npm run check:size` — до: Full 188.1 / 195 kB, Styles 11.92 / 12 kB; після: Full 188.61 / 205 kB, Styles 12.06 / 15 kB (без підняття Styles перевищив би), Core 159.13 / 180 kB, Icons 18.35 / 30 kB.
- Перегляд у `npm run dev` (Playwright + Chromium, світла й темна): підказка TInfoTip з'являється при наведенні; TLogPane — кольори err/warn/info, після прокрутки вгору з'являється кнопка «до кінця». Помилок застосунку в консолі немає (лише недоступні зовнішні ресурси через мережу).
