type: AUDIT-TRIAGE
source: handoff/to-claude/041-audit.md
checked_on: main 9713d90, 2026-10-19T21:15Z

Все пять пунктов сверены с кодом main.

## ПОДТВЕРЖДЕНО (задачи, по одной за PR)

1. КРИТИЧНО (§20.2 E). `rift-event.mjs:15-19` в idle считает remaining при любом `land&&!battle`, а `rift-story.mjs:113` при warning делает `if(guest)finishGuest(guest)`. Значит живой гость, пока игрок ищет путь домой, исчезает. Исправление в `rift-story.mjs:108`:
```js
const mayCountDown=land&&!guest;
event.step(dt,{land:mayCountDown,battle:!canStart(),pos:player.pos,look:player.look});
```
и удалить `if(guest)finishGuest(guest);` из ветки warning (строка 113); гость завершается только в finishGuest из строк 141/151. Проверка: тест на реальном createRiftEvent+rift-story: после «Помочь» 130 виртуальных с при живом guest — второго warning нет; после finishGuest warning приходит через 50-70 с. Тест должен падать на текущем main (мутационно: вернуть `land` вместо `mayCountDown`).

2. ВАЖНО (§21.8). `ash-world.mjs:14` меняет `scene.fog.density`, `U.fogD.value` не обновляется (index.source.html:1801 обновляет только в applyPalette). Исправление: после строки с `scene.fog.density=Math.max(...)` добавить `U.fogD.value=scene.fog.density;` (передать U в модуль). Проверка: тест `scene.fog.density===U.fogD.value` каждый кадр Island→Ash→Island.

3. ВАЖНО (процесс). В git отслеживается 966 файлов `three-worlds-game/tools/node_modules/`, `.gitignore` в корне нет. Отдельный PR: `git rm -r --cached three-worlds-game/tools/node_modules`, добавить `.gitignore` со строкой `three-worlds-game/tools/node_modules/`; CI уже делает `npm ci`. Проверка: `git ls-files | grep node_modules` пусто и build зелёный. Не смешивать с игровым PR.

4. МЕЛКО. `rift-story.mjs:5,18,82` — мёртвые `createGuestSchedule/finishGuestSchedule/guestTimer`; getter `guestTimer` (стр.158) отдаёт event.state. Удалить неиспользуемое, getter переименовать `eventTimer`, поправить тесты, которые читают `guestTimer`. Объединить с пунктом 1.

## СНАЧАЛА ВОСПРОИЗВЕДИ ТЕСТОМ

5. `living-population.mjs:27` `pick(i)` выбирает с возвращением (хэш по индексу). Тест: для нескольких seed и береговых участков посчитать уникальные позиции NPC/врагов/оружия; если дубли есть — перестановка без возврата; если нет — оставить.

## ЛОЖНОГО нет.

Порядок: п.1+4 → п.2 → п.3. Дальше по 044: живое доказательство погоды (Playwright-скриншот) без новых кнопок/панелей.
