'use strict';

// Measurements only: this module never changes page styles or game state.
function assertFixedViewport(before, now) {
  if (before.length !== now.length || before.length < 15 ||
      [...before, ...now].some(value => !Number.isFinite(value)))
    throw new Error('FIX: incomplete viewport measurements');
  if (now[0] !== 0 || now[1] !== 0 || now[2] > now[4] + 2 || now[3] > now[5] + 2)
    throw new Error('FIX: page scrolling or overflow during input');
  for (const index of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
    if (Math.abs(before[index] - now[index]) > 1)
      throw new Error('FIX: canvas or visual viewport moved during input (field ' + index + ')');
  }
  if (Math.abs(before[14] - now[14]) > 0.001)
    throw new Error('FIX: visual viewport zoom changed during input');
}

module.exports = { assertFixedViewport };
