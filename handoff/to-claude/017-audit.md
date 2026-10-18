type: AUDIT
pr: none
stage: 0–6 (main, до этапа 7)
time: 2026-10-18T18:24:00Z
range: начало three-worlds-game..bd522eba197db78de70b5c54641e676a129f5efc
focus: 1+2

# Независимый аудит GRAF §27 и логики мира

Итог: критичных 3, важных 4, мелких 0; возможно 1. OWNER PASS не утверждается. Все ссылки привязаны к проверяемому SHA.

1. [КРИТИЧНО] [index.source.html:1857–1863](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L1857-L1863), [index.source.html:4305–4319](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L4305-L4319), [underwater-runtime.js:31–32,86–106](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/underwater-runtime.js#L86-L106), [world-core.mjs:23–37](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/world-core.mjs#L23-L37): два несовместимых дна восточнее x=64. Основной terrain mesh строится по terrainTop → waterHeight, подводный mesh и UW.physicsStep — по seabedHeight. При надводном движении collision привязан к terrainTop, при погружении — к seabedHeight. Сценарий: смена физической опоры, наложение геометрии/z-fighting, перекрытие рыб/руин, скачок высоты при пересечении поверхности. Это НЕ уже исправленная ошибка always-truthy surfaceHeight (ту повторно не открываем).
   Исправить: использовать seabedHeight(x,z,G.seed) как ЕДИНСТВЕННЫЙ источник восточного дна в terrainTop и UW; в ChunkWindow не создавать второй buildExtensionGeometry для океанских чанков. Готовая основа: import {seabedHeight} from './underwater-runtime.js'; в начале terrainTop: if(px>=64)return seabedHeight(px,pz,G.seed); в create(cx,cz): if(cx>=4)return new THREE.Group(); в dispose(mesh): mesh.geometry?.dispose(). Проверить x=65/80/110/190, отсутствие второй поверхности и совпадение Y рельефа и коллизий.

2. [КРИТИЧНО] [underwater-runtime.js:139–147](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/underwater-runtime.js#L139-L147), [218–226](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/underwater-runtime.js#L218-L226), [index.source.html:2687–2693](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L2687-L2693): физика и атмосфера воды включаются по булевому порогу p.y<SEA-.18. Туман/цвет неба изменяются только в ветке if(wet), вместо непрерывного перехода; вертикальная динамика скачком меняется с гравитации на режим плавания. Сценарий: берег→вода меняется резко, а не «по колено→по пояс→с головой» (§20.2 A; подтверждено владельческим FAIL).
   Исправить: непрерывная доля immersion = THREE.MathUtils.smoothstep(SEA-player.pos.y,0,1.5); scene.fog.density = THREE.MathUtils.lerp(surfaceFogDensity,deepFogDensity,immersion); scene.fog.color.copy(surfaceFogColor).lerp(deepFogColor,immersion); также плавно смешивать вертикальное ускорение и cameraY. Проверять глубину и сдвиг камеры покадрово, предел §20.3.

3. [КРИТИЧНО] [rift-story.mjs:35–49](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/rift-story.mjs#L35-L49), [transport.mjs:16–24](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/transport.mjs#L16-L24): первый гость появляется один раз через 38 с. Следующие попытки каждые 180 с (после 140 с), независимо от завершения арки. spawnGuest пропускает вызов при занятом слоте, таймер не перезапускается при смерти/уходе гостя. Друг следует, но нигде не наносит урон врагам. Сценарий: после завершения арки новый гость не появляется через ~60 с; спасённый не защищает игрока (§20.2 E).
   Исправить: один таймер в rift-story, сброс только из finishGuest() после смерти/ухода: nextGuestIn=50+hash(guestCycle++,17,seed)*20; при update и отсутствии guest вычитать dt и спавнить на нуле. Удалить дублирующий независимый spawn из transport; передать callback damageEnemy и при relation=friend выбирать ближайшего враждебного NPC, атаковать с cooldown. Тест обеих концовок и следующего гостя.

4. [ВАЖНО] [underwater-runtime.js:11–18](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/underwater-runtime.js#L11-L18): все крупные 12-метровые холмы подавлены коэффициентом smooth(55,85,off). На входе с восточного берега x=65..110 (off<55) их вклад точно нулевой, остаётся почти монотонный уклон с мелкой рябью. Сценарий: первое подводное пространство выглядит плоским и пустым вместо каньонов и холмов (§20.2 D).
   Исправить: локальный коэффициент shoreMask=smooth(10,25,off); y+=hillContribution*shoreMask. Отдельно обеспечить пологие первые 10–20 блоков и разнообразный рельеф дальше. Проверить рельеф у x=70..110, 4 направления, скриншоты.

5. [ВАЖНО] [index.source.html:1814–1816](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L1814-L1816), [2274–2279](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L2274-L2279), [2779–2784](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L2779-L2784): UW создаётся один раз с DEFAULT_SEED=1337, но buildWorld(seed) перестраивает остров с новым seed. Сценарий: после «Новый остров» океан, рыбы и underwater chunks остаются от seed 1337, единый seed мира нарушен.
   Исправить: передать в UW getSeed:()=>G.seed и сбрасывать ocean chunks/brain/fixtures после смены seed, либо пересоздавать UW с новым seed и полной очисткой GPU/миксеров; тест для seed 1337 и 90210.

6. [ВАЖНО] [rift-story.mjs:15–17](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/rift-story.mjs#L15-L17): портал рисуется кольцом на основе r=length(p), тогда как утверждённый §20.5 эталон — вертикальная рваная щель, не круглая арка. Сценарий: даже после спавна игрок видит неверный дизайн портала.
   Исправить: вместо радиального ring использовать signed-distance до нерегулярной вертикальной щели, анимировать зубчатые края; портировать форму из reference/portal-rift/portal-sketch.html в штатный ShaderMaterial того же renderer.

7. [ВАЖНО] [index.source.html:2162–2188](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/index.source.html#L2162-L2188): вращение камеры мышью начинается при правой/средней кнопке (buttons&6), ЛКМ — атака. §20.2 F требует ЛКМ drag или pointer-lock; в проверенном обработчике этого нет. Сценарий: игрок привычно тянет мышь ЛКМ и не может осмотреться.
   Исправить: внедрить LMB drag-look с порогом отличия от короткого click-attack либо pointer-lock в штатном canvas, без добавления кнопок.

8. [ВОЗМОЖНО] [underwater-runtime.js:107–124](https://github.com/mpaykin1/meta6/blob/bd522eba197db78de70b5c54641e676a129f5efc/three-worlds-game/underwater-runtime.js#L107-L124): всего до 3 рыб на чанк 24×24, пропуск в мелководье (fy>=SEA-1.7), нет гарантированной минимальной численности 10 рыб + крупный объект в радиусе 40 (§20.2 D). Сценарий: около берега можно получить недонаселённый круг обзора. Проверка: реальный подсчёт видимых существ на сетке прибрежных точек и кадры; при провале — детерминированное локальное донаполнение population quota.

## Проверено
- Точный SHA bd522eba197db78de70b5c54641e676a129f5efc, затронутый комплект игры: index.source.html, world-core.mjs, underwater-runtime.js, ash-world.mjs, creature-brain.mjs, rift-story.mjs, transport.mjs, unit/browser gate, §27 и §20.
- Прочитаны прежние REVIEW/alert. Дефекты always-truthy surfaceHeight и id.length исправлены, повторно не открыты.
- Видимых новых HUD-кнопок в просмотренной версии не найдено: дополнительные sunkenHUD и sunkenMiniMap явно скрыты. Пепельный путь имеет физический маршрут x<-64, геометрию и collision; его HARD FAIL не подтверждён.
- В evidence/unit-tests.txt заявлены 15/15 node-тестов. Это проверка доказательств в репозитории, НЕ самостоятельный запуск.

## НЕ проверено
- Физический iPhone, GPU/WebGL-прохождение, FPS p50/p95, реальные 5 минут игры, визуальные скриншоты, рост памяти в длительном стриминге.
- Побайтовое соответствие автономного index.html (4.6 MB) исходнику index.source.html: генератор просмотрен, повторная сборка/бинарная сверка не запускалась.
- Окончательный PASS/FAIL может поставить только владелец.

Запись в handoff — единственное изменение аудитора; код, PR, ветка main и задачи не менялись.
