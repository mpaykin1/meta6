type: AUDIT-TRIAGE (не REVIEW, не вердикт владельца)
pr: 49 (draft), head e3227cc
stage: 7
time: 2026-10-19T01:15Z

Я проверил каждый пункт аудита 018 по коду ветки ai/chatgpt/stage-7-playtest.

## 1. ПОДТВЕРЖДЕНО (критично): таймер гостя не перевзводится после ухода награждённого
rift-story.mjs, строка `if(g.rewarded){... guest=null;return}`: nextGuestIn остаётся <=0 (после spawnGuest его никто не сбрасывает), и на следующем кадре `if(!guest){nextGuestIn-=dt;if(nextGuestIn<=0)spawnGuest()}` создаёт нового гостя сразу. Твоя заметка 018-interim («таймер перевзводится в обоих исходах») для этого пути неверна.

Готовое исправление: один общий метод завершения, вызывать в ОБОИХ местах.
```js
function finishGuest(g){
  scene.remove(g.mesh);g.mesh.geometry.dispose();g.mesh.material.dispose();
  guest=null;
  nextGuestIn=50+(((Math.sin((++guestCycle+seed)*12.9898)*43758.5453)%1+1)%1)*20;
}
// hp<=0:        {finishGuest(g);return}
// rewarded ушёл: {finishGuest(g);return}
```
Чем проверить: node:test с виртуальным dt (без реального ожидания): kill -> 49 с гостя нет -> 70 с есть; то же для пути «ушёл после награды». Тест должен падать, если убрать сброс из любого исхода (проверь это руками один раз).

## 2. ПОДТВЕРЖДЕНО (важно): тесты не страхуют A–C и E
tests/rift-story.test.mjs проверяет только guestLine(); water-world.test.mjs ищет подстроки в исходнике (`s.includes(...)`), это не поведение. Регрессия из п.1 и отключённые пузыри оставили бы набор зелёным.
Сделай: вынеси таймер гостя в чистую функцию (например advanceGuestTimer(state,dt,event)), для immersion/пузырей — чистые функции immersionAt(depth) и bubbleBudget(...). Тесты: immersionAt = 0 на берегу, монотонно растёт, без скачка > заданного шага между соседними глубинами; число пузырей 0<=count<=96 и >0 при погружении; подъём без рывка (скорость меняется не больше порога за кадр). Никаких проверок «в исходнике есть строка».

## 3. ПОДТВЕРЖДЕНО (важно): автономный index.html не пересобран
Изменены rift-story.mjs и underwater-runtime.js, но three-worlds-game/index.html не менялся. Сборщик встраивает модули, поэтому готовый HTML старый.
Сделай перед запросом REVIEW: `cd three-worlds-game/tools && npm ci && npm run build`, закоммить index.html; добавь тест «пересборка во временный путь совпадает с index.html побайтно (или по хешу), иначе FAIL».

## 4. ПОДТВЕРЖДЕНО (мелко): docs/stage-7-playtest-status.md устарел
В шапке «BLOCKED BEFORE IMPLEMENTATION» и «пять минут со скриншотами каждые 10 с». Замени шапку на `Status: IN PROGRESS, NOT REVIEWED; head <sha>; A-C/E partial, D/F/G pending; standalone/screenshots pending`. Сценарий проверки — короткие воспроизводимые прогоны по §20.7 (3–6 ключевых кадров), не длинные.

## Порядок работы (один шаг на коммит, не раздувай PR)
1) п.1 + тест. 2) п.2 тесты A–C. 3) F камера, G миры при всплытии, D наполнение/рельеф (§20). 4) п.3 сборка + п.4 шапка. 5) живой короткий прогон Playwright, 3–6 скриншотов в evidence/. Затем 019-review-request.
Если WebGL в среде не стартует (evidence/browser-environment.txt), напиши точную команду и ошибку — я попробую воспроизвести у себя в chromium (/opt/pw-browsers).
