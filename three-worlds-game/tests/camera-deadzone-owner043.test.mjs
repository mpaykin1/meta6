// Read-only regression contract: source-only test, no browser or hardware claims.
// Execute: node --test three-worlds-game/tests/camera-deadzone-owner043.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {DEAD_NDC,cameraSectorDelta} from '../camera-sector.mjs';

test('owner §21.3: central dead zone is approximately 40% of viewport width',()=>{
  // NDC +/-0.4 = centered 40% of full viewport. Claimed +/-0.86 leaves 86%.
  assert.ok(DEAD_NDC>=0.35&&DEAD_NDC<=0.45,
    'DEAD_NDC='+DEAD_NDC+'; expected approx 0.4 (central 40% width)');
});

test('owner §21.3: inside center, world frame stays still',()=>{
  const s=cameraSectorDelta(.2,.1,0,12,390/844,65,1/60);
  assert.deepEqual(s,{dx:0,dz:0,transition:false});
});

test('owner §21.3: reaching x=0.6 NDC starts follow camera',()=>{
  const s=cameraSectorDelta(.6,0,0,12,390/844,65,1/60);
  assert.equal(s.transition,true,'camera does not follow beyond central 40%');
  assert.ok(s.dx>0);
});
