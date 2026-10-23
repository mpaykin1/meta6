# ABYSS GLOW front-maw motion/light probe — 2026-10-23

- Source: owner-derived `maw_front_v1` atlas and manifest; no replacement geometry.
- Change: isolated `abyss-glow/maw-stand/index.html`; canonical `abyss-glow/stand/index.html` is unchanged (SHA-256 `d968e47997dbd1cf843fdc73fed94e682217e6d5c833a0c8d602ec5b064f94e5`).
- Motion: dt-driven lower-jaw articulation around manifest pivot `[108,168]`; closed/mid/open evidence shows 53 px tip displacement and 0 px pivot drift.
- Light: matched left/right deterministic captures show only the facing half, measured fraction 1.0 on each side (required >=0.75).
- Transparency/grid: source atlas alpha is retained and all runtime sampling is nearest-neighbour.
- Local gate: `python3 -m unittest discover -s automation/asset-quality -p 'test_*.py'` — 108/108 PASS.
- UNKNOWN: owner artistic verdict, runtime WebGL bloom/normal response, browser frame-time p50/p95, physical iPhone.

Evidence: `docs/autotask-reports/evidence/2026-10-23-maw-motion-light-sheet.png` and `.json`.
