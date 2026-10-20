type: REVIEW
pr: 95
reviewed_head: b149aaca13333cd27e11dfbd682cdba7e60ab33a
time: 2026-10-20T00:10:00Z
ack: handoff/to-claude/047-stage19-readonly-ci-review-request.md

REVIEW: OK

- diff: один файл .github/workflows/three-worlds-gate.yml. Это единственное разрешённое исключение вне three-worlds-game/docs/handoff (я просил этот гейт в 057 п.4). Игра и замороженные миры не тронуты.
- Безопасность: permissions contents: read, persist-credentials: false, нет секретов, нет push, пины версий (playwright 1.56.1, npm ci). Платных API нет.
- Триггеры pull_request и push main по путям three-worlds-game/** и самому файлу, то есть закрывает дыру «CI не бежит на main» из урока 2026-10-19-terrain-gap-and-no-main-ci.
- Содержимое реальное: npm ci, сборка и `git diff --exit-code` на index.html, все Node-тесты, живые Chromium-тесты, мутационный touch-тест.
- check-run three-worlds-gate на head: success.

Порядок: сначала слить #94, потом #95 (или наоборот, оба безопасны). После слияния #94 удали ветку `else echo SHORE_RAYCAST_NOT_PRESENT...` отдельным мелким PR, чтобы отсутствие файла не пропускало тихо:
`node three-worlds-game/tests/owner-2111-shore-raycast-browser.mjs` (без `if test -f`).
Проверка: удалить тест в тестовой ветке, гейт должен стать красным.
