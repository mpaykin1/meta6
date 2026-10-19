type: AUDIT
pr: none
stage: 7 (незавершённая ветка ai/chatgpt/stage-7-playtest, PR #49 draft)
time: 2026-10-19T00:31:12.553Z
range: bd522eba197db78de70b5c54641e676a129f5efc..e3227ccc8421781e38fd7c148db19f04f03d7c01
focus: 3+7

# Независимый аудит: тесты (3) и процесс (7)

Итог: критичных 1, важных 2, мелких 1; возможно 0. Это аудит точного HEAD, не REVIEW: OK и не OWNER PASS.

1. **[КРИТИЧНО] [three-worlds-game/rift-story.mjs:37,43,48–49](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/rift-story.mjs#L37-L49)**: завершение гостя после помощи НЕ перевзводит новый таймер. Убийство на строке 43 устанавливает `nextGuestIn=50..70`, а уход награждённого гостя на строке 49 только делает `guest=null;return`. Сценарий: игрок помогает, гость доходит до (-126,32), исчезает, затем уже на следующем `update(dt)` условие строки 37 обнаруживает старый `nextGuestIn<=0` и создаёт нового гостя без паузы. Нарушает §20.2 E/§20.7; особенно опасно, поскольку handoff/to-chatgpt/018-interim-pr49.md ошибочно утверждает «таймер ... в обоих исходах».

   **Исправить общим завершающим методом для ОБОИХ исходов**, вместо дублирования удаления:
   ```js
   function finishGuest(g){
     scene.remove(g.mesh);
     g.mesh.geometry.dispose();
     g.mesh.material.dispose();
     guest=null;
     nextGuestIn=50+(((Math.sin((++guestCycle+seed)*12.9898)*43758.5453)%1+1)%1)*20;
   }
   // В обработчике hp<=0: finishGuest(g); return;
   // В проверке достижения портала rewarded: finishGuest(g); return;
   ```
   После фикса проверить обоими путями: новый гость появляется только через 50–70 ВИРТУАЛЬНЫХ секунд, а не на следующем кадре.

2. **[ВАЖНО] [three-worlds-game/rift-story.mjs:37–49](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/rift-story.mjs#L37-L49), [underwater-runtime.js:34–44,151–152,216–220](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/underwater-runtime.js#L216-L220), [tests/rift-story.test.mjs:1–2](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/tests/rift-story.test.mjs#L1-L2), [tests/water-world.test.mjs:2–3](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/tests/water-world.test.mjs#L2-L3)**: новый таймер, оба завершения арки, плавная глубина и пул пузырьков НЕ покрыты тестами, способными упасть при нарушении этих свойств. Тест rift-story проверяет только `guestLine()`, а water-world тестирует геометрию и наличие строк в исходнике (например, `s.includes('Math.max(gy+.08,SEA+.55)')`). Сценарий: регрессия из п.1 сохраняет «зелёный» unit-suite; отключение эмиссии пузырьков тоже не нарушит текущие проверки. Добавленных/изменённых тестов в указанных пяти коммитах нет; `evidence/unit-tests.txt` — прежний набор 15 проверок, не доказательство реализации A–C/E.

   **Исправить**: вынести проверяемый переход `finishGuest` и таймер из рендера в детерминированный state-machine (например, `advanceGuest(dt,event)`), затем написать отдельные `node:test` для `kill → 49 с → гость не появился → 70 с → появился`, `return → то же`, и для `immersionAt`/буфера (0≤count≤96; count>0 при погружении). Проверить, что тест намеренно падает, если убрать сброс таймера из успешного исхода. Проверки проводить виртуальным `dt`, без минут реального ожидания (§20.7).

3. **[ВАЖНО] [three-worlds-game/tools/build-offline.cjs:6–24](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/tools/build-offline.cjs#L6-L24), [tests/offline-export.test.mjs:2–4](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/three-worlds-game/tests/offline-export.test.mjs#L2-L4)**: в диапазоне изменены исходные `rift-story.mjs` и `underwater-runtime.js`, но **не `three-worlds-game/index.html`**. Сборщик полностью встраивает модули в автономный HTML, поэтому имеющийся файл не содержит изменений данного диапазона. Тест `offline-export` проверяет только синтаксис и отсутствие внешних URL, а не соответствие HTML текущим исходникам. Сценарий: владелец запускает готовый автономный HTML и видит старую версию, несмотря на исправления A–C/E в отдельных исходниках; тесты зелёные.

   **Исправить перед REVIEW**: `cd three-worlds-game/tools && npm run build` (при заранее установленных зависимостях); включить пересобранный `index.html` в ветку и добавить контроль соответствия сборки исходникам (rebuild в временный путь + сравнение байтов/хешей; несовпадение = FAIL). Никакой готовности автономной версии пока не заявлять. Этот пункт пока отражает незаконченный draft, а не утверждение о принятой игре.

4. **[МЕЛКО] [docs/stage-7-playtest-status.md:3–13](https://github.com/mpaykin1/meta6/blob/e3227ccc8421781e38fd7c148db19f04f03d7c01/docs/stage-7-playtest-status.md#L3-L13)**: добавленный документ устарел уже к указанному HEAD: написано «BLOCKED BEFORE IMPLEMENTATION», «gameplay source ... unchanged» и требуется пяти-минутный прогон со скриншотами каждые 10 с. Однако два исходника изменены, `handoff/STATUS-chatgpt.md` сообщает A–G IN PROGRESS, а в docs/THREE_WORLDS_MERGE_RU.md §20.7 запрещены длинные прогоны, разрешены только короткие сценарии/3–6 ключевых кадров. Сценарий: контролёр или автозадача принимает неактуальный блокер и неверный сценарий тестирования.

   **Исправить** шапку на `Status: IN PROGRESS, NOT REVIEWED; head: e3227cc; A-C/E partial, D/F/G pending; standalone/screenshots pending`; заменить требование пяти минут на короткие воспроизводимые проверки из §20.7.

## Процесс и границы проверки

- Сравнил ровно `bd522eba..e3227ccc`: 5 коммитов; три изменённых пути (`docs/stage-7-playtest-status.md`, `three-worlds-game/rift-story.mjs`, `three-worlds-game/underwater-runtime.js`). Анализ связанных неизменённых `tests/`, сборщика, `transport.mjs`, §20 и handoff выполнен только для оценки этих изменений.
- PR [#49](https://github.com/mpaykin1/meta6/pull/49) остаётся открытым черновиком, HEAD `e3227cc`, формальный REVIEW-REQUEST отсутствует; это не «застрявший» PR и не основание для закрытия.
- Сверил предыдущий [017-audit](https://github.com/mpaykin1/meta6/blob/handoff/handoff/to-claude/017-audit.md), triage 013, review-note 015 и interim 018. Известные до этого диапазона проблемы — второй таймер `transport.mjs:23` и отсутствие боя союзника — **не считаю повторно как новые замечания**; они остаются незавершёнными задачами E.
- `handoff/AUDIT-STATE.md` уже указывает focus 3+7 и этот HEAD, но нового файла с таким аудитом в `handoff/to-claude/` до данной записи не было. AUDIT-STATE не изменялся (разрешено создать только отчёт).
- Не запускал игру, node suite, Playwright, WebGL, GPU или iPhone; не проверял визуал, FPS, наличие всех рыб и реальную частоту событий. В `evidence/` доступны `unit-tests.txt` и `browser-environment.txt` (в последнем зафиксирована неудача инициализации WebGL), новых скриншотов в диапазоне нет. Никакого PASS не утверждаю.
- Код, тесты, исходные игры, PR, другие сообщения и ветки не изменены; единственная разрешённая запись — этот отчёт.
