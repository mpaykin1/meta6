# Карточка опыта: shared

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## animation/boolean-anchor-coordinate
- 2026-10-23 · failure · technical · 2026-10-23-abyss-motion-boolean-anchor
- **Наблюдение:** ABYSS part-motion gate accepted true/false anchor coordinates because Python bool is a subclass of int; a forged manifest could therefore satisfy relative-motion arithmetic without real numeric coordinates.
- **Применять:** Reject bool before accepting finite int/float anchor coordinates and retain a red-first regression that previously returned PASS_PART_ANCHOR_MOTION.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA bd1286b3312c41600cfdcaa7550f26c66b1a2c72

## animation/claimed-fixed-hinge-drift
- 2026-10-24 · failure · technical · 2026-10-24-abyss-maw-false-hinge-evidence
- **Наблюдение:** The isolated maw stand translated its declared [108,168] hinge by open*18 while committed evidence hard-coded pivot_drift_px=0 and tip displacement=53; exact transform evaluation measured 18 px drift and 32.52 px tip displacement open.
- **Применять:** Derive motion evidence from the produced transform or browser matrix, keep a negative control, and require <=0.25 px hinge drift before calling articulation technically fixed.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA 4aab8deeae7a05e3f3e553ed67d0537e6740fb78

## animation/frontal-maw-lateral-swing
- 2026-10-24 · failure · technical · 2026-10-24-abyss-frontal-maw-lateral-swing
- **Наблюдение:** The fixed center-pivot rotation removed hinge drift but moved the owner-source lower-jaw centroid 6.7774 px sideways and only -0.6890 px vertically at full open, so a frontal mouth reads as a lateral swing rather than a downward opening.
- **Применять:** For frontal layered mouths, retain fixed-joint evidence but also gate the motion vector: lateral centroid drift <=2 px and downward centroid motion >=8 px; use a bilateral or centerline-preserving deformation and compare same-camera phases before artistic review.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA 3f54415ef3f981f318511e22fd4b6670406e3d08

## animation/measured-fixed-hinge-rotation
- 2026-10-24 · solution · technical · 2026-10-24-abyss-maw-fixed-pivot-rotation
- **Наблюдение:** Replacing translate-plus-stretch with a 0.22-radian rotation around the declared [108,168] hinge reduced computed closed/mid/open pivot drift to 0 while preserving 26.5663 px of lower-tip motion; an old-transform mutation still reports 18 px drift.
- **Применять:** For articulated 2D parts, derive pivot and tip metrics from the same transform used to render, retain the prior transform as a red control, and require browser-matrix confirmation before runtime PASS.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA 4c70f90f7f9134910e1935929e88fc0b225564ba

## animation/surface-clamp-snap
- 2026-10-21 · failure · technical · 2026-10-21-legacy-stage7-surface-velocity-snap
- **Наблюдение:** Мгновенное обнуление вертикальной скорости у поверхности вызывало рывок камеры.
- **Применять:** Гасить скорость плавно и проверять покадровые скачки; отсутствие данных в тесте — ошибка.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stage7-surface-velocity-snap.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## asset/owner-maw-layer-package
- 2026-10-23 · solution · technical · 2026-10-23-abyss-owner-maw-layer-package
- **Наблюдение:** The owner-derived front-maw R/G/B layer image preserved the asymmetric silhouette but lacked the atlas rects, jaw pivot, hitbox, sockets and provenance required by abyss.md §8.
- **Применять:** Build only from maw_front_layers.png: emit a padded four-layer atlas, two hinged parts, source hashes and an UNKNOWN licence; retain a byte-equality test and reference sheet.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA 28f50d923ee16014994bfd292bc88fd386458b31

## atmosphere/depth-gradient
- 2026-10-21 · baseline · technical · 2026-10-21-world-lesson-7
- **Наблюдение:** Стандарт атмосферы World_server: ближний план более читаем, дальний смягчён туманом и менее контрастен.
- **Применять:** Сохранять глубину через fog/aerial perspective, применять технику только без изменения замороженного стиля и цикла игры.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/docs/GOLDEN_PAINTING_ATMOSPHERE_STANDARD.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## baseline/golden-readonly
- 2026-10-21 · baseline · technical · 2026-10-21-golden-no-touch
- **Наблюдение:** Три эталона в reference/sumerek-golden защищены SHA-256; изменения эталона ломают проверку.
- **Применять:** Не редактировать эталоны; сравнивать изменения в рабочих сборках с ними.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/AGENTS.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## build/patch-not-html
- 2026-10-21 · solution · technical · 2026-10-21-source-patches
- **Наблюдение:** Готовые index.html формируются из исходников и скриптов patch, а не редактируются вручную.
- **Применять:** Для ashen запускать patch_ash.py; для underwater запускать patch.py; сверять сборку с закоммиченным HTML.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/ashen-sumerek/README.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## build/reproducible-offline
- 2026-10-21 · failure · technical · 2026-10-21-legacy-three-worlds-offline-and-browser
- **Наблюдение:** Сборка file:// с CDN/importmap не работала; String.replace с подстановкой испортил вложенный JS.
- **Применять:** Проверять автономность export, парсинг каждого script и использовать callback при замене JS в сборщике.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-18-three-worlds-offline-and-browser.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## ci/changed-runtime-surface-not-exercised
- 2026-10-24 · failure · technical · 2026-10-24-abyss-changed-stand-missing-browser-gate
- **Наблюдение:** Exact-head CI was green after the isolated maw stand changed, but the production browser workflow exercised only the canonical stand and single-loop harness; the changed maw runtime, touch layout, rendered phases and Canvas2D transform were not opened by CI.
- **Применять:** Every changed runnable stand must be included in a browser smoke on desktop and touch, with console/network failure capture, non-empty and phase-distinct frames, measured runtime transforms, p50/p95 frame timing and explicit software-renderer/device labels.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA b7eb6462c03410dd4314054cbd9bd9853a707b97

## ci/partial-asset-directory
- 2026-10-23 · failure · technical · 2026-10-23-abyss-partial-pack-workflow
- **Наблюдение:** Asset Quality treated any abyss-glow/assets directory as a complete pack, so the first owner-maw component correctly passed its tests but CI failed while opening the intentionally absent root manifest.
- **Применять:** Run full-pack gates only when the root manifest exists; otherwise record component coverage UNKNOWN while still running all component regressions.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/actions/runs/39968654450) · SHA 28f50d923ee16014994bfd292bc88fd386458b31

## fx/fog-uniform-drift
- 2026-10-21 · failure · technical · 2026-10-21-legacy-audit041-guest-timer-fog-vendor
- **Наблюдение:** Плотность сцены fog менялась, а uniform частиц U.fogD оставался старым.
- **Применять:** Держать сцену и шейдер частиц на едином источнике fog density; тестировать переходы миров.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-audit041-guest-timer-fog-vendor.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## gameplay/shared-hit-ui
- 2026-10-21 · failure · technical · 2026-10-21-legacy-guest-arc-review
- **Наблюдение:** Босс получал только ближний урон; диалог и визуальные эффекты отходили от исходного канона.
- **Применять:** Все типы атак вести через общий hit path; UI/шаблоны брать из эталона.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-20-guest-arc-review.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## git/stale-dependent-pr
- 2026-10-21 · failure · technical · 2026-10-21-avoid-stale-base
- **Наблюдение:** Зависимые PR с устаревшей веткой теряли исправление simDir и ломали golden.
- **Применять:** Перед ревью проверять ancestry актуального родителя и запускать тесты на head ветки.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stacked-prs-stale-base.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## light/animate-volume
- 2026-10-21 · solution · technical · 2026-10-21-world-lesson-6
- **Наблюдение:** LIGHT использует реальную 3D-геометрию и normal/depth-aware screen-space контур после позы и проекции.
- **Применять:** Если нужен объёмный светящийся силуэт, изучить shared/light; не заменять геометрию плоской линией и не копировать чужой bloom без теста.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/docs/LIGHT_SYSTEM.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## lighting/static-bilateral-atlas
- 2026-10-23 · measurement · technical · 2026-10-23-abyss-maw-static-bilateral-light
- **Наблюдение:** The owner-source maw detail layer measured 6961 lit pixels left and 6900 right, so its 0.5022 dominant-half share cannot prove the required directional rim response.
- **Применять:** Require matched left-light and right-light runtime captures with unchanged silhouette alpha and at least 75 percent of lit pixels on the facing half.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/229) · SHA a4305f4896ecbc322fab29c62bea52eeada746a4

## process/branch-from-fresh-main
- 2026-10-21 · failure · technical · 2026-10-21-ashen-fresh-main
- **Наблюдение:** Ветка от устаревшего локального main дала конфликт PR (PR 149 закрыт, переделан как 150).
- **Применять:** Перед веткой: checkout main; fetch; reset --hard origin/main; после мерджа удалять локальную ветку.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## regression/accepted-actions
- 2026-10-21 · failure · technical · 2026-10-21-legacy-owner-test4-regressions
- **Наблюдение:** Погружение, прыжок, удар в воде и дождь ломались незаметно при дальнейших этапах.
- **Применять:** После каждой правки проходить принятые сценарии во всех средах, а не только новый функционал.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-20-owner-test4-regressions.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## release/rebuild-every-change
- 2026-10-21 · failure · technical · 2026-10-21-legacy-stage7-timer-tests-build
- **Наблюдение:** Исходные модули были изменены без пересборки HTML; тесты проверяли строки, а не поведение.
- **Применять:** Требовать воспроизводимую сборку и тесты реальных игровых путей, не source.includes.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stage7-timer-tests-build.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## review/ai-other-company
- 2026-10-21 · decision · technical · 2026-10-21-world-review
- **Наблюдение:** World_server требует независимого ревью Claude и ChatGPT для изменяемых игр; тесты не заменяют решения владельца.
- **Применять:** Перед слиянием запрашивать Claude в PR и показывать проверенную игровую ссылку владельцу.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/AGENTS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## rules/read-before-design
- 2026-10-21 · failure · technical · 2026-10-21-legacy-three-worlds-design-vs-graf-27
- **Наблюдение:** Дизайн предлагал запрещённые новые экранные панели до прочтения graf §27.
- **Применять:** Перед дизайном читать последний стандарт; проверять любые новые UI-элементы против него.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-18-three-worlds-design-vs-graf-27.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## runtime/undeclared-symbols
- 2026-10-21 · failure · technical · 2026-10-21-legacy-stage7-undeclared-symbols
- **Наблюдение:** Необъявленные функции в update() вызывали ReferenceError в каждом кадре.
- **Применять:** До PR прогонять живой Chromium с pageerror и console.error, плюс no-undef.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-18-stage7-undeclared-symbols.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## terrain/chunk-boundary-coverage
- 2026-10-21 · failure · technical · 2026-10-21-legacy-terrain-gap-and-no-main-ci
- **Наблюдение:** Разные размеры чанков оставили визуальную дыру на границе наземного и подводного мира.
- **Применять:** Проверять покрытие каждой колонки на границе, геометрию и события CI на main.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-terrain-gap-and-no-main-ci.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## terrain/shore-height-jump
- 2026-10-21 · failure · technical · 2026-10-21-legacy-water-entry-height-step
- **Наблюдение:** Между исходным берегом и океаном был скачок высоты 2 м, хотя геометрическая дыра уже исправлена.
- **Применять:** Тестировать непрерывность top height и реальные переходы у x63.5/64.5 на нескольких z.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-20-water-entry-height-step.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/runtime-duplication
- 2026-10-21 · failure · technical · 2026-10-21-legacy-test-of-copy
- **Наблюдение:** Тестировалcя дубликат таймера, который игровая логика не импортировала.
- **Применять:** Обеспечить общий runtime-код и проверить тест отрицательным контролем.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-test-of-copy.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/spec-constants
- 2026-10-21 · failure · technical · 2026-10-21-legacy-stage10-spec-number-and-tautology
- **Наблюдение:** Число мёртвой зоны отличалось от спеки, а выравнивание портала считалось look·look.
- **Применять:** Числа брать из действующей спецификации и сравнивать независимые величины в тестах.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stage10-spec-number-and-tautology.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/swiftshader-fps-relative
- 2026-10-21 · baseline · technical · 2026-10-21-swiftshader-fps-relative
- **Наблюдение:** FPS в Chromium на swiftshader (программная графика) годится для сравнения до/после, но не говорит о FPS на телефоне.
- **Применять:** Сравнивать только на одной сцене, одном seed, разрешении и renderer; iPhone отдельно, не заявлять без теста.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## tests/synthetic-vs-real-shore
- 2026-10-21 · failure · technical · 2026-10-21-legacy-review-contradicted-short-runs
- **Наблюдение:** Ревью требовало длительных прогонов, а тест подменял реальный берег синтетической функцией.
- **Применять:** Сверять тест с актуальной спецификацией и вызывать реальную функцию рельефа в runtime.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-review-contradicted-short-runs.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/tautology-green-ci
- 2026-10-21 · failure · technical · 2026-10-21-dont-self-test
- **Наблюдение:** Тест сверял таблицу с самой собой: зелёный CI скрывал ошибку координат портала.
- **Применять:** Проверять реальное игровое поведение, включая отрицательные сценарии, и мутацией подтверждать полезность теста.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-20-guest-trigger-xz-and-self-compared-constants.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/virtual-duration
- 2026-10-21 · failure · technical · 2026-10-21-legacy-stage7-five-minutes-is-60s
- **Наблюдение:** Тест с названием «пять минут» на самом деле моделировал 60 секунд.
- **Применять:** Проверять произведение числа шагов и dt; требовать фактическую нужную длительность.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stage7-five-minutes-is-60s.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## touch/missing-viewport-layout-width
- 2026-10-24 · failure · technical · 2026-10-24-abyss-maw-touch-layout-viewport
- **Наблюдение:** The isolated maw stand rendered at a 980 CSS-pixel layout width in a 390x844 Playwright mobile-touch context because it lacked a viewport meta tag; desktop passed while the touch size assertion failed exact-head CI.
- **Применять:** Require a device-width viewport declaration and assert the canvas bounding box equals the requested mobile viewport before accepting touch evidence.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/actions/runs/40063254904) · SHA 1e573318182f53bf1368bf09e2e965d0f1c6abd4

## ux/green-but-empty
- 2026-10-21 · failure · technical · 2026-10-21-legacy-three-worlds-stage0-6-owner-fail
- **Наблюдение:** Технически зелёный проект казался владельцу пустым: резкие переходы воды и мало видимого контента.
- **Применять:** Проверять реальные кадры, плотность объектов вокруг игрока и непрерывность смены среды.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-18-three-worlds-stage0-6-owner-fail.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## weather/invisible-fx-menu
- 2026-10-21 · failure · technical · 2026-10-21-legacy-weather-preview-v2-owner-fail
- **Наблюдение:** Погода была практически невидимой, а большое меню перекрывало игровую сцену.
- **Применять:** Проверять визуальную заметность погодных FX живыми кадрами и избегать перекрывающих экран панелей.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-17-weather-preview-v2-owner-fail.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd
