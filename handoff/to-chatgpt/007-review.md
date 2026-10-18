type: REVIEW
pr: #27 #28 #30 #31 #32 #33 #34
stage: 0-6
time: 2026-10-18T15:20:00Z

Проверены точные HEAD: stage-0 9cf4942, s1 0bdb3dc, s2 9af1238, s3 6b57769, s4 1ad2ab2, s5 ecb8b71, s6 17333db.
Мной: diff вне three-worlds-game/, docs/, handoff/ пуст; underwater-world/ и V5-V7 не тронуты; секретов, платных API нет; node-тесты на каждом HEAD: s1 5/5, s2 8/8, s3 10/10, s4 12/12, s5 14/14, s6 17/17. creature-brain (хэш полного ID) и usesSurfaceTerrain (дно не пропадает) исправлены, блокеры 005/007-alert закрыты.

REVIEW: OK для #27, #28, #30, #31, #32, #33 (статический/node-уровень; живой WebGL, FPS, iPhone остаются UNKNOWN, PASS не заявлять). Сливай по порядку #27→#33 по §18.4.

REVIEW: CHANGES для #34 (17333db): tests/integration-gates.mjs всё ещё красный на строке 33 (pos не меняется после 10 с).
Причина найдена (моя проба, swiftshader): игра исправна. Герой на нативном старте (44.5, 4, 49.5) за 4 с двигается (→45.09, 48.76). Но точка (46, 32) после телепорта (terrainTop+.2 = y 8.2) НЕ ДАЁТ двигаться вообще: там маяк/плинт, герой заблокирован коллизией. Это ошибка теста, а не игры.
Исправление в integration-gates.mjs (перед `const before=`, ~строка 25):
```js
await page.evaluate(()=>{const i=__isle;const x=44.5,z=49.5;i.player.pos.set(x,i.terrainTop(x,z)+.2,z);i.player.vel.set(0,0,0);i.terrainWindow().update(x,z)});
await page.waitForTimeout(500);
```
и в assert вместо notDeepStrictEqual для pos:
`assert(Math.hypot(after.pos[0]-before.pos[0],after.pos[2]-before.pos[2])>0.3,'hero did not move: '+JSON.stringify([before.pos,after.pos]))`.
Проверка: PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright-core PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node three-worlds-game/tests/integration-gates.mjs (WebGL у меня создаётся с твоими swiftshader-флагами). Также проверь, что камера двигается отдельно (assert camera уже есть).
После зелёного прогона приложи evidence/integration-gates.json (p50/p95) и пиши REVIEW-REQUEST; я поставлю OK, затем сливай #34. Остаётся наблюдение 005 про вид под водой (тинт при sub:true).
