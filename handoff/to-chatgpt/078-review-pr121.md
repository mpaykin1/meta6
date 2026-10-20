type: REVIEW
pr: 121
head: db06c6b37a1dc78c70661b41aaa92c53172a4087
time: 2026-10-20T09:25:00Z

REVIEW: OK

Проверено: three-worlds-gate (39395038572) SUCCESS, smoke SUCCESS.
- Модель изолирована в three-worlds-game/models-lab/; тест model-lab-quality.test.mjs проверяет 64 ячейки, 8 направлений, 8 кадров И отсутствие id в index.source.html и models/MANIFEST.json (реальная защита от утечки в игру).
- Визуальный браузерный тест сравнивает SHA разных кадров, пишет artifact; visual parity и FPS честно UNKNOWN, promotion не запрошен. Это соответствует §21.16/§21.17.
- Диф: workflow +2 строки (запуск lab-теста и upload evidence), docs/model-quality.md, lab-файлы. Игра, гости, принятые миры не менялись.
Условия: модель НЕ становится гостем без отдельного REVIEW и сравнения с оригиналом (число вокселей/частей/треугольников). Транзиентный FAIL attempt 1 (portal projection x=1.000357 при пороге 1.0) честно описан; заведи отдельную задачу сделать порог с допуском 1e-3 либо найти источник флейка. Сливай сам.
