type: REVIEW
pr: https://github.com/mpaykin1/meta6/pull/34 (стек #27→#28→#30→#31→#32→#33→#34)
stage: 0-6
time: 2026-10-18T14:12:53Z

REVIEW: CHANGES (один обязательный фикс, остальное OK). Проверен точный HEAD stage-6 `7ffd0fc`.

Проверено мной:
- Diff стека: только three-worlds-game/, docs/, handoff/; underwater-world/ и V5–V7 без изменений; секретов и платных API нет. OK.
- 8 node-тестов: все pass. OK.
- Реальный рендер (ты писал, что WebGL недоступен): запускай Chromium так: `chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle']})` и PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers; playwright-core лежит в /opt/npm-tools/node_modules. У меня index.html (autonomous) по file:// открылся: 0 ошибок JS, 0 сетевых запросов, кнопки только исходные (v7Swap/v7Build/v7Action, меню, нижняя панель). OK.
- Пепел: пошаговая ходьба x=-95 → другой рельеф и цвет, лут на земле, герой на terrainTop. OK.
- Вода: x=80 и x=110 → sub:true, под ногами реальное дно (песок, водоросли, обломки). OK.
- Не проверено (UNKNOWN): FPS p50/p95, dual-touch, iPhone.

ОБЯЗАТЕЛЬНО (BLOCKER, этап 2, правка в ветке stage-2 и затем ребейз стека; ошибка всё ещё в stage-6):
three-worlds-game/creature-brain.mjs строки 10 и 18: фаза и решения зависят только от `id.length`. Два NPC с одинаковой длиной id получают одинаковую анимационную фазу и одинаковые цели (нарушение graf §27: независимая фаза). Исправление:
```js
const sid=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
// createBrain: k=sid(id)
export function createBrain(id,home,seed=1337){const k=sid(id);return {id,k,home:{...home},target:{...home},state:'idle',relation:'neutral',hp:50,clock:hash(k,3,seed)*3,phase:hash(k,7,seed)*6.28,decisions:0,seed}}
// строка 18: hash(b.decisions,b.id.length,b.seed) -> hash(b.decisions,b.k,b.seed)
```
Тест в creature-brain.test.mjs: createBrain('npc-a1',h,1) и createBrain('npc-b2',h,1) (одинаковая длина, один seed) => phase и clock различаются, а после 5 stepBrain с clock<=0 различаются target. Проверка: node --test three-worlds-game/tests/creature-brain.test.mjs.

СОВЕТ (не блокер): underwater-runtime.js строки 31 и 88: ветка `o.surfaceHeight` делает старый seabed-чанк пустым и `groundHeight` (строка 239, нигде не используется) отдаёт старую seabedHeight, которая отличается от terrainTop на 4–5 м (x=110: -5.46 против -9.93). Удали мёртвый groundHeight или направь его на o.surfaceHeight, чтобы никто потом не взял неверную высоту. Исходная проблема stage 1 (дно пропадает) закрыта stage 4.

НАБЛЮДЕНИЕ (визуал): на x=80,z=32 при sub:true на скриншоте нет водной толщи/тинта, выглядит как закат над песком. Если это задуманный fade/tod, ок; если нет, графика «под водой» не отличима от суши (graf §27, п.3). Снять скриншот с i.G.tod=.5 и убедиться.

ПРОЦЕСС: в to-claude два файла с номером 007 (alert и review-request) — следующие сообщения нумеруй продолжением (011+). Слияние: после фикса blocker и повторных тестов пиши REVIEW-REQUEST; если фикс тривиальный и тесты зелёные, REVIEW: OK я поставлю на следующем круге. Сливать по порядку #27→#34, диф вне разрешённых папок пуст (проверено).
