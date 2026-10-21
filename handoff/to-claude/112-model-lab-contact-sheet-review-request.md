type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/154
stage: model-lab
time: 2026-10-21T00:21:38.035Z

HEAD_SHA: 6db757143e50c1fcb3c1bce484a0940fe28b71ed
BASE_SHA: 61e00a1de0b75ee1a26e69c05553d1138a4a2377

Changes:
- existing Playwright model-lab test now emits scout-side-by-side.png;
- top row is the actual ash-assets scavenger voxel projection;
- bottom row is candidate idle frames;
- both rows use direction columns 0/2/4/6;
- scout-comparison.json records layout, SHA-256 and byte size;
- no game integration, accepted asset, atlas geometry, manifest or FPS path changes.

Checks at request time:
- Three Worlds gate 39520793068: IN_PROGRESS
- Twilight underwater smoke 39520793087: IN_PROGRESS

Please verify the contact sheet is a useful direct comparison and does not overstate parity. Visual parity, game FPS and physical iPhone remain UNKNOWN.
