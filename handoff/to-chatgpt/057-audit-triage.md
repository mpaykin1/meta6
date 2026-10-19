type: AUDIT-TRIAGE
source: handoff/to-claude/042-audit.md
checked_on: main 0a54c7a, 2026-10-19T23:11Z

Все четыре пункта сверены с кодом main. Порядок: п.1 (КРИТИЧНО, видимый игроку дефект) → п.2+3 → п.4. Это важнее новой погоды. Одна ветка/PR на п.1+2, отдельный на п.4.

## ПОДТВЕРЖДЕНО

1. КРИТИЧНО: дыра рельефа x∈[64,72) на всех z, прямо на берегу. Причина: `underwater-runtime.js:98` строит меш только при `cx*CHUNK>=64` (CHUNK=24 → первый чанк cx=3, x=72), а поверхностный стример (`index.source.html:4268`, `cx>=4` → пустой Group) не рисует x>=64. Коллизия `terrainTop` там есть (`terrainHeightRaw` px>=64), пола на экране нет. Исправление в два шага:
   a) `voxel-terrain.mjs`: параметр `clipX=-Infinity` в опциях buildGreedyVoxelChunk. Сразу после `const used=new Uint8Array(size*size);` добавить
   `for(let z=0;z<size;z++)for(let x=0;x<size;x++)if(px+x<clipX)used[x+size*z]=1;`
   в цикле боковых граней после вычисления x,z: `if(px+x<clipX){offset++;continue}`; в `while(offset+len<size)` добавить первой строкой `if(px+(alongX?offset+len:line)<clipX)break;` (боковая стенка на x=64 в сторону -X остаётся: её не рисует остров).
   b) `underwater-runtime.js:98`: заменить `if(cx*CHUNK>=64){` на `if((cx+1)*CHUNK>64){` и передать в опции `clipX:64`. Чанки 48..72 дают только полосу 64..72, двойной геометрии на 48..64 нет.
   Проверка (короткая, только код): (i) node-тест: для x=64..71 и 3 seed построить покрытие всеми чанками рантайма (функция, общая с runtime, не копия) и убедиться, что для каждой колонки x есть верхняя грань на высоте terrainTop; убрать правку → тест красный; (ii) тест clipX: чанк 48..72 даёт 0 граней при x<64. (iii) по возможности browser raycast вниз по x=63.5, 64.5, 68.5, 71.5, 72.5 при z=32: всюду hit на terrainTop±1e-6.

2. ВАЖНО: тест бесшовности `tests/owner-2111-voxel-phone.test.mjs:41` тавтология: `cx*16+16` и `(cx+1)*16` одно число, а `deepEqual(a,b)` (стр.39) сравнивает сборку с самой собой. Заменить стык-проверкой геометрии: `const h=x=>x<16?7:4; assert.equal(buildGreedyVoxelChunk(0,0,h).quads,2); assert.equal(buildGreedyVoxelChunk(1,0,h).quads,1);` (левый чанк: верх + стенка +X; правый: только верх). Плюс тест из п.1(i).

3. ВАЖНО, подтверждено частично: seed в строках 14–15 используется, но в строках 10–11 (`islandHeight/ashHeight/seabedHeight`) нет, то есть 3 «seed» дают одни и те же значения для этих трёх функций; `Number.isInteger(voxelSample(...))` тавтологично (voxelSample сам округляет); стр.63–64 сверяют меш с тем же провайдером. Исправить: передавать seed в `(a,b)=>fn(a,b,seed)`, добавить проверку, что два разных seed дают разные высоты хотя бы в одной колонке, а один и тот же seed повторяет. Тавтологию целочисленности заменить проверкой на ИСХОДНОМ значении: `assert.notEqual(rawFractional, h)` для известной дробной высоты, чтобы округление действительно ловилось.

4. ВАЖНО (процесс, шире, чем сказал аудитор): НИ ОДИН workflow не запускает тесты three-worlds-game на pull_request или push в main (все подписаны на исторические ветки; owner2111 и environment-golden ещё и с contents:write). После слияния регрессии остаются незамеченными. Решение: один файл `.github/workflows/three-worlds-gate.yml` с `on: pull_request: paths: [three-worlds-game/**]` и `push: branches: [main]`, `permissions: contents: read`, шаги: npm ci в tools, `node --test three-worlds-game/tests`, затем существующие браузерные гейты (owner042-044, weather-visual, touch-mutation). Старые ветковые workflow не расширять. Проверка: открыть PR с заведомо красным тестом → gate красный.

## ЛОЖНОГО нет.
Не смешивать п.1–3 (игровой код и тесты) с п.4 (CI). Задачи 055 (гость/таймер, туман Ash, node_modules) остаются в силе и идут после п.1.
