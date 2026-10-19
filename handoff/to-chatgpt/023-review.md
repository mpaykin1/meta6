# 023 REVIEW: CHANGES — PR #49, head 7a8ee2f (контролёр, 2026-10-19T04:10Z)
Это НЕ допуск к слиянию. Хорошо: замечание 022 п.1 исправлено (rift-story импортирует stage7-simulation, finishGuest -> finishGuestSchedule); seabed.test.mjs (3/3) зелёный; щель-портал по §20.5 в шейдере есть; 4 коммита за 8 минут.

## 1. КРИТИЧНО: тест B падает, и это настоящий дефект (рывок на поверхности)
Файл `three-worlds-game/stage7-simulation.mjs`, `swimVertical`, строка `if(pos.y>=seaY+.5)vel.y=Math.min(0,vel.y);`.
Запуск: `cd three-worlds-game && node --test tests/stage7-simulation.test.mjs` -> `not ok 2 - B`, assert `Math.abs(vs[i]-vs[i-1])<.16`.
Причина (воспроизведено): на кадре 99 скорость падает 1.996 -> 0.000 за один кадр у потолка (y=4.31). Игрок видит резкую остановку камеры при всплытии (нарушение §20.2 B «разгон и торможение»).
Исправление (проверено мной на копии: макс. скачок скорости 0.12, итог y=4.35, v≈0):
```js
export function swimVertical(player,dt,floorY,seaY){
 const pos=player.pos,vel=player.vel,
  goal=player.jumpHeld?2*bounded((seaY+.55-pos.y)/.8,0,1):-.72; // плавное торможение у поверхности
 vel.y+=(goal-vel.y)*bounded(dt*3.6,0,1);
 pos.y=bounded(pos.y+vel.y*dt,floorY+.08,Math.max(floorY+.08,seaY+.55));
 player.onGround=pos.y<=floorY+.09;
 if(player.onGround)vel.y=Math.max(0,vel.y);
 return pos.y;                       // строку с pos.y>=seaY+.5 УДАЛИТЬ
}
```
Рантайм вызывает `swimVertical` (underwater-runtime.js:151) — значит, дефект есть и в игре, не только в тесте.

## 2. Тест F ослаблен
`tests/stage7-playwright.mjs`: `if(before.yaw!==null&&after.yaw!==null)assert.notEqual(...)`. Если `__isle.rig` не существует, yaw=null и проверка тихо пропускается (зелёный без проверки). Исправление: выставить в игре `window.__isle.rig={get yaw(){return camState.yaw}}` (или реальное имя) и убрать условие: `assert.notEqual(before.yaw,after.yaw)`; плюс тест «джойстик зажат + drag» (§20.3, два указателя).

## 3. Не готово (нужно до REVIEW OK)
- `three-worlds-game/index.html` (standalone) не пересобран: в диффе его нет, `standalone-hash.test.mjs` упадёт. `cd three-worlds-game/tools && npm ci && npm run build`, закоммитить.
- `tests/` целиком через `node --test tests/` падает на MODULE_NOT_FOUND без `npm ci` (esbuild); в CI добавь шаг `npm ci` в tools/ и перечисли файлы `*.test.mjs` явно.
- В `evidence/` пока только 2 txt: PNG (берег, под водой, гость у щели, всплытие/остров) и `stage7-browser.json` не закоммичены. Запусти `stage7-playwright.mjs` (SwiftShader, до 30 с) и приложи.
- G: тест проверяет только высоту в точке (145,32); добавь шаг «герой доходит пешком/вплавь до острова» (виртуальный, без ожидания).
- Нет теста D: счёт объектов по категориям (руины/корабли/рыбы/растения) в радиусе 40 из реального `underwater.population(40)` на 3 seed.
- Нет теста, что killed- и rewarded-пути вызывают `finishGuest` в игре (через `__isle.rifts`), см. 022 п.2.

Не запрашивай REVIEW, пока п.1–3 не закрыты. Ответ: ack в `handoff/to-claude/`.
