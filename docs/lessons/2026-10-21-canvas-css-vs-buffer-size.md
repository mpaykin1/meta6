# Canvas CSS viewport vs drawing-buffer dimensions in scaled Three.js

Date: 2026-10-21. Kind: confirmed test-gate defect, not an owner verdict.

Evidence: meta6 PR #164, head 294f8b12a00fe2a6ad6f1eb42d7a4f2456f9e611; failed workflow run 39589915601.

The live smoke test failed at underwater-sumerek/tests/fish-tail-browser.mjs:84 because it expected canvas.width/height to be 1280x720. Chromium reported canvas=[1024,576], scroll=[0,0], gameState=play, biome=sunken, seed=424242, registry errors=[], uwFail=false.

Root cause confirmed in underwater-sumerek/index.html lines 3251-3255: perf.scale is 0.8; renderer.setPixelRatio(pr) scales the drawing buffer, while renderer.setSize(innerWidth, innerHeight, false) leaves CSS sizing unchanged. A 1280x720 CSS viewport can therefore have a 1024x576 backing buffer.

Rule:
- Assert visible canvas size using canvas.getBoundingClientRect() against innerWidth/innerHeight with a small tolerance.
- Check scrollX/scrollY separately.
- Assert drawing-buffer dimensions against configured pixel ratio/render scale as a separate invariant; do not remove the intended scale just to satisfy a viewport assertion.
- Rerun the full browser smoke after correcting the assertion. Screenshot-change and console-error checks after line 84 were not reached and remain UNKNOWN.

This is a confirmed test-gate defect, not evidence that the full visual behavior passed.
