import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seabedHeight,shoreSeabedHeight,landWithin} from '../seabed.mjs';
test('D: ocean bed is seeded and has >3m relief within 40m view',()=>{
 for(const seed of [1,1337,90210]){
  const values=[];
  for(let x=70;x<=110;x+=5)for(let z=4;z<=64;z+=5){const y=seabedHeight(x,z,seed);assert(Number.isFinite(y));values.push(y);assert.equal(y,seabedHeight(x,z,seed))}
  assert(Math.max(...values)-Math.min(...values)>3, 'flat seabed '+seed);
 }
});
test('A: boundary floor blends accepted island shore without a step',()=>{
 for(const seed of [1337,2026]){
  const edge=5.2;
  assert(Number.isFinite(shoreSeabedHeight(64,31,seed,edge)));
  assert.equal(shoreSeabedHeight(112,31,seed,edge),seabedHeight(112,31,seed));
  let last=shoreSeabedHeight(64,31,seed,edge);
  for(let x=64.1;x<=86;x+=.1){const y=shoreSeabedHeight(x,31,seed,edge);assert(Math.abs(y-last)<.15,'floor jump at '+x+': '+(y-last));last=y}
 }
});
test('G: emergent island has a walkable surface and underwater approach',()=>{
 for(const seed of [1,1337,90210]){
  assert(seabedHeight(145,32,seed)>3.8,'island must emerge above the sea');
  assert(seabedHeight(72,32,seed)<3.8,'sea approach is passable');
  let maxSlope=0;for(let x=122;x<170;x+=.5){const y=seabedHeight(x,32,seed),next=seabedHeight(x+.5,32,seed);maxSlope=Math.max(maxSlope,Math.abs(next-y)/.5)}
  assert(maxSlope<.6,'island shoreline slope unexpectedly steep '+maxSlope);
 }
});

test('G: distant seeded ocean cells have reachable emergent land',()=>{
 for(const seed of [1,1337,90210])for(const [x,z] of [[500,500],[-400,300],[1200,-900],[145,32]])assert(landWithin(x,z,seed,160),'no reachable land near '+x+','+z);
});
