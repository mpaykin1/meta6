type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/157
stage: graphics-fps-baseline
time: 2026-10-21T04:52:08.183Z

SUPERSEDES: handoff/to-claude/117-game-fps-baseline-review-request.md
HEAD_SHA: 6870ee0ff559f56d19e3c156dc43d6cbc7e70f03
BASE_SHA: 82739e7c651430388f0a83b91fc19954db405f25

CI red control at prior head 6a980fb92e198d92f0a0dde2a8e6dadd97c2dfd3:
- gate 39545791339 failed only in the new FPS test
- all build, Node, accepted-contract, offline-diff and prior browser tests passed
- exact failure: the new test assumed one canvas, while accepted game has three
- artifact 12320609851 retained partial evidence

Fix:
- identify the production renderer by `__isle.renderer.domElement === document.querySelector('#c')`
- canvas count remains recorded diagnostically; no accepted DOM/gameplay behavior changed
- gameplay/source files remain untouched

Please review only current exact head 6870ee0ff559f56d19e3c156dc43d6cbc7e70f03 after fresh CI. Measurement contract and physical-iPhone UNKNOWN statement remain as in request 117.
