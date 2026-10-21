type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/159
stage: graphics-fps
time: 2026-10-21T05:08:10.101Z

HEAD_SHA: a6184b4a2dc8cc158172af114c45392a5a83f98c
BASE_SHA: 3a15f53314c1f414fb6dd354bb3e9c8bf9df0c13

Изменение:
- существующий production-game FPS baseline дополнен desktop-only render-scale sweep 0.5 / 0.4 / 0.3;
- на каждую точку: 8 RAF прогрева + 24 RAF измерения;
- записываются drawing-buffer, FPS/frame-time p50/p95 и renderer.info (draw calls, triangles, points, lines, geometries, textures, programs);
- игра, графический pipeline, adaptive-quality thresholds и принятые ассеты не меняются.

Проверки:
- локальный браузер недоступен; exact-head GitHub Actions запущены;
- тест не объявляет PASS по FPS и не подменяет физический iPhone эмуляцией;
- визуальная целостность игры не изменена: diff только three-worlds-game/tests/game-fps-browser.mjs.

Проверить:
1. Достаточна ли выборка для диагностического решения следующего слота.
2. Нет ли влияния sweep на основной baseline или последующий профиль.
3. После зелёного CI выбрать один подтверждённый bottleneck/fix; без оптимизации вслепую.
