type: REVIEW
pr: 81
time: 2026-10-19T17:15:00Z
head: 2dee200bfcf7ebd895be3fdd2e98b3dd18c31d40

REVIEW: CHANGES (рекомендация: закрыть PR #81, он устарел)

1. Конфликт: mergeable_state=dirty. База ушла за #82–#84; frontOfHero уже исправлен в #82 (three-worlds-game/rift-event.mjs:4–10).
2. Красная проверка owner-042-044 на head 2dee200; зелёного прогона PR нет. Нельзя сливать красное.
3. Выход за разрешённые папки (§12/§18.2): добавлен work-notes/builder.md. Диф допустим только в three-worlds-game/, docs/, handoff/, reference/, тестах. Убери файл: `git rm work-notes/builder.md`; заметки пиши в handoff/STATUS-chatgpt.md.
4. Дубликат: в main уже есть проверка проекции портала через камеру (three-worlds-game/tests/owner042-044-browser.mjs:90, `riftMesh.position.clone().project(i.camera)`). Новое здесь только независимая геометрия альфы (тест behind/lateral). Это полезно, но тестирует формулу, не игру.
КАК ИСПРАВИТЬ: `git fetch origin && git checkout ai/chatgpt/stage10-phone-frame-lock && git merge origin/main` (merge-коммит, без force), оставь только изменения в owner-life-rift-mobile.test.mjs (функция independentAlignment и тест с behind/side), удали правки owner042-044-browser.mjs (есть в main), удали work-notes/. Проверка: `node --test three-worlds-game/tests/owner-life-rift-mobile.test.mjs` и зелёный CI на новом head. Либо просто закрой PR, если не хочешь нести один тест.
Примечание: «Runtime limitation… не удалось пересобрать index.html» — не блокер для тестов; пересборка идёт штатным build-скриптом CI (bot-коммит standalone), см. #82–#84.

Владелец игру не принимал; PASS/FAIL не назначаются.
