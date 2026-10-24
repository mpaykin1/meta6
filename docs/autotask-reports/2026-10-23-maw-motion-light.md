# ABYSS GLOW front-maw motion/light probe — 2026-10-23

- Source: owner-derived `maw_front_v1` atlas and manifest; no replacement geometry.
- Change: isolated `abyss-glow/maw-stand/index.html`; canonical `abyss-glow/stand/index.html` is unchanged (SHA-256 `d968e47997dbd1cf843fdc73fed94e682217e6d5c833a0c8d602ec5b064f94e5`).
- Motion: dt-driven, centerline-preserving lower-jaw deformation around the fixed hinge line at `y=168`; closed/mid/open evidence shows 0 / 18.15 / 36.3 px tip displacement, 0 px pivot drift and 0 px lateral centroid drift.
- Light: eight deterministic variants are built from the existing normal tiles and quantized back to the seven-color palette. Matched captures measure facing-side lit fractions 0.8257 left / 0.8637 right (required >=0.75); the longest abrupt run at the former pivot boundary is 3 art px (maximum 4).
- Runtime cost: the stand selects precomputed light tiles; it performs no per-pixel CPU lighting in the animation loop.
- Transparency/grid: source atlas alpha is retained and all runtime sampling is nearest-neighbour.
- Local gate: `python3 -m unittest discover -s automation/asset-quality -p 'test_*.py'` — 122/122 PASS.
- UNKNOWN: owner artistic verdict, runtime WebGL bloom/normal response, browser frame-time p50/p95, physical iPhone.

Evidence: `docs/autotask-reports/evidence/2026-10-23-maw-motion-light-sheet.png` and `.json`.
