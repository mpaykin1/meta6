type: REPORT-QUALITY
scope: five scheduled META6 ChatGPT tasks, pulse, recent handoff, draft PR and CI evidence
date: 2026-10-20
main_sha: 2633c75697fbec24f7e15fa52bba39d3fd32e430
handoff_sha_audited: a3f82d867aaae9eea8657dc9de61bcc5bd8af7b8
verdict: PARTIAL FIX — F1/F2 incomplete; F3 auttask drafts closed, historical #61 remains; F4 no confirmed false OWNER PASS.

# 074 — Повторный контроль F1–F4 после 070

## Источники и границы
- GitHub REST: /branches/main -> `2633c75697fbec24f7e15fa52bba39d3fd32e430` (2026-10-20T08:18:05Z), /branches/handoff -> `a3f82d867aaae9eea8657dc9de61bcc5bd8af7b8` (2026-10-20T08:50:11Z); PR API /pulls?state=open, отдельные PR #21/#22/#25/#61/#75/#118/#120/#121/#122, GitHub Actions runs по exact head.
- main: `automation/prompts/chatgpt-autotask.md` (blob `154d179e...`), `docs/THREE_WORLDS_MERGE_RU.md` §21.12–21.13, `docs/ACCEPTED_BEHAVIORS.md`.
- handoff: `to-claude/070-report-quality.md`, `to-claude/055-tasks-health.md`, `to-claude/073-model-lab-visual-review-request.md`, `to-claude/073-audit044-guest-review-request.md`, `autotask-pulse.md`, `STATUS-chatgpt.md`.
- Метаданные существующих задач через read-only ChatGPT scheduler peek. Run-ID и полная история execution не выдаются; `last_run_time` сам по себе не доказывает успешное выполнение. Игра, CI, PR и задачи не изменялись; доступ не запрашивался.

## F1 — PARTIAL FIX / HIGH: pulse возобновлён, но формат и непрерывность нарушены
- По сравнению с 070 добавлено 7 строк после исторической 2026-10-19T15:54Z. Доступные новые отчёты: слот :15 (08:15:38Z, 08:18:36Z), :30 (08:37:30Z), :50 (08:48:30Z); отдельно recovery 08:47:35Z и 08:50:10Z, явно обозначенные как НЕ scheduled runs.
- В самих строках :15/:30/:50 нет обязательного поля `MAIN_SHA` вообще, хотя manual recovery указывает правильный на момент записи `2633c756...`. Нельзя подменять отсутствующую аттестацию слота SHA соседней ручной записи. Записи :05/:40 отсутствуют.
- У :15 два отчёта про один PR #118 (предварительный и merged), нормально как progression, но отсутствует task/run-ID. У :30 указан прежний успешный head PR121; последующий :50 уточняет exact head и повтор попытки, полезный follow-up. FPS p50/p95 не измерен; UNKNOWN указан корректно.
- В `autotask-pulse.md` у последних строк отсутствует унифицированный `PR/head`, `CI`, `review`, `next`; часть сведений разбросана по STATUS. Восстановление самого файла подтверждено, исполнение каждой из 5 задач каждый час — нет.
**Действие:** делать атомарную строку на каждый слот `UTC | slot | task ID/run ID (или UNVERIFIED) | MAIN_SHA live | PR HEAD | CI exact HEAD | REVIEW | OWNER_PASS=UNKNOWN | FPS p50/p95=UNKNOWN | next`; manual recovery держать отдельно, не считать слотом.

## F2 — PARTIAL FIX / MEDIUM: enabled=true и новые last_run_time, но provenance остаётся
Текущее read-only состояние планировщика: все 5 включены, `FREQ=HOURLY`, `DTSTART;TZID=Asia/Tbilisi:20261020T12NN`, `default_timezone=Asia/Tbilisi` (предыдущее противоречие Europe/Moscow устранено). 
- :05 — last_run_time `2026-10-19T16:03:02.789Z` (старый), `updated_at 2026-10-20T08:20:45Z`.
- :15 — last_run_time `2026-10-20T08:18:52.235Z`, updated 08:19:55Z.
- :30 — last_run_time `2026-10-20T08:38:23.944Z`, updated 08:38:46Z.
- :40 — last_run_time `2026-10-20T08:48:26.970Z`, updated 08:48:49Z.
- :50 — last_run_time `2026-10-20T08:48:24.721Z`, updated 08:48:46Z.
Отдельная строка :40 в pulse отсутствует; :50 имеет pulse 08:48:30Z. Метки :40/:50 около 08:48Z не совпадают с ожидаемыми минутами расписания и не позволяют заключить, что это были автоматические исполнения; могли быть ручные/recovery. :05 обновлён после соответствующего слота, следующая назначенная проверка ещё не подтверждена; двух пропущенных ПОСЛЕ изменения запусков не доказано. `is_enabled` ≠ `SUCCESS`.
**Новый риск относительно текста main:** живой `chatgpt-autotask.md` требует у пяти tasks «ТОЛЬКО короткий prompt-указатель», но в scheduler у всех есть ещё длинный текст «ВЗАИМНЫЙ WATCHDOG»; это явное расхождение конфигурации и живого правила, даже если watchdog санкционирован отдельно. Claude должен согласовать источник истины, не менять ID/расписание без необходимости.
**Действие:** подтвердить фактические следующие часы по task execution log/run ID и новому pulse; если лог недоступен — `RUN_UNVERIFIED`, не «запустилось/починено».

## F3 — FIXED FOR IDENTIFIED AUTOTASK DRAFTS; HISTORICAL BACKLOG OPEN
- #75 = CLOSED, NOT MERGED (ещё 2026-10-19).
- #21 = CLOSED/NOT MERGED 08:39:33Z; #22 = CLOSED/NOT MERGED 08:39:37Z; #25 = CLOSED/NOT MERGED 08:39:42Z (20 октября). Эти старые отчёты/WAIT_OWNER более не являются открытыми PR, ошибочно актуализировать их нельзя.
- #61 = OPEN/DRAFT, Claude docs (не установлен как автозадача); также исторические #1/#2/#7 = OPEN/DRAFT вне обнаруженных текущих `*-autoN`. Автоматически закрывать их по правилу про собственные PR автозадачи нельзя.
- Сейчас актуальные #120/#121/#122 = OPEN, не draft, не merged. Открытых текущих autoN PR в полном ответе `pulls?state=open&per_page=100` нет.
**Действие:** архивный backlog #61 отдельно к Claude; не выдавать наличие старого draft за красный активный автозадачный PR.

## F4 — NO CONFIRMED FALSE OWNER PASS / WATCH TEST EVIDENCE
- #118 merged (main `2633c756...`); gate run 39392076719 = SUCCESS на head `8c32f372...` и не переносится на другой head.
- #120 current head `0301b925...`: gate 39392602877 SUCCESS, smoke 39392602987 SUCCESS.
- #121 current head `db06c6b3...`: gate 39395038572 **attempt 2** SUCCESS, smoke 39395038620 SUCCESS. Автор явно раскрывает transient attempt 1 FAIL в portal browser test; это не исправление дефекта портала и не OWNER PASS.
- #122 current head `2ae880cb...`: gate 39395773283 SUCCESS, smoke 39395773239 SUCCESS.
- Это `CI_GREEN` только для соответствующих голов; не `CLAUDE_REVIEW_OK`, не `OWNER_PASS`. `STATUS-chatgpt.md` и pulse указывают REVIEW PENDING и OWNER PASS UNKNOWN.
- `main:docs/ACCEPTED_BEHAVIORS.md` по-прежнему содержит открытые дефекты A01/A08 (глубина), A05 (наполнение мира), A06 (гость), A09 (дождь), A10 (бой/прыжок в воде). Зелёные модельные/golden тесты не доказывают исправление этих симптомов и не изменяют владелческое решение.
- Точные времена CI по Actions подтверждены; без независимого ревью и прогона нельзя объявлять полное устранение owner-defects.
**Действие:** стандартизировать `LOCAL_PASS`, `CI_GREEN[SHA]`, `REVIEW_OK[SHA]`, `OWNER_PASS`; обязательно записывать FAIL первой попытки/retry/flakes и не повышать статус автоматически.

## Решение
F1: ЧАСТИЧНО (пульс снова пишется, обязательный MAIN_SHA в scheduled слотах отсутствует).
F2: ЧАСТИЧНО (новые last_run_time и timezone исправлены; запуск :05 и происхождение :40/:50 не подтверждены).
F3: ЗАКРЫТО для #21/#22/#25/#75, #61 остаётся историческим OPEN/DRAFT и не является доказанным багом автозадач.
F4: ЛОЖНЫЙ OWNER PASS НЕ ПОДТВЕРЖДЁН; CI exact-head зелёный у #118/#120/#121/#122, владелческие дефекты остаются открытыми.

Требуется не ещё один косметический PASS-отчёт, а стабильный per-slot execution proof с live MAIN_SHA, run ID, exact-head CI и явной маркировкой неизвестного.
