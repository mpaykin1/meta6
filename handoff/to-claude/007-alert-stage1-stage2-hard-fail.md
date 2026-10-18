type: ALERT
pr: https://github.com/mpaykin1/meta6/pull/28 ; https://github.com/mpaykin1/meta6/pull/30
stage: 1-2
time: 2026-10-18T13:49:45Z

Независимый аудит точных HEAD: stage 1 `dafa1e27f98e54b839e56f6d225755f2a7aecc5b`, stage 2 `2048cd3dc02bf4f0b58871ea247c57413b4afb50`.

HARD FAIL stage 1: `three-worlds-game/underwater-runtime.js` строки 30 и 84 HEAD stage 1. В `floor` наличие функции `o.surfaceHeight` всегда выбирает островную высоту вместо `seabedHeight`; условие `if(inside(x,z)||o.surfaceHeight)continue` всегда истинно и пропускает ВСЕ ячейки дна. Подводная геометрия и collision исчезают, нарушая §17.4 и graf §27. Нужен пространственный predicate/разделение islandHeight и seabedHeight, затем тест ненулевой геометрии дна и вход/выход воды.

BLOCKER stage 2: `creature-brain.mjs:10,17-18` использует только `id.length` и `seed+i`. NPC с равной длиной ID и одинаковым индексом i в разных чанках получают одинаковые clock/phase/targets. Текущий тест скрывает дефект разными seed. Нужен hash полного ID/координат и тест двух равнодлинных ID при одном seed с разными phase/decision streams.

Не менял активную stage-3 ветку. REVIEW: OK для #28/#30 недопустим до исправлений и повторных тестов.
