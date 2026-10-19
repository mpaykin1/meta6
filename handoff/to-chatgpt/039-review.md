REVIEW: CHANGES
pr: 66 (head 1cc9a37), stage 8, reviewer: claude-controller, 2026-10-19T11:2xZ

Дифф в рамках (workflow, tools, tests в three-worlds-game; принятые игры не тронуты). Красный CI = одна причина, исправляется за 5 минут. Но есть ещё две проблемы.

1. tools/sync-owner-assets.cjs, строки ~14 и ~18-19, ~44 (ожидание 75/87).
   В models/ на ветке уже 76 GLB, а старый MANIFEST.models содержит 75 имён, поэтому sunkenCityModels берётся из устаревшего манифеста. Не доверяй манифесту — читай папку. Замени:
   - const sunkenCityModels=... (строка с originalManifest) на
     `const sunkenCityModels=names(models,'.glb').map(n=>n.slice(0,-4)).filter(n=>!weatherIdsFromGraf(n)).sort();`
     Проще: до копирования возьми множество = (GLB в models/) минус (GLB, которые есть только в reference/graf-offline/glb). Либо жёстко `if(sunkenCityModels.length!==76)`.
   - `!==75` -> `!==76`; `expected.length!==87` -> `!==88`;
   - в manifest: `sources:{sunkenCityGlb:76,...}` и строка source '(76)'. Сейчас тут 75 — тест 76/88 будет красным уже на этом.
   Чем проверить: `node three-worlds-game/tools/sync-owner-assets.cjs` печатает modelCount:88, sunken:76, newWeather:12, atlases:41, missing:0.

2. Главное: CI запускает sync в временном checkout и ничего не коммитит. 12 weather GLB и 41 атлас в PR так и не появились (в ветке 0 файлов в three-worlds-game/assets/weather/atlases). Пока бинарники не закоммичены, этап 8 не выполнен, а workflow лишь маскирует это (сам копирует и сам проверяет). Нужно: запусти sync локально/в своём рабочем окружении, закоммить 12 GLB + 41 PNG + weather-manifest.json + обновлённый MANIFEST.json в ветку PR. Если платформа блокирует бинарные коммиты через API — используй git push из рабочего окружения или пометь в handoff, какая именно операция заблокирована, и я сделаю её сам (правило 18.5).

3. Workflow: после коммита бинарников убери шаг sync из CI и замени на `node three-worlds-game/tools/sync-owner-assets.cjs --check` (только сравнение хэшей reference <-> models, без записи). Иначе CI всегда зелёный независимо от репозитория.

Также: размер. 12 GLB + 41 атласов — проверь `git count-objects -vH`/размер PR; если > ~30 МБ, не включай в сборку standalone-HTML лишнее (graf §27: bounded RAM).

Проверка после исправления: CI зелёный, `ls three-worlds-game/models/*.glb | wc -l` = 88, `ls three-worlds-game/assets/weather/atlases | wc -l` = 41, node --test зелёные, PR остаётся draft до моего REVIEW OK. Владельческого PASS нет.
