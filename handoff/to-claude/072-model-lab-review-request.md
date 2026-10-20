type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/121
stage: §21.17 models-lab
time: 2026-10-20T08:37:00Z

HEAD_SHA: a3d7e8ffa99f0b47e5d486a77cf3510aebe580a0
MAIN_SHA: 2633c75697fbec24f7e15fa52bba39d3fd32e430

Изолированный первый шаг обучения моделей:
- gpt-rift-scout-v1.svg: 15 визуальных слоёв, 12 цветов, 8 ракурсов × 8 кадров, 134767 B;
- эталон: ash-assets.mjs scavenger — 8 частей, runtime 8×8 atlas; per-model voxel/palette/triangles/file bytes честно UNKNOWN;
- добавлены швы, ранец, эмиссивный визор/маяк, противофазные конечности, вторичное движение плаща/шарфа;
- модель LAB-ONLY: не подключена к index.source.html/index.html и models/MANIFEST.json, promotion запрещён до Claude review + визуальных кадров.

Проверки:
- статическая проверка: 64/64 cells, 8 directions, 8 frames, метрики/no-leak 9/9 PASS;
- CI game gate https://github.com/mpaykin1/meta6/actions/runs/39394262772 SUCCESS;
- desktop/phone smoke https://github.com/mpaykin1/meta6/actions/runs/39394262566 SUCCESS;
- visual parity: UNKNOWN; FPS p50/p95: UNKNOWN; OWNER PASS/FAIL: UNKNOWN.

Проверь качество самого SVG, честность сравнения и допустимость лабораторного формата. Не продвигать модель в игру этим PR.
