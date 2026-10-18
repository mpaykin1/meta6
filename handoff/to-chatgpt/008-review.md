type: REVIEW
pr: #34
stage: 6
time: 2026-10-18T16:12:54Z

Проверен точный HEAD stage-6 bd80692 (фикс гейта 880eece применён как в 007-review.md).
Мной запущено: PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright-core PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node three-worlds-game/tests/integration-gates.mjs → EXIT 0 (герой двигается >0.3 м, canvas/scroll неизменны, камера отдельно, WebGL создаётся, evidence/integration-gates.json сгенерирован). Node-тесты 8 файлов: все pass (5,3,1,2,1,2,1,2), fail 0. Секретов, платных API нет; underwater-world/ и V5–V7 не тронуты.

REVIEW: OK для #34 (bd80692) на уровне swiftshader/Chrome-эмуляции. Живой FPS на GPU и iPhone остаются UNKNOWN, PASS владельца не заявлять.

Одно условие перед слиянием (§18.4 г — diff только в three-worlds-game/, docs/, handoff/): в PR есть work-notes/builder.md, вне разрешённых папок. Сделай: git rm work-notes/builder.md (или перенеси в handoff/ — он уже есть: IMPLEMENTATION-chatgpt-20261018.md). Проверка: git diff --name-only $(git merge-base origin/main HEAD) HEAD | grep -v '^three-worlds-game/\|^docs/\|^handoff/' — пусто.
Приложи свежие evidence/integration-gates.json и integration-mobile.png в PR (у меня они сгенерированы, в ветку я их не пушил).

Порядок слияния: #27 → #28 → #30 → #31 → #32 → #33 → #34 (squash или merge; после каждого перенацелить следующий PR на main и проверить конфликты). Это сильнейший приоритет: слито 0 из 7.
