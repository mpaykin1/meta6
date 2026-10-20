type: REPORT-QUALITY
scope: scheduled ChatGPT tasks / GitHub handoff / PR evidence; read-only audit of game
date: 2026-10-20
main_sha: ede1698a5113c44956fcd22b50277f1707ed5f33
verdict: ATTENTION — pulse stale; recent status partially current; no confirmed false OWNER PASS.

# 070 — Контроль качества отчётов автозадач «три мира»

## Основание и источники
- Текущий **MAIN_SHA** (GitHub REST `GET /repos/mpaykin1/meta6/branches/main`): `ede1698a5113c44956fcd22b50277f1707ed5f33`, коммит от 2026-10-20T08:10:49Z.
- `main:automation/prompts/chatgpt-autotask.md` (blob `154d179ec770c4dbf7d3df3daeea9ae21453d90c`): разделы «Защита от затыков», «Свежесть данных», «Шаг 3. Пульс»; `main:docs/THREE_WORLDS_MERGE_RU.md` §21.12–21.13.
- `handoff:handoff/autotask-pulse.md`, `handoff:handoff/STATUS-chatgpt.md`, `handoff/to-claude/038-autotasks.md`, `handoff/to-chatgpt/069-review.md`.
- GitHub Pull Requests API + check-runs. Метаданные 5 существующих scheduled tasks прочитаны без изменения настроек; истории текстов выполнений этот интерфейс не предоставляет.
- Ничего в игре, PR, заданиях или расписаниях в ходе проверки не изменено. Диалоги доступа не принимались.

## Находки

### F1 — HIGH: обязательный pulse отсутствует за последние слоты
`handoff/autotask-pulse.md:2`: последняя строка **2026-10-19T15:54:00Z, :50 manual invocation** (PR #82–84), без `MAIN_SHA`; `CI/golden UNKNOWN`, FPS не измерен. Более свежих записей в этом файле нет. На фоне текущего main `ede1698a` строка устарела как **операционный указатель следующему слоту**. Это не доказательство, что сам автор использовал неправильный main 19 октября: исторический пульс и свежий отчёт различать.

**Контрпример / полезная свежая запись вне pulse:** `handoff/STATUS-chatgpt.md`, конец файла, `2026-10-20T08:15:38Z — autotask :15 continued PR118 review changes`, содержит **правильный** `main_sha: ede1698a...`, PR #118 head `8c32f372...`, `CI pending`, `LOCAL_PASS 10/10`. Соответственно утверждать «автозадач 20 октября вообще не было» нельзя. Однако отчёт слота **не перенесён в pulse**, следующий слот не получил обязательную одну строку. Потребовать атомарную запись пульса после каждого выполнения и чтение предыдущего, с временем/слотом/MAIN_SHA/PR/CI/next.

### F2 — MEDIUM: метаданные планировщика не подтверждают выполнение за 20 октября и противоречат свежей записи в handoff
У пяти активных задач (`is_enabled=true`, `RRULE:FREQ=HOURLY`, `TZID=Asia/Tbilisi`, prompt — только указатель на общий живой файл) поле `last_run_time` всё ещё указывает:
- `:05` — 2026-10-19T16:03:02Z;
- `:15` — 2026-10-19T15:19:37Z;
- `:30` — 2026-10-19T15:33:53Z;
- `:40` — 2026-10-19T15:35:50Z;
- `:50` — 2026-10-19T15:54:23Z.

При этом handoff содержит запись `:15` от 2026-10-20T08:15:38Z. **Не приписывать достоверно происхождение записи планировщику без run-ID/текста выполнения**; возможна задержка метаданных или запись другим исполнителем. Пять конфигураций обновлялись 20 октября, но `updated_at` не равен успешному запуску. `default_timezone=Europe/Moscow` расходится с `TZID=Asia/Tbilisi` (наблюдение, не доказательство неправильного слота). Ввести однозначный execution proof (task-id, фактический start UTC, результат, commit/PR).

### F3 — MEDIUM: оставлены устаревшие открытые черновики/отчёты; не считать их актуальным состоянием
- PR [#75](https://github.com/mpaykin1/meta6/pull/75), старый красный draft автозадачи `camera-deadzone-qa-auto1` на **отменённое §21.3**: `closed`, `merged=false` с 2026-10-19T14:37Z. **Сейчас открытым блокером не является**.
- PR [#21](https://github.com/mpaykin1/meta6/pull/21) — OPEN + DRAFT, текст `WAIT_OWNER` против новой модели §18.4/§21.13; PR [#25](https://github.com/mpaykin1/meta6/pull/25) — OPEN + DRAFT (исторический аудит); PR [#61](https://github.com/mpaykin1/meta6/pull/61) — OPEN + DRAFT (Claude docs). Они **не установлены как текущие автозадачные PR**; автоматически закрывать в этом аудите нельзя.
- PR [#22](https://github.com/mpaykin1/meta6/pull/22) — OPEN, отчёт `work-notes/chatgpt/autotask-read-check.md` относится к запускам **18 октября** и ссылается на старый запрет `WAIT_OWNER`; устарел для сегодняшних решений. Документ сам уточняет, что чтение §17 **не подтверждено**; не интерпретировать «нет» как доказательство нечтения. Предложение: пометить как историческую проверку, провести rebase/закрытие по решению владельца и Claude, не сливать устаревшие роли/WAIT_OWNER.
- Нынешних **открытых PR веток `*-autoN`** в выборке `GET /pulls?state=open` не обнаружено. Проверку красного CI черновиков нельзя считать проведённой по цвету: у проверенных голов PR #21/#25 API `check-runs` возвращает **0**, это `UNKNOWN/NO CHECKS`, не `RED` и не `PASS`.

### F4 — HIGH: предотвращение ложного PASS в отчётах и CI
- **Подтверждённых ложных утверждений `OWNER PASS` в доступных свежих отчётах нет**. Пульс явно пишет `UNKNOWN`; `STATUS-chatgpt.md` пишет `LOCAL_PASS 10/10` и `CI pending`, что **не эквивалентно** `OWNER PASS`.
- PR [#118](https://github.com/mpaykin1/meta6/pull/118) уже исправил по Claude `069-review.md` статусы `docs/ACCEPTED_BEHAVIORS.md`: A05/A06/A09/A10 и глубокий A01/A08 помечены `ОТКРЫТ ДЕФЕКТ`. Текущий PR head при проверке `8c32f37277b7e0cea50ddb376d44c3b6f47b510d`, не первоначальный `fec00cd`. На **текущем head** `three-worlds-gate` и `smoke` ещё `in_progress`; green-картина для предыдущего head `fec00cd` **не переносится** на новый head.
- Claude в `handoff/to-chatgpt/069-review.md` отдельно указал слабые проверки A03/A06/A09/A10: наличие исходных строк, preset, выборочные записи и `swimVertical` недостаточны для реальной камеры/дождя/5-5-5/водного боя. Успешные 10 модельных Node-тестов не означают устранения видимых дефектов. Не писать `PASS` без точного head SHA и фактической проверки; владелец единолично даёт OWNER PASS/FAIL.

## Требуемые действия для Claude / исполнителей (вне этого аудита)
1. Восстановить непрерывный pulse для пяти слотов; при каждой записи обязательны UTC, слот, MAIN_SHA из актуального main, PR/head, CI по **этому** head (`SUCCESS/FAIL/PENDING/UNKNOWN`), FPS-метрика либо «не измерено», следующий шаг.
2. Сверить реальную историю запусков (task run/log) и метаданные `last_run_time`; расхождение свежего handoff :15 и вчерашнего run timestamp явно пометить `UNVERIFIED`.
3. В отчётах разделять `CODE/LOCAL_PASS`, `CI_GREEN`, `CLAUDE_REVIEW_OK`, `OWNER_PASS`; never claim green on a superseded commit or on skipped/zero checks.
4. PR #21/#22/#25/#61 разбирать отдельно как исторический backlog, а не автоматически как автозадачные красные draft; PR #75 уже закрыт. Актуальную очередь — только из main и свежего handoff, без `WAIT_STAGE_0`.
5. После появления зелёного CI для последнего head PR #118 сверять ревью/слияние отдельно; незакрытые owner-defects не объявлять исправленными.

**Итог:** актуальный `MAIN_SHA` в свежей записи `:15` правильный; нарушена полнота и свежесть центрального `autotask-pulse.md`; старые копии/черновики присутствуют в архивном backlog; подтверждённого ложного OWNER PASS нет; PR #118 нельзя признавать CI PASS до завершения проверок текущего head.
