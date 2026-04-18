Ти — оркестратор. Працюй у `c:\projects\t-components`.

1. Прочитай `tasks/README.md`. Виділи задачі з `[ ]` (невиконані).
2. Склади послідовний план з урахуванням графу:
   `#01` → (`#02`, `#04`, `#06`, `#07`, `#10`) вільні після `#01` → `#03` → (`#05`, `#08`, `#11`) → `#09` після `#08`.
   Порядок: `#01 → #02 → #04 → #06 → #07 → #10 → #03 → #05 → #08 → #09 → #11`. Пропускай `[x]`.
3. Надішли PushNotification: `🚀 Старт: N задач — #01, #02, ...`

4. Для кожної задачі послідовно:
   a. PushNotification: `▶️ #NN <title>`
   b. Запусти суб-агента через Agent tool (`subagent_type=general-purpose`, `isolation=worktree`) з таким промптом:

      ```
      Виконай tasks/NN-*.md згідно "Інструкції для агента" в tasks/README.md.
      Правила: не чіпай файли поза "Files to touch"; `npm run typecheck` і `npm run build:nocheck` мають пройти перед комітом; відміть acceptance criteria [x] і додай ## Зроблено в tasks/NN-*.md; онови статус [x] в tasks/README.md; один коміт (код + task + README); `git push` + `gh pr create` на main.
      Звіт <200 слів: що зроблено / typecheck / build / PR URL / follow-ups / остання строка: STATUS: OK | STATUS: FAIL: <причина>.
      ```

   c. Прочитай звіт.
   d. `STATUS: OK` → PushNotification: `✅ #NN done — PR <url>` → наступна.
   e. `STATUS: FAIL`:
      - Спробуй зрозуміти причину зі звіту. Якщо помилка локальна в задачі і не блокує інші (наприклад: конкретний тест падає, спірний typecheck-edge, неоднозначний acceptance) — PushNotification: `⚠️ #NN skipped — <причина>` і ПРОДОВЖУЙ з наступною.
      - Якщо помилка блокуюча для решти (зламаний build на main, поламаний npm, git-конфлікт у shared-файлі, відсутні залежності, credentials/auth fail) — PushNotification: `❌ #NN FAIL — <причина>. Зупинено.` → СТОП, крок 5.
      - При сумнівах: якщо наступні задачі залежать від цієї по графу — блокуюча. Якщо не залежать — skippable.

5. PushNotification: `🏁 Done: N | Failed: M | Skipped: K | Not started: P`

## Обмеження

- Послідовно, без паралелізму.
- Коміти робить сам суб-агент у своєму worktree.
- Blocking vs skippable: якщо задача B у графі має залежність від A, і A впала — B автоматично skip (не запускай), але решту незалежних — продовжуй.
- Стоп тільки якщо зламане саме середовище (build/git/npm), не одна задача.
