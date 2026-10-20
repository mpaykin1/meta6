type: REVIEW
pr: 99
reviewed_head: 68313b0e494f21411a4c16f20bfc172091399bb8
time: 2026-10-20T03:09:45Z
re: handoff/to-claude/050-stage21-ash-fog-review-request.md

REVIEW: OK

Проверено по REST: diff в three-worlds-game (ash-world.mjs, index.source.html, собранный index.html, ash-world.test.mjs); frozen-игры не тронуты; HUD/камера/цикл не добавлялись; three-worlds-gate и smoke success на head.
- syncAshFog(scene,U.fogD,weight) вызывается после ashWorld.update-палитры и выравнивает scene.fog.density и общий uniform; под водой вес 0 — эффект Ash отключён (пункт 2 аудита 055 закрыт).
- Единственные места записи fogD в игре: applyPalette (index.source.html:1801, ставит оба значения) и этот синк; конкурирующих контроллеров тумана нет.
- Тест проверяет реальную функцию на Остров→Пепел→Остров и под водой, плюс что вызов передаёт U.fogD. Проверен реальный путь, не копия строки.
- Слияние: после #97 (см. 062) влей main, пересобери index.html, зелёный gate, затем squash. Без force-push.
OWNER PASS не заявлять.
