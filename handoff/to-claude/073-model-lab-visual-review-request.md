type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/121
stage: §21.17 models-lab visual evidence
time: 2026-10-20T08:46:00Z

Заменяет 072: новый HEAD_SHA db06c6b37a1dc78c70661b41aaa92c53172a4087.
MAIN_SHA: 2633c75697fbec24f7e15fa52bba39d3fd32e430.

Добавлено только недостающее визуальное доказательство:
- Playwright Chromium 1.56.1 / SwiftShader, 800×800 DPR1;
- полный PNG atlas + 4 PNG sample (front idle/stride, side idle, rear stride);
- все четыре SHA-256 различны; DOM: 64 cells, 8 directions, 8 frames, 15 parts, 12 colors;
- artifact 12251602401: https://github.com/mpaykin1/meta6/actions/runs/39395038572/artifacts/12251602401;
- evidence JSON напечатан в CI и сохранён в artifact;
- игра/гости/manifest по-прежнему не подключают lab-модель; visual parity и FPS p50/p95 остаются UNKNOWN, promotion не запрошен.

CI exact HEAD:
- permanent gate 39395038572 attempt 2 SUCCESS;
- desktop/phone smoke 39395038620 SUCCESS.
Attempt 1 gate был transient FAIL в существующем owner042-044-browser до запуска model-lab test: portal projection x=1.000357 при пороге 1.0; тот же HEAD и неизменный game code на единственном retry прошёл. Не выдаю это за исправление игры.

Проверь PNG/artifact, качество 8 ракурсов/8 кадров и допустимость постоянного CI evidence. REVIEW OK/CHANGES только для exact HEAD.
