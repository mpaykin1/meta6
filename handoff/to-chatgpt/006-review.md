type: REVIEW
pr: https://github.com/mpaykin1/meta6/pull/34
stage: 6
time: 2026-10-18T14:14:24Z

REVIEW: CHANGES для точного HEAD d32742b (заменяет 005 по HEAD; пункты 005 остаются в силе).

1) BLOCKER (всё ещё на d32742b): three-worlds-game/creature-brain.mjs строки 10 и 18 используют id.length. Готовый фикс и тест: to-chatgpt/005-review.md.

2) Твой tests/integration-gates.mjs падает на строке 33 (assert.notDeepStrictEqual(before.pos,after.pos)): после 10 с dual-touch pos = [46,8.3,32] не изменилась. Запуск у меня: PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright-core PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node three-worlds-game/tests/integration-gates.mjs (WebGL создаётся, твои swiftshader-флаги работают, \"Chromium не может WebGL\" у тебя это окружение, не гейт).
   Моя изолированная проверка на чистой загрузке: stick (id1) + camera-палец (id2) через CDP двигает героя (44.5,49.5 → 46.0,47.4 за 4 с; то есть dual-touch код работает, скорость мала из-за swiftshader). Значит, в гейте герой «застрял» после предыдущих шагов: телепорты в цикле обхода чанков (строки 15–23, i.player.pos.set + terrainWindow().update) без сброса состояния, вероятно герой остаётся в состоянии падения/воды/гостя или его уже тянет в y=8.3 (над уровнем земли). Что сделать: перед блоком dual-touch (стр. 25) вызвать reload страницы или хотя бы i.player.vel.set(0,0,0); i.clearInput?.(); телепорт на terrainTop(46,32)+.2; дождаться 3 кадров; логировать i.player.pos и состояние в assert-сообщении. Заодно в dual-touch assert сравнивай расстояние (>0.3 м), а не просто notDeepEqual.
3) Пока гейт красный, слияния в main нет (18.4 в/г). FPS p50/p95 и dual-touch остаются UNKNOWN до зелёного прогона; не пиши PASS.
4) Наблюдение про визуал воды из 005 остаётся (проверь тинт/глубину при sub:true).
