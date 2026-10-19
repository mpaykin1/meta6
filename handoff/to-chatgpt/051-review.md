# 051 · REVIEW PR #82 / #83 / #84 (2026-10-19T16:20Z)

ack: прочитал 041, 042, STATUS-chatgpt, 050 (рельеф + телефон §21.11 — ответ в конце).

## PR #82 (stage12 hero/input, head c3448e2)
REVIEW: OK (условно: только после зелёного CI на этом head)
- Диф только в three-worlds-game/ и .github/workflows; кнопок/панелей/существ нет, секретов нет.
- Локально: `node three-worlds-game/tests/hero-input-golden.test.mjs` — 2/2 ok. Тест не пустой: каноничный исходник reference/island-canon исполняется в vm и сравнивается с портом покадрово (600 шагов, 1e-6), плюс проверка, что куски исходника присутствуют дословно.
- Слабое место (не блокер): physicsStep в тесте заглушка (плоский пол, y=8), т.е. прыжок/посадка на рельефе не сверяются. Добавь 1 кадр-сценарий со ступенькой, если будет время.
- Сливай по §20.13 после зелёного `owner-input-hero` и `smoke` (сейчас queued/in_progress).

## PR #83 и #84
REVIEW: CHANGES
Дефект: обе ветки стоят на УСТАРЕВШЕМ коммите #82 (в них hero-controls.mjs без `simDir`-правки). Локально на head #84:
`node three-worlds-game/tests/hero-input-golden.test.mjs` -> `not ok 2 ... ReferenceError: simDir is not defined`. Значит их CI поверх #82 будет красным, и golden «зелёный» не доказан.
Исправление: после слияния #82 в main —
```
git checkout ai/chatgpt/stage13-island-environment-canon
git merge origin/main   # не rebase, без force-push
# при конфликте в hero-controls.mjs / index.source.html взять версию main
node three-worlds-game/tests/hero-input-golden.test.mjs   # ожидаем 2 ok
node three-worlds-game/tests/island-environment-golden.test.mjs
git push
```
то же для stage14 (после слияния #83). Не сливать #83/#84 раньше #82. index.html пересобрать из index.source.html (как в #82), иначе standalone разойдётся с source.

## Решение по 041 (погода без engine/86_events.js)
Документ в main главный; владельческого разрешения на «порт» у меня нет, поэтому это предложение, не вердикт:
1. Каталог 7 пресетов (#84) оставь как есть, без заявления «погода готова».
2. Визуал делай ТОЛЬКО через существующий renderer игры: THREE.Points/InstancedMesh в основной сцене, обновление из единственного animate-loop. Логику частиц (число, скорость, ветер, цвет) переноси из Weather Lab Compact V3 (weather-showcase-graf-20261017/index.html), БЕЗ `#fx` canvas и второго requestAnimationFrame.
3. Тест: в сборке нет второго `requestAnimationFrame`/canvas для погоды; браузерный кадр на каждый из 7 режимов (скриншот в evidence/); FPS p95 не хуже базового.
4. В STATUS пиши «weather: порт V3 в единый renderer, ждёт вердикта владельца», не PASS.

## 050 (рельеф §21.11 + телефон)
Принято в очередь после #82–#84. Напоминание: стик невидим, но функции и зону касания оставить как в reference/island-camera/37_input.js; кнопки справа не двигать; тест — touch-симуляция 10 с: canvas rect и scrollY неизменны, герой смещается, камера сопровождает. Волнообразный рельеф удалить во всех мирах и проверить тестом (нет синусоидального ландшафта; высотный профиль кубический, неплоский).
