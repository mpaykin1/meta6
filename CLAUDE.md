## THREE-WORLDS — объединение «Остров сумерек» + «Пепельный путь» + «Затонувший город»

Пароль `three-worlds`: сначала прочитать [three-worlds.md](three-worlds.md) и [docs/THREE_WORLDS_MERGE_RU.md](docs/THREE_WORLDS_MERGE_RU.md), затем [graf.md](graf.md) §27 (HARD FAIL: никаких самодельных спутников, новых экранных кнопок, вода только как вход в проходимый мир). Это дизайн, не вердикт владельца.

## WEATHER — принятая GRAF 3D-погода (OWNER PASS, 2026-10-17)

Для задач «погода», «листопад», «лепестки», «светлячки» и нового атмосферного освещения **сначала прочитать [weather.md](weather.md) и [graf.md](graf.md) §27**. Автономный 3D HTML с 11 режимами и одной кнопкой доступен в [weather-showcase-graf-20261017/](weather-showcase-graf-20261017/); постоянная страница: https://mpaykin1.github.io/meta6/weather-showcase-graf-20261017/ . Владелец подтвердил PASS **только Weather Lab**, уроки зафиксированы в [docs/SUCCESS_WEATHER_LAB_2026-10-17.md](docs/SUCCESS_WEATHER_LAB_2026-10-17.md). Не менять Observer World V7. При переносе FX в Three.js использовать один штатный renderer, не копировать второй loop. iPhone 11 аппаратно не тестировался.

## FIX — обязательное правило статичного экрана (незакрытый блокер)

Если пользователь говорит **fix**, «закрепи экран», «экран тянется», «статичный экран», «неподвижная камера» или агент меняет игровое управление, **сначала прочитать [fix.md](fix.md)**. Быстрый публичный адрес: https://mpaykin1.github.io/meta6/fix/ . Это сквозной контракт для всех игр. Пользователь поставил **PASS всем остальным компонентам подводной игры**, но **не принял закрепление экрана**. Проверка одного `scrollY===0` или `overflow:hidden` — недостаточна: отдельно обязательно проверить камеру и неподвижность мировых ориентиров при джойстике. Нельзя автоматически закрывать FIX либо записывать его PASS/FAIL до решения владельца. Исправление ведётся на принятых исходниках; никаких дублирующих автозадач.

## EVOLVE — универсальное саморазвитие технологий

При задачах ежедневного развития графики, анимации, ассетов и оптимизации любой игры обязательно прочитай [**evolve.md**](evolve.md) вместе с [graf.md](graf.md). Короткий пароль для всех агентов: **evolve**. Это общий GitHub-контракт для Claude, ChatGPT, Codex, OpenCode, OpenHuman; расписание 02:00 Asia/Tbilisi только после реальной настройки и тестового запуска. Не создавать шестую AKA-задачу; сохранять 50/50 CLEAN_SERVER/GRAPHICS, текущие контракты и owner-only PASS/FAIL.

# Claude / Codex — canonical game entrypoint
## GRAF — обязательный стандарт графики всех наших игр

**GRAF v1.2 — ЖЁСТКИЕ ИНВАРИАНТЫ (читай полный [graf.md](graf.md)):** единую процедурную 3D + GLB/glTF фабрику с экспортом анимированных 2D/2.5D и HybridLOD использовать при создании графики; миры с ландшафтом обязаны иметь **неплоский объёмный рельеф и бесконечный бесшовный seeded chunk streaming** во все направления (без края/пустоты/сквозных швов), bounded RAM/GPU; на телефоне canvas/viewport статичен, joystick **двигает героя, не страницу/мир/камеру**, Eye/map drag отдельный. Для каждой игры иметь проверяемые touch tests, world traversal tests и FPS p95/perceptual guard; отсутствие live-тестов не PASS. Референсы фиксированного экрана: https://openttdonline.com/play/ и https://micropolisweb.com/ . Короткая команда: `graf mpaykin1/meta6`. Принятые версии не ломать.

При любом создании, улучшении, переносе, оптимизации или ревью **графики и анимации** сначала полностью прочитай [**graf.md — Hybrid 2D / 2.5D / 3D**](graf.md). Это единый публичный стандарт для Claude, Codex, ChatGPT и других AI; применять к любой игре с учётом принятого baseline и её стилистики. Для гибридного MVP обязательны одновременно анимированные 2D, 2.5D и 3D персонажи и объекты; PASS/FAIL назначает только владелец. Не считай появление документа доказательством выполнения графической интеграции.


**CURRENT ACCEPTED GAME: Observer World V7 — OWNER PASS (2026-10-16)**

- Live: https://mpaykin1.github.io/meta6/observer-world-en-v7/
- Full V7 development guide: [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md)
- Complete source catalog: [SOURCE_INDEX.md](SOURCE_INDEX.md)
- Machine-readable version index: [game-source-index.json](game-source-index.json)
- Official user PASS evidence: [docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md](docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md)
- Technical CI green: https://github.com/mpaykin1/meta6/actions/runs/38896347402

Repository visibility has been confirmed **PUBLIC**. You can read the sources from a new chat or Claude session without asking the user to re-upload files. Public access does **not** confer push privileges: write access still requires separately authorized GitHub account permissions. Do not modify the owner's accepted V7 directly; start V8 or a reviewable PR for future changes.


## CURRENT DEVELOPMENT TARGET: V7 smartphone game (2026-10-16)

**Live URL:** https://mpaykin1.github.io/meta6/observer-world-en-v7/

**Full guide to the current source:** [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md).

The owner has accepted the V5 graphics and the portrait HUD mockup. The V7 mobile implementation uses that original Three.js game with `mobile-controls.js`, `mobile-controls.css` and `editor.js`. **Phone only:** joystick and 3 right pixel buttons (weapon swap, hammer build, combined jump+attack/fire), scrollable bottom glyph toolbar. Tap near the character to choose a building site, press hammer; native tree destruction and support plinths clear terrain, overlapping buildings forbidden. PC keyboard/mouse logic remains from V6.

**Verified automated Chrome/WebGL test:** https://github.com/mpaykin1/meta6/actions/runs/38896347402. **OWNER PASS = ACCEPTED 2026-10-16** for V7 (explicit user verdict); Chrome touch simulation technical PASS is separate.

Do not tell the user to reupload source; read this public repository. For GitHub changes, Claude needs an authorized connected GitHub account. Keep accepted V5, V6 and V7 unchanged; create V8 for future development.

## Current V6 gameplay implementation (2026-10-16)

**The owner's visual approval is V5; V6 adds historical gameplay without touching the original perspective camera.**

- [Open playable V6](https://mpaykin1.github.io/meta6/observer-world-en-v6/)
- [V6 code and complete source map](observer-world-en-v6/CLAUDE.md)
- [36 original-atlas building architectures](observer-world-en-v6/building-assets.js)
- [16 animated character roles](observer-world-en-v6/npc-catalog.js)
- [NPC fighting, companions, betrayal, hero death and New rebirth](observer-world-en-v6/combat-relations.js)
- [Causal history and full-screen reading](observer-world-en-v6/story-system.js)
- [V6 tests](.github/workflows/observer-v6-gate.yml)

Keep V5 untouched as approved visual reference. Use V6 as the game currently being developed. The user should not need to re-upload files in any chat. Writing changes still requires connected GitHub permissions.

# CLAUDE — meta6 / Observer World

This repository contains multiple game editions. The **current exact-reference implementation** is [Observer World V5](observer-world-en-v5/).

**IMPORTANT:** The owner provided the full original HTML “Остров сумерек (1)(5).html” (SHA-256 `fdbda0240b53f49d6e34aa0965531856e31a0154f4a12339e1682d60d5fe5c1f`) and its screenshot. The intent is to use the **exact original Three.js 3D renderer and camera**, NOT to approximate it using a separate 2D painter. The full game and existing physics must remain editable and reproducible.

Start here: [observer-world-en-v5/CLAUDE.md](observer-world-en-v5/CLAUDE.md).

Source of the running 3D game, all shaders, terrain, water, camera, effects, enemies, weapons and original sounds: [observer-world-en-v5/index.html](observer-world-en-v5/index.html). Editor and bottom buttons: [observer-world-en-v5/editor.js](observer-world-en-v5/editor.js). Additional Krieger music: [observer-world-en-v5/audio.js](observer-world-en-v5/audio.js).

Original source archives: [expanded original](observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html) and [first original](observer-world-en-v4/reference/ostrov-sumerek-original.html).

The owner requires all non-building controls in a collapsible menu, bottom row for placement of historical objects, and game viewport otherwise mostly unobscured.

Live version: https://mpaykin1.github.io/meta6/observer-world-en-v5/

Technical gate: [V5 CI](.github/workflows/observer-v5-gate.yml); requires original camera code unchanged and actual WebGL building placed in headless Chrome. **Visual equivalence to screenshot, iPhone sound, AI integration, full history are NOT owner-PASS.** Never assert they are done merely because CI is green.

All game source links: [SOURCE_INDEX.md](SOURCE_INDEX.md) and [game-source-index.json](game-source-index.json).

Do not overwrite previous accepted V2–V4; do not use paid APIs or print tokens; do not merge speculative breaking code without tests and owner's PASS.

## New connected underwater game — active integration (16–17 October 2026)

Source of truth for the new project: [underwater-world/CLAUDE.md](underwater-world/CLAUDE.md); [current game source](underwater-world/index.html); [seeded underwater world engine](underwater-world/underwater-runtime.js); [real Sunken City 3D models](underwater-world/models/); [procedural asset generator](underwater-world/generator/src/). Owner task and release rule: [World_server issue #522](https://github.com/mpaykin1/World_server/issues/522); implementation [PR #3](https://github.com/mpaykin1/meta6/pull/3).

The game is an extension of accepted V7; original land gameplay, 21-weapon arsenal, camera and building editor must remain. Underwater mobile **lower button = ascend only**, middle button = attack with a legitimately picked ranged weapon when aboard bathyscaphe, upper weapon-swap button = enter/exit bathyscaphe. Hold jump / Space to rise and release to sink. No mobile touch overlay on desktop (WASD, arrows, Space, mouse/touchpad LMB/RMB). Fixed phone viewport, infinite deterministic chunks, distinct ghost quests and non-constant combat.

The release workflow uses `.github/workflows/twilight-browser-smoke.yml` and `.github/workflows/build-twilight-sunken-assets.yml`; store screenshots under `underwater-world/evidence/` as CI artifacts and report visible gameplay coverage. **DO NOT issue a public test link before the published route, mobile + PC browser QA, visual difference >85%, and source asset loading have been verified. Never record owner PASS or FAIL without explicit user decision.**

Primary integrator modifies runtime/terrain/controls; parallel Codex lane modifies only `underwater-world/quests/`, `underwater-world/creatures/`, `underwater-world/docs/CODEX_HANDOFF.md`; retain non-overlapping work until reviewed integration. Current game progress is tracked via GitHub, not chat memory.

## ISLAND-BIOMES — независимые миры Острова сумерек (owner verdict pending)

Пароль `island-biomes` / «биомы острова»: сразу открыть [корневой alias](island-biomes.md), [исходный Three.js HTML](island-sumerek-biomes/index.html) и [правила разработки](island-sumerek-biomes/README.md). Это публичный источник для новых чатов Claude, Codex и ChatGPT; никакой повторной загрузки. Игровой маршрут: https://mpaykin1.github.io/meta6/island-sumerek-biomes/ . Исходная Observer World V7 не изменена. Все технические тесты и коммиты не означают решения владельца PASS/FAIL.

**GRAF v1.2 MOBILE CANON — OVERRIDES PREVIOUS STATIC-CAMERA ASSUMPTION:** читай [graf.md](graf.md) §26 и [docs/graf-mobile-follow-camera.md](docs/graf-mobile-follow-camera.md). Эталон пользовательского управления «Остров сумерек(7).html»: на телефоне левый floating joystick двигает персонажа camera-relative; независимый правый pointer вращает yaw/pitch камеры; камера ПЛАВНО **сопровождает персонажа** по его world position + velocity lead, collision-safe и damping; HTML page/canvas/HUD остаются неподвижными, stick pointer не управляет панорамой напрямую. Кнопки действий только **разные уникальные пиксель-арт пиктограммы**, никакого видимого текста на кнопках; aria-label нужен; не менять утверждённое размещение кнопок. E2E: joystick 10s, camera follows hero while canvas rect unchanged and scroll=0, dual touch stick+camera and stick+action, no FPS regression; physical iPhone11 отдельно от browser emulation. Не путать fixed viewport с неподвижной 3D камерой. Это обязательно для всех игр с персонажем, включая будущие и текущие при редактировании.
