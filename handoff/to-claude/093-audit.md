type: AUDIT
pr: none
stage: THREE_WORLDS §21.15–§21.25 / GRAF §27 / ACCEPTED_BEHAVIORS A01–A11
time: 2026-10-20
range: 17e4c1893c40532e042e7fa48158c42b271f2fe8..ccd3055845be9301bdd879fc607191ea2918c85a
main_sha_at_audit: ccd3055845be9301bdd879fc607191ea2918c85a
focus: 6+1

# 093 — Независимый аудит: расхождения и WORLD INTEGRITY

**Итог: критичных 0, важных 4, мелких 0; возможно 1.** Это аудит исходников, НЕ OWNER PASS. Проверены 27 коммитов, актуальный main совпал с конечным SHA диапазона. Никаких изменений игрового кода и PR.

## Новые / сохраняющиеся дефекты, установленные по коду

1. **[ВАЖНО] [three-worlds-game/rift-story.mjs:46–50](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L46-L50), [three-worlds-game/rift-story.mjs:197–214](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L197-L214), [three-worlds-game/rift-story.mjs:290–306](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L290-L306) — миссии Хранителя Огня и Стража Бездны не соответствуют утверждённому диалогу.** Из трёх заявленных потребностей в реестре есть лишь пепельный кристалл; для гостя из Острова требуется костёр, для подводного гостя — синее озеро (docs/QUEST_RULES_RU.md:23–32), но при обоих origin код сразу ставит `crystalCollected=true` и требует лишь подойти к произвольному зарегистрированному порталу: `text='...подойди к светящейся щели...'`. **Сценарий:** игрок получает награду и завершает лечение/спасение, ни разу не найдя нужный костёр или воду. **Исправление:** добавить реальные `WORLD_OBJECTS.campfire/blue_lake` со ссылкой на исходный контент, связать цель `mission.requiredItemId` с `guest.origin` и засчитывать её только по взаимодействию с существующим игровым объектом. Пример предохранителя:
   ```js
   if (!mission.objectiveCompleted) return; // перед разрешением завершить миссию
   ```
   Добавить по одному реальному браузерному тесту Fire Keeper → campfire и Abyss Guard → blue_lake; проверять, что до посещения объекта портал не завершает миссию.

2. **[ВАЖНО] [three-worlds-game/rift-story.mjs:319–325](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L319-L325), [three-worlds-game/index.source.html:2754–2762](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/index.source.html#L2754-L2762) — бой с гостем-боссом не проверяет фактическое попадание оружия.** Ветку `boss` расширили, но HP уменьшается от `attacking() && distance<3`, без направления, дистанции конкретного оружия, препятствий, снаряда или hitbox; `attacking` в интеграции — только `combat.atk`. **Сценарии:** стрельба в противоположную сторону на дистанции 2 м повреждает гостя, а попадание дальнобойным снарядом с 5 м не уменьшает HP. В `owner042-044-browser.mjs` проверяется лишь старт босса с 180 HP, не честный урон. **Исправление:** убрать уменьшение HP по флагу атаки; применять `damageGuest(damage)` только в обработчике подтверждённого пересечения оригинального melee/projectile hitbox с гостем; синхронизировать `bossState.hp` там. Негативный тест: атака в сторону/за препятствием не повреждает; позитивный: реальное попадание пистолетом наносит урон.

3. **[ВАЖНО] [three-worlds-game/rift-story.mjs:290–306](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L290-L306), [three-worlds-game/rift-story.mjs:208–214](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/rift-story.mjs#L208-L214), [three-worlds-game/creature-brain.mjs:20–35](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/creature-brain.mjs#L20-L35) — сопровождение обходится одиночным подходом героя.** Переход после «Помочь» проверяет только XZ/Y игрока и принудительно переносит гостя рядом в следующий мир; финальный reward тоже проверяет только игрока. `stepBrain` прекращает follow при `d>=25` и идёт со скоростью 0.7 м/с, так что герой способен оставить спутника далеко. **Сценарий:** игрок убегает без гостя, касается разлома, гость телепортируется и квест выдаётся; потом игрок снова без него касается маркера и получает награду. Противоречит §21.15/§21.25 «оба входят», «один не дойду». **Исправление:** перед обоими переходами требовать физическую близость `guest.mesh.position` к нужному порталу и `guest.brain.relation==='friend'`, иначе ожидать NPC; сохранить достижимый follow/recovery режим без автотелепорта как ложного прохождения. Пример проверки:
   ```js
   const guestAt = guest && guest.brain.relation === 'friend' &&
     Math.hypot(guest.mesh.position.x - target.x,
                guest.mesh.position.z - target.z) < 1.8;
   if (!guestAt) return;
   ```
   Browser negative: игрок у портала, гость >20 м — перехода и награды нет.

4. **[ВАЖНО] [three-worlds-game/sunken-guest.mjs:8–39](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/sunken-guest.mjs#L8-L39), [three-worlds-game/sunken-guest.mjs:47–51](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/sunken-guest.mjs#L47-L51), [three-worlds-game/ash-quest-props.mjs:30–62](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/ash-quest-props.mjs#L30-L62) — оригинальные GLB удаляются из scene без освобождения загруженной геометрии/текстур.** Новый `sunken-guest` вызывает `GLTFLoader.parse` на каждом таком госте, а `dispose()` уничтожает только клонированные материалы; загруженный `root` и его `geometry` / карты не обходятся. `ashQuest.dispose()` тоже не освобождает уникальный GLB голубого кристалла; `createRiftStory` вызывается повторно из `buildWorld`. **Сценарий:** несколько циклов гостей/перезапусков пополняют WebGL-ресурсы без явного dispose, риск роста GPU-памяти и просадки FPS на телефоне. **Исправление:** в `dispose` обойти собственные `gltf.scene` Mesh, один раз освободить все уникальные `geometry`, `material` и `isTexture` material-map объекты (`Set` от повторов), остановить и `uncacheRoot` mixer; отдельно защитить асинхронный callback после `dispose`. В коротком повторяемом тесте проверять `geometry.dispose`/texture disposal spy, а в live Chromium — стабильные `renderer.info.memory.geometries/textures` за 3+ арки.

5. **[ВОЗМОЖНО] [three-worlds-game/living-population.mjs:40–55](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/living-population.mjs#L40-L55), [three-worlds-game/living-population.mjs:100–104](https://github.com/mpaykin1/meta6/blob/ccd3055845be9301bdd879fc607191ea2918c85a/three-worlds-game/living-population.mjs#L100-L104) — множество `harvested` не ограничено размером при бесконечных 42-метровых секторах.** На каждом новом секторе до 20 ключей собранного оружия остаются в `Set` без вытеснения; новый архипелаг расширяет область путешествий. **Сценарий:** при долгой игре с посещением тысяч регионов CPU/RAM растёт пропорционально всем когда-либо посещённым и обобранным секторам. **Как проверить:** пробегать 1000+ уникальных секторов с подбором и снимать `heapUsed`/размер набора; при подтверждении ограничить LRU только при сохранённом состоянии добычи (не возвращать собранные предметы при повторном посещении).

## Подтверждённое и исключённое из замечаний

- Целевой `main` = `ccd3055845be9301bdd879fc607191ea2918c85a`; `17e4c189..ccd3055` содержит 27 коммитов. Три пепельных острова (-220/-360/-500), высоты и тесты изучены. Кристалл — исходный `weather_storm_crystal.glb`, вышка — исходный `water_tower`; не самодельные заменители.
- `GUEST_ROSTER` теперь содержит оригинальные исходные роли ash/island/sunken; `sunken-guest.mjs` действительно загружает `angler`. Старое замечание 089 «нет Sunken runtime» не повторяется. Кодовая проверка реестра не равна живой проверке всех трёх гостей.
- Пятикратное появление/5-секундный рост щели вынесены в `rift-visibility.mjs`, есть live browser test. Старые исправленные 089 «портал вне кадра», «не растёт warning» не повторяются.
- Старый нерешённый вопрос exact source parity `.npc-say` уже записан в `089-audit.md` и `092-source-parity-guard-pr134-review.md`; здесь не дублируется.
- `docs/ACCEPTED_BEHAVIORS.md` отдельно оставляет A01/A05/A06/A08/A09/A10 в статусе OPEN целиком или частично; зелёные Node/Chromium тесты не являются OWNER PASS. Новый `owner-a01-a10-a11-guest-live-browser.mjs` и постоянный gate изучены по исходникам.

## Границы проверки

**Сделано:** GitHub compare, чтение текущего main + инструкций и §27, изучение затронутого runtime, моделей-реестров и тестов, сверка предыдущих аудитов 031/075/089 и handoff 091/092. **НЕ делал:** локальный npm/node/Playwright/GPU запуск, физический iPhone, измерение FPS/VRAM, проверку CI SUCCESS на точном SHA (REST status возвращает pending без отдельных статусов), визуальную паритетность оригинальных ассетов, решение владельца PASS/FAIL. Изменений игры, PR и автозадач нет; единственная запись — этот аудит на `handoff`.
