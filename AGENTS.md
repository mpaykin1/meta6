## REUSE — сначала найди готовое, потом пиши (обязательное правило для всех AI)

Перед написанием любого кода **сначала найди в репозитории готовую реализацию** в играх владельца — «Остров сумерек» = ТОЛЬКО версия владельца: https://claude.ai/code/artifact/b94ef394-100a-4e31-83f2-b52447e074ea (копии в репозитории `island-sumerek-biomes` и `observer-world-*` — другие ветки, они НЕ эталон), «Затонувший город» (`underwater-world/`, `reference/sunken-city/`, `three-worlds-game/models/`), «Пепельный путь» — и **переиспользуй её без переписывания**: бой, 21 оружие, камеру, управление, врагов, модели, звук. Новый код пиши только там, где нигде нет готового. Дублировать уже работающее запрещено; вместо этого подключай или переноси исходный код как есть. Принятые версии не ломать.

## ИСТОЧНИК ОТ ВЛАДЕЛЬЦА — главнее всего

Если владелец дал ссылку на артефакт или файл, это ЕДИНСТВЕННЫЙ источник. Запрещено подменять его «похожей» версией из репозитория или памяти. Перед началом работы: прочитать именно эту ссылку и в первой строке ответа написать, какой источник взят и 3 его отличительных признака (например: выбор героя, реликвии, жители). Если ссылку прочитать не удалось, остановиться и сообщить, а не брать другую версию. После работы сверить результат с этими признаками.

## ПЕРЕНОС МИРОВ — переносить ВСЁ, ничего не пересоздавать

Когда мир/биом/персонажа из одного артефакта или игры переносят в другую, берутся ИСХОДНЫЕ файлы (.glb, showcase.json, текстуры, звуки) целиком, через копирование файлов из исходного артефакта. Запрещено заменять их перекраской текстур, процедурными «похожими» объектами или общим генератором.
Перед началом: составить список всего, что есть в источнике (постройки, существа, рыбы, транспорт, батискаф, свет, звук). После переноса: сверить список по пунктам и в отчёте написать, что перенесено, чего нет. «Готово» писать только когда в списке не осталось пропусков.

## ПЕРЕЧЕНЬ ОБЪЕКТОВ — только из открытого источника, не по памяти

Список объектов, персонажей, оружия, моделей и эффектов любой игры составляется ТОЛЬКО после того, как источник открыт и прочитан целиком в этой сессии (артефакт через Artifact read, файлы через чтение/grep/скрипт). Запрещено составлять список по памяти, по «заметкам» или по прошлым чатам.
Список вытаскивать скриптом из самого источника (ключи в showcase.json, имена .glb, таблицы вроде WEAPONS/FOE/BIOME_DEFS, тайлы), а не пересказывать. Сохранить результат файлом docs/INVENTORY_<игра>.md с датой, id/ссылкой источника и числом пунктов по каждой категории.
Фразы «проверьте по оригиналу», «возможно не всё» и «список по заметкам» запрещены: проверка — работа агента, не владельца. В отчёте писать числа: «в источнике N, перенесено N, не перенесено M — вот что и почему».

## НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ — перенос это добавление, а не замена

Делать только то, что владелец прямо просил. Идеи «заодно улучшить» или «заменить» запрещены, пока владелец не одобрил их словами.
Неприкосновенны, если их не просили менять: герой «Острова сумерек», 20 видов оружия и кулаки (21 позиция), управление, камера, HUD, физика, враги базовой игры. Перенос мира, биома или врагов из другой игры только ДОБАВЛЯЕТ их в базовую игру. Герой, оружие и механики базы остаются как есть. Оружие и персонажи из другой игры появляются только как предметы или NPC в мире, если владелец не сказал иначе.
Перед началом работы: написать одной строкой, что МЕНЯЕТСЯ и что НЕ ТРОГАЕТСЯ. Если в плане есть пункт, которого владелец не просил, вычеркнуть его до начала кода, а не после того, как владелец заметил.

## THREE-WORLDS — объединение «Остров сумерек» + «Пепельный путь» + «Затонувший город»

Пароль `three-worlds`: сначала прочитать [three-worlds.md](three-worlds.md) и [docs/THREE_WORLDS_MERGE_RU.md](docs/THREE_WORLDS_MERGE_RU.md), затем [graf.md](graf.md) §27 (HARD FAIL: никаких самодельных спутников, новых экранных кнопок, вода только как вход в проходимый мир). Это дизайн, не вердикт владельца.

## WEATHER — принятая GRAF 3D-погода (OWNER PASS, 2026-10-17)

Для задач «погода», «листопад», «лепестки», «светлячки» и нового атмосферного освещения **сначала прочитать [weather.md](weather.md) и [graf.md](graf.md) §27**. Автономный 3D HTML с 11 режимами и одной кнопкой доступен в [weather-showcase-graf-20261017/](weather-showcase-graf-20261017/); постоянная страница: https://mpaykin1.github.io/meta6/weather-showcase-graf-20261017/ . Владелец подтвердил PASS **только Weather Lab**, уроки зафиксированы в [docs/SUCCESS_WEATHER_LAB_2026-10-17.md](docs/SUCCESS_WEATHER_LAB_2026-10-17.md). Не менять Observer World V7. При переносе FX в Three.js использовать один штатный renderer, не копировать второй loop. iPhone 11 аппаратно не тестировался.

## FIX — обязательное правило статичного экрана (незакрытый блокер)

Если пользователь говорит **fix**, «закрепи экран», «экран тянется», «статичный экран», «неподвижная камера» или агент меняет игровое управление, **сначала прочитать [fix.md](fix.md)**. Быстрый публичный адрес: https://mpaykin1.github.io/meta6/fix/ . Это сквозной контракт для всех игр. Пользователь поставил **PASS всем остальным компонентам подводной игры**, но **не принял закрепление экрана**. Проверка одного `scrollY===0` или `overflow:hidden` — недостаточна: отдельно обязательно проверить камеру и неподвижность мировых ориентиров при джойстике. Нельзя автоматически закрывать FIX либо записывать его PASS/FAIL до решения владельца. Исправление ведётся на принятых исходниках; никаких дублирующих автозадач.

## EVOLVE — универсальное саморазвитие технологий

При задачах ежедневного развития графики, анимации, ассетов и оптимизации любой игры обязательно прочитай [**evolve.md**](evolve.md) вместе с [graf.md](graf.md). Короткий пароль для всех агентов: **evolve**. Это общий GitHub-контракт для Claude, ChatGPT, Codex, OpenCode, OpenHuman; расписание 02:00 Asia/Tbilisi только после реальной настройки и тестового запуска. Не создавать шестую AKA-задачу; сохранять 50/50 CLEAN_SERVER/GRAPHICS, текущие контракты и owner-only PASS/FAIL.

# Coding agent handoff — `mpaykin1/meta6`
## GRAF — обязательный стандарт графики всех наших игр

**GRAF v1.2 — ЖЁСТКИЕ ИНВАРИАНТЫ (читай полный [graf.md](graf.md)):** единую процедурную 3D + GLB/glTF фабрику с экспортом анимированных 2D/2.5D и HybridLOD использовать при создании графики; миры с ландшафтом обязаны иметь **неплоский объёмный рельеф и бесконечный бесшовный seeded chunk streaming** во все направления (без края/пустоты/сквозных швов), bounded RAM/GPU; на телефоне canvas/viewport статичен, joystick **двигает героя, не страницу/мир/камеру**, Eye/map drag отдельный. Для каждой игры иметь проверяемые touch tests, world traversal tests и FPS p95/perceptual guard; отсутствие live-тестов не PASS. Референсы фиксированного экрана: https://openttdonline.com/play/ и https://micropolisweb.com/ . Короткая команда: `graf mpaykin1/meta6`. Принятые версии не ломать.

При любом создании, улучшении, переносе, оптимизации или ревью **графики и анимации** сначала полностью прочитай [**graf.md — Hybrid 2D / 2.5D / 3D**](graf.md). Это единый публичный стандарт для Claude, Codex, ChatGPT и других AI; применять к любой игре с учётом принятого baseline и её стилистики. Для гибридного MVP обязательны одновременно анимированные 2D, 2.5D и 3D персонажи и объекты; PASS/FAIL назначает только владелец. Не считай появление документа доказательством выполнения графической интеграции.


**Current owner-approved baseline:** Observer World V7 (PASS, 2026-10-16). Do not overwrite accepted V5/V6/V7 to pursue a new feature.

First read: [CLAUDE.md](CLAUDE.md) → [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md) → [SOURCE_INDEX.md](SOURCE_INDEX.md) and [game-source-index.json](game-source-index.json).

**Public playable V7:** https://mpaykin1.github.io/meta6/observer-world-en-v7/

**Complete game code** is under `observer-world-en-v7/`. All main Three.js renderer, animation, voxel island, shader, weapon physics and sound code resides in `index.html`. Interactions and modern modules live in `editor.js`, `mobile-controls.js`, `mobile-controls.css`, `building-assets.js`, `npc-catalog.js`, `combat-relations.js`, `story-system.js`, `audio.js`. Do not invent missing sources, ask for re-upload of files already in the repo, or substitute a generic 2D game for the user's accepted 3D graphics.

**PASS evidence:** [success record](docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md). **Chrome CI:** https://github.com/mpaykin1/meta6/actions/runs/38896347402. CI is a simulated touch/browser test and should not be described as a physical-device FPS benchmark.

**Desktop:** retain WASD, ПКМ build, ЛКМ attack. **Phone:** joystick left, three 25%-transparent action controls right, historical glyphs bottom, touch terrain → press hammer; don't damage accepted layouts. Rendering still uses the original Three.js scene.

All new development should occur in a new V8 directory, test branch or PR rather than silently replacing V7. No paid keys, no exposed secrets. A public repo permits reading, NOT GitHub writes; require the actual connected account permission to commit.

## ISLAND-BIOMES — независимые миры Острова сумерек (owner verdict pending)

Пароль `island-biomes` / «биомы острова»: сразу открыть [корневой alias](island-biomes.md), [исходный Three.js HTML](island-sumerek-biomes/index.html) и [правила разработки](island-sumerek-biomes/README.md). Это публичный источник для новых чатов Claude, Codex и ChatGPT; никакой повторной загрузки. Игровой маршрут: https://mpaykin1.github.io/meta6/island-sumerek-biomes/ . Исходная Observer World V7 не изменена. Все технические тесты и коммиты не означают решения владельца PASS/FAIL.

**GRAF v1.2 MOBILE CANON — OVERRIDES PREVIOUS STATIC-CAMERA ASSUMPTION:** читай [graf.md](graf.md) §26 и [docs/graf-mobile-follow-camera.md](docs/graf-mobile-follow-camera.md). Эталон пользовательского управления «Остров сумерек(7).html»: на телефоне левый floating joystick двигает персонажа camera-relative; независимый правый pointer вращает yaw/pitch камеры; камера ПЛАВНО **сопровождает персонажа** по его world position + velocity lead, collision-safe и damping; HTML page/canvas/HUD остаются неподвижными, stick pointer не управляет панорамой напрямую. Кнопки действий только **разные уникальные пиксель-арт пиктограммы**, никакого видимого текста на кнопках; aria-label нужен; не менять утверждённое размещение кнопок. E2E: joystick 10s, camera follows hero while canvas rect unchanged and scroll=0, dual touch stick+camera and stick+action, no FPS regression; physical iPhone11 отдельно от browser emulation. Не путать fixed viewport с неподвижной 3D камерой. Это обязательно для всех игр с персонажем, включая будущие и текущие при редактировании.
