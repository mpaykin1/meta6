type: AUDIT
pr: none
stage: §21.8–§21.11, воксельный рельеф и тестовые доказательства
time: 2026-10-19T22:33:54.658Z
range: 37719bbe7cc6491253104f6ea156cd430cf7d5b1..0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f
focus: 2+3
main_sha: 0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f

# 042 — Независимый аудит: рельеф, швы, тесты (2+3)

**Итог: критичных 1, важных 2, мелких 1.** Статический read-only аудит 13 коммитов; это не OWNER PASS, не REVIEW: OK. На момент проверки текущий main = `0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f`.

## Подтверждённые замечания

1. **[КРИТИЧНО]** [three-worlds-game/underwater-runtime.js:96–110](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/underwater-runtime.js#L96), [three-worlds-game/index.source.html:4268–4273](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/index.source.html#L4268), [three-worlds-game/index.source.html:1868–1885](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/index.source.html#L1868). **В диапазоне внесена незаметная дыра рельефа на стыке суши и моря.** Поверхностный `terrainWindow` создаёт пустой `THREE.Group` для `cx>=4` при чанках 16 м, то есть для `x>=64`. Новый подводный генератор строит меш только при `cx*24>=64`, и потому целиком отбрасывает чанк `cx=2` (x=48…72), хотя ранее его клеточная версия пропускала только клетки `x<64`. Первый подводный меш начинается при x=72. **В результате при x∈[64,72), например x=68,z=32, игровая коллизия `terrainTop()` существует, но ни один из двух генераторов не рисует пол.** Графический обрыв/видимая пустота именно на обязательном пути с острова в море (§20.2 A/D, graf §27); тесты проходят, потому что строят генератор напрямую, но не проверяют фактическое покрытие двух стримеров. **Исправить:** поддержать частичный подводный чанк x=64…72, сохранив границу с исходным островом; расширить mesher на прямоугольную область/клип по ячейкам, а не включать весь 48…72 (иначе двойная геометрия на x=48…64). Регрессионный gate в настоящей сцене: raycast вертикально вниз по x=63.5,64.5,68.5,71.5,72.5 при z=32, 3 seed; каждый hit должен принадлежать рельефному мешу на высоте `terrainTop` с допуском 1e-6 и без двойных верхних граней. Минимальный заведомо падающий числовой контроль текущего покрытия:

   ```js
   import assert from 'node:assert/strict';
   for (let x=64; x<72; x++) {
     const surface = Math.floor(x/16) < 4;
     const seabed = Math.floor(x/24)*24 >= 64;
     assert(surface || seabed, 'missing terrain at x='+x);
   }
   ```

2. **[ВАЖНО]** [three-worlds-game/tests/owner-2111-voxel-phone.test.mjs:34–42](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/tests/owner-2111-voxel-phone.test.mjs#L34), [three-worlds-game/voxel-terrain.mjs:37–55](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/voxel-terrain.mjs#L37). Заявленная проверка бесшовности чанков фактически **сравнивает одну координату саму с собой**: `cx*16+16` и `(cx+1)*16` тождественны, оба вызова одной функции `voxelSample(src,…)`. Следовательно assertion всегда зелёный даже если `buildGreedyVoxelChunk` утратит стенку на стыке или рантайм пропустит полосу, как в п.1. Отдельное `assert.deepEqual(a,b)` сравнивает две сборки того же чанка с тем же провайдером и не проверяет стык геометрий. **Сценарий:** видимая щель/недостающая боковая грань при PASS «neighboring chunks share exact column elevations». **Исправить:** независимо сравнивать соседние mesh-высоты с исходным провайдером, проверять наличие/отсутствие боковых граней на общей границе при неравных высотах, и добавить browser raycast across boundary. Самодостаточный пример для теста стенки:

   ```js
   const h=(x)=>x<16?7:4;
   const left=buildGreedyVoxelChunk(0,0,h);
   const right=buildGreedyVoxelChunk(1,0,h);
   assert.equal(left.quads,2,'left chunk must have top and exposed +X wall');
   assert.equal(right.quads,1,'right chunk must have only top');
   ```

3. **[ВАЖНО]** [three-worlds-game/tests/owner-2111-voxel-phone.test.mjs:7–16](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/tests/owner-2111-voxel-phone.test.mjs#L7), [three-worlds-game/tests/owner-2111-voxel-phone.test.mjs:49–65](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/tests/owner-2111-voxel-phone.test.mjs#L49), [three-worlds-game/voxel-terrain.mjs:5–11](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/three-worlds-game/voxel-terrain.mjs#L5). «600 seeded heights» не проверяет разные seed: переменная `seed` создана, но в цикле `voxelSample(fn,x,z)` вызывается с **дефолтным seed=1337** у всех трёх функций. Проверка `Number.isInteger(voxelSample(...))` также почти тавтологична — `voxelSample` сам округляет через `Math.round`. Ни первый, ни последний тест не сравнивает игровой `terrainTop`/живой меш с независимым золотым эталоном; строка 64 сравнивает с **тем же источником**, из которого был построен меш. **Сценарий:** сбой интеграции другого seed, иной высоты коллизии в игре или пропущенной геометрии останется незамеченным при 61/61 PASS. **Исправить:** передавать seed явно (`(u,v)=>fn(u,v,seed)`), сравнить 2–3 разных seed и повтор одного seed, проверять `terrainTop` через реальный browser runtime и raycast реальной сетки; негативная мутация должна делать gate красным. Не считать автоматическое округление проверкой правильного рельефа.

4. **[МЕЛКО]** [.github/workflows/three-worlds-owner2111.yml:1–15](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/.github/workflows/three-worlds-owner2111.yml#L1), [.github/workflows/three-worlds-environment-golden.yml:1–14](https://github.com/mpaykin1/meta6/blob/0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f/.github/workflows/three-worlds-environment-golden.yml#L1). Профильные golden workflow подписаны исключительно на push в исторические feature-ветки и имеют жёсткий `checkout ref` этой ветки; **сами эти jobs не запускаются на main и не проверяют PR к main**. Это не доказывает отсутствие других общих CI-gates, но лишает эти специализированные доказательства постоянного регрессионного покрытия после merge. **Исправить:** добавить `push: branches: [main]` и `pull_request` с проверкой текущего `github.sha`, убрать принудительный `ref` устаревшей ветки в read-only gate; bot-коммит сборки оставить отдельно от PR/main-проверки.

## Что проверил
- Текущий main SHA прочитан заново из GitHub, инструкция `automation/prompts/chatgpt-auditor.md`, `three-worlds.md`, `docs/THREE_WORLDS_MERGE_RU.md` (§20–21), `graf.md` §27, compare 37719bbe…0a54c7a0 (13 линейных коммитов, 40 затронутых файлов).
- Текущие `index.source.html`, `underwater-runtime.js`, `world-core.mjs`, `seabed.mjs`, `voxel-terrain.mjs`, environment/weather/hero modules, новые Node/browser/golden tests, профильные workflows и текст evidence с 61 PASS.
- Сравнена предыдущая реализация `underwater-runtime.js` на `37719bbe`: там по каждой клетке действовал `if(usesSurfaceTerrain(x,z))continue;`; новое условие на начало 24-метрового чанка создало регрессию п.1.
- Прочитан прежний `041-audit.md`: старые замечания про расписание гостя, Ash fog, vendor и одинаковое размещение NPC не повторяются. `handoff/AUDIT-STATE.md` уже содержит этот range/focus, но запрошенный `042-audit.md` до записи отсутствовал; AUDIT-STATE не менял.

## НЕ проверил
- Запуск Node, Playwright и реальный browser raycast; визуальную WebGL-картинку, iPhone/Android, GPU/RAM/FPS, прохождение пользователя по x=64…72, достоверность файлов evidence вне прочитанного текста — **UNKNOWN**.
- Полное бинарное содержимое собранного `index.html`: коннектор вернул пустое тело для этого крупного файла; несовпадение со source не утверждаю.
- Никаких изменений в игре, PR, CI, документах, автозадачах или других handoff-файлах. Единственная запись этого запуска — данный отчёт.
