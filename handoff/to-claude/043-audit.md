type: AUDIT
pr: none
stage: §21.8–§21.14(A), безопасность + мобильный ввод / производительность
time: 2026-10-20T05:34:34.308Z
range: 0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f..17e4c1893c40532e042e7fa48158c42b271f2fe8
focus: 4+5
reviewed_head: 17e4c1893c40532e042e7fa48158c42b271f2fe8
main_sha_at_audit: 8043c61e2f16bd94c8de361dc3e688c28d640e31

# 043 — Независимый аудит безопасности, мобильного ввода и производительности

**Итог: критичных 0, важных 3, мелких 1.** Проверены 14 коммитов/21 изменённый файл по заданному диапазону. Все замечания — статически подтверждённые пробелы в проверках/конфигурации; описанные регрессии являются воспроизводимыми *возможными* сценариями, а не выдуманными фактически наблюдёнными сбоями. Текущий `main` уже ушёл вперёд до `8043c61` (#107), поэтому ниже ссылки строго на конечный SHA диапазона. OWNER PASS не присваивается.

1. **[ВАЖНО]** [tests/owner-2114-water-entry-browser.mjs:4–8,10–15,29–47,49–60](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/three-worlds-game/tests/owner-2114-water-entry-browser.mjs#L4-L60) и [three-worlds-gate.yml:43–47](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/.github/workflows/three-worlds-gate.yml#L43-L47): регрессионный сценарий «в воду и назад» запускается на desktop viewport `900×640` и использует `i.sim(dt, ±1, ...)` напрямую, без события касания экрана. Проверка не устанавливает, что **нативный плавающий джойстик** ведёт героя через берег, что на телефоне не происходит скролла при этом маршруте и что после возврата сохранилось `G.state==='play'`. **Сценарий:** `pointermove` на телефоне перестаёт подавать движение при входе в воду, а desktop `i.sim` по-прежнему проходит; зелёный CI не ловит владельческий FAIL. **Исправить:** добавить мобильный Playwright/CDP-прогон той же траектории через настоящие два цикла `Input.dispatchTouchEvent` (`touchStart→touchMove→touchEnd`), без прямого `i.sim`; после первой части проверять `underwater.isSubmerged()`, рост числа активных чанков, `scrollX/scrollY===0`, после обратной — `!isSubmerged()`, `G.state==='play'`, ненулевое смещение героя. Готовая проверка состояния после каждого реального ввода:
   ```js
   const s=await page.evaluate(()=>({
     x:__isle.player.pos.x,wet:__isle.underwater.isSubmerged(),
     chunks:__isle.underwater.chunks,state:__isle.G.state,
     scroll:[scrollX,scrollY],stick:__isle.inputPointers.stickId
   }));
   assert.equal(s.state,'play');
   assert.deepEqual(s.scroll,[0,0]);
   assert(s.chunks>0);
   ```
   Исходная точка может выставляться один раз перед вводом; движение должно происходить только от событий касания.

2. **[ВАЖНО]** [tests/owner042-044-browser.mjs:25–52](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/three-worlds-game/tests/owner042-044-browser.mjs#L25-L52), [tests/owner-touch-gate.mjs:5–8](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/three-worlds-game/tests/owner-touch-gate.mjs#L5-L8): при **двух одновременных касаниях** тест проверяет захват обоих `pointerId` и изменение `yaw`, но не измеряет дальнейшее перемещение героя, пока камера управляется вторым пальцем. Проверка `walk>.008` выполнена по координатам, снятым **до** второго касания (строки 54–59). **Сценарий:** второй палец обнуляет `touch.vx` или конфликтует с движением; камера поворачивается, ID остаются ненулевыми, оба старых утверждения проходят. **Исправить:** после `touchStart/touchMove` со вторым пальцем оставлять оба пальца зажатыми на несколько реальных кадров и сравнивать `player.pos`; также проверять разные ID. Готовый фрагмент непосредственно до `touchEnd`:
   ```js
   const p0=await page.evaluate(()=>__isle.player.pos.toArray());
   await page.waitForTimeout(350);
   const p1=await page.evaluate(()=>__isle.player.pos.toArray());
   const ids=await page.evaluate(()=>__isle.inputPointers);
   assert.notEqual(ids.stickId,ids.camId);
   assert(Math.hypot(p1[0]-p0[0],p1[2]-p0[2])>.05,
     'second finger stopped native movement');
   ```
   Тестировать на безопасной проходимой исходной площадке, чтобы столкновение со стеной не давало ложный FAIL.

3. **[ВАЖНО]** [.github/workflows/three-worlds-gate.yml:25–59](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/.github/workflows/three-worlds-gate.yml#L25-L59), [tests/owner-218-weather-visual-browser.mjs:70–96](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/three-worlds-game/tests/owner-218-weather-visual-browser.mjs#L70-L96): вновь объявленный «permanent regression gate» проверяет GPU-видимость погоды, скриншоты и input, но **нигде не измеряет и не ограничивает** `frame time p95`, FPS, пик нагрузки на потоковую загрузку чанков или память после длительного маршрута. Проверка `changedPixels>=24` доказывает изображение, а не мобильную производительность. **Сценарий:** визуально корректная погода вызывает серьёзные фризы на телефоне, но gate зелёный. **Исправить:** в отдельном performance test собирать `requestAnimationFrame` дельты во время реального перемещения через 3+ чанка, фиксировать `p50/p95`, `renderer.info.render.calls`, текстурную память/геометрию; сравнивать с зафиксированным baseline в одинаковой среде, а приёмо-сдаточный FPS на iPhone 11 измерять на устройстве. Минимальная метрика:
   ```js
   const timing=await page.evaluate(()=>new Promise(resolve=>{
     let prev=0,d=[];function tick(t){
       if(prev)d.push(t-prev);prev=t;
       if(d.length<180)requestAnimationFrame(tick);
       else {d.sort((a,b)=>a-b);resolve({p50:d[90],p95:d[171]});}
     }requestAnimationFrame(tick);
   }));
   assert(Number.isFinite(timing.p95));
   ```
   Не приравнивать SwiftShader к физическому iPhone; hardware-целевой бюджет — отдельная проверка.

4. **[МЕЛКО]** [.github/workflows/three-worlds-gate.yml:19–21,53–54](https://github.com/mpaykin1/meta6/blob/17e4c1893c40532e042e7fa48158c42b271f2fe8/.github/workflows/three-worlds-gate.yml#L19-L54): новые CI-шаги используют изменяемые теги `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, не immutable SHA. **Сценарий:** подмена зависимости GitHub Action при ретеге исполняет другой код на runner. **Исправить:** закрепить каждый action за **проверенным официальным полным commit SHA** конкретного релиза с комментарием версии; не подставлять непроверенные хэши. Риск ограничен `permissions: contents: read` и `persist-credentials:false`, признаков компрометации нет.

## Что проверено
- GitHub `main` прочитан заново: `three-worlds.md`, канон `graf.md`, `docs/THREE_WORLDS_MERGE_RU.md`, `automation/prompts/chatgpt-auditor.md`; HEAD диапазона и все 21 имени изменённых файлов подтверждены `compare_commits`.
- Просмотрены изменённые модули `ash-world.mjs`, `rift-story.mjs`, `voxel-terrain.mjs`, `underwater-runtime.js`, `index.source.html` и затронутые Node/Playwright-тесты и workflows.
- По исходнику `index.source.html` проведено сравнение базового и конечного SHA: новых `eval`, `innerHTML`, сетевых URL, встроенных секретов не обнаружено. Исходные запросы к Google Fonts и CDN Three.js существуют в обоих SHA, не относятся к регрессиям указанного диапазона.
- Проверены `handoff/to-claude/042-audit.md` и `handoff/AUDIT-STATE.md`. Исправления дыры x64–72 и старые замечания по seam/CI здесь повторно не открываются. Добавленное позже в `main` исправление input watchdog (#107) не считается дефектом текущего диапазона.

## Не мог проверить
- Фактическую работу тачскрина iPhone 11, GPU/Metal, реальный FPS/p95 и WebGL GPU memory.
- Живой браузерный запуск тестов и реальные фотографии/артефакты Actions; вывод основан на чтении кода и структурной проверке файлов, без объявления PASS.
- Эксплуатацию уязвимостей: найдено усиление модели доверия CI, а не подтверждённая атака.

**Никаких файлов игры, PR, CI, ветки `main` не изменялось. Только этот отчёт в `handoff`.**
