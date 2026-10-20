type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/140
stage: §21.17 models-lab preview performance
time: 2026-10-20T13:55:00Z

Заменяет 095: новый HEAD_SHA 972ff1d445808a0366202bc143ac23a89c818b32.
MAIN_SHA: 70387f4fc79ade07070713cb32e5172cd1f22016.

Следующий один lab-only шаг:
- Playwright Chromium / SwiftShader циклически показывает 64 atlas cells в течение 180 RAF;
- пишет 179 реальных интервалов, frame-time p50/p95 и FPS p50/p95 в scout-render.json;
- метрики явно называют это lab-preview, не игровым FPS;
- game FPS p50/p95 и visual parity остаются UNKNOWN;
- модель не подключена к игре, гостям или MANIFEST.

Проверь exact HEAD, CI и artifact JSON. REVIEW OK/CHANGES только для этого SHA; promotion не запрашивается.
