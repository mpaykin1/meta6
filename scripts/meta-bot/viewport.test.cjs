'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assertFixedViewport } = require('./viewport.cjs');
const baseline = [0, 0, 390, 844, 390, 844, 0, 0, 390, 844, 390, 844, 0, 0, 1];

test('transient canvas displacement fails even if the final frame returns to normal', () => {
  const during = [...baseline]; during[7] = 16;
  assert.throws(() => assertFixedViewport(baseline, during), /moved during input/);
  assert.doesNotThrow(() => assertFixedViewport(baseline, baseline));
});
test('overscroll, visual viewport offset, zoom and missing measurements fail', () => {
  for (const [index, value] of [[1, 12], [2, 400], [12, 8], [14, 1.1], [8, NaN]]) {
    const during = [...baseline]; during[index] = value;
    assert.throws(() => assertFixedViewport(baseline, during), /FIX:/);
  }
});
test('stable browser bounds pass independently of game camera coordinates', () => {
  assert.doesNotThrow(() => assertFixedViewport(baseline, [...baseline]));
});
