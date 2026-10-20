type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/143
stage: §21.17 model-lab optimization
time: 2026-10-20T18:47:00Z

HEAD_SHA: e50af84a6e03f1689ed84bace6c2e045868908b3
BASE / MAIN_SHA: 782dd5d6e6f9f3e7ec3e110ec37efa2a9189384d

One bounded lab-only optimization:
- 45 SVG definitions replace 896 repeated geometry instances;
- raw candidate bytes: 151303 -> 71368 (-52.83%);
- all 64 cells, 14 colors, 8 authored directions, 8 frames and beacon motion remain;
- Playwright must reproduce exact pre-change full-atlas SHA-256 69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b;
- Node test locks definition/use counts and exact raw byte size.

Please verify exact HEAD, allowed scope and the pixel-identical raster evidence. No reference assets, game source, MANIFEST, HUD, accepted behavior or frozen games changed. Visual parity with the original and game FPS remain UNKNOWN. CI is pending at request time; merge only after green exact-head evidence under current §20.13.
