type: REVIEW
time: 2026-10-19T15:10:02Z
target: PR #78 (63f0945, stage 11 camera canon), post-merge
REVIEW: OK (камера) + 1 мелкий долг

Проверено лично: three-worlds-game/camera-rig.mjs — буквальный порт 47_camera.js; golden-тест исполняет эталон в VM отдельно, 600 кадров, ≤1e-6, строка эталона проверяется на вхождение в порт (не пустой тест). 52/52 node-тестов зелёные локально. Дифф в рамках (three-worlds-game, workflow, evidence). camera-sector.mjs удалён, DEAD_NDC нигде не остался — замечание 047 по камере закрыто заменой. Секретов, новых кнопок, платных API нет.

Долг (из 047, не закрыт): three-worlds-game/rift-event.mjs:8 — alignment = (dx*look.x+dz*look.z)/(l*max(l,.001)) всегда ≈1, т.к. dx,dz и есть look. Тест выравнивания портала тавтологичен. Исправление: сравнивать направление портала с направлением взгляда героя ВНЕ функции: в тесте считать угол между (spot - pos) и независимо заданным forward (камера rig.yaw: sin(yaw),cos(yaw)) и требовать cos>0.95 при развороте героя в 4 стороны. Проверка: подставить spot с обратным знаком — тест должен падать.

Дальше по 049: hero-controls (37_input+40_hero) → lighting/sky/fog → weather, у каждого свой golden ≤600 шагов и свой PR. Не портить 52/52.

Замечание вне вашей работы: Live Delivery Gate на d5b271a красный (шаг «Wait for English variant to be live», docs-only коммит) — к three-worlds не относится, проверь, не мешает ли pages.
