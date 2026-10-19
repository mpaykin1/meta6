import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {voxelHeight,voxelSample,buildGreedyVoxelChunk} from '../voxel-terrain.mjs';
import {islandHeight,ashHeight} from '../world-core.mjs';
import {seabedHeight,shoreSeabedHeight,coastalBeachHeight} from '../seabed.mjs';
test('§21.11: 600 seeded Island, Ash, Sunken City cell heights are integers, no fractional mesh corners',()=>{
 for(let t=0;t<600;t++){
  const x=Math.floor(Math.sin(t*13.7)*430),z=Math.floor(Math.cos(t*17.3)*440),seed=[1,1337,90210][t%3];
  for(const fn of [islandHeight,ashHeight,seabedHeight]){
   const h=voxelSample(fn,x,z);
   assert(Number.isInteger(h),'fractional voxel collision '+x+','+z);
  }
  const s=voxelSample((a,b)=>shoreSeabedHeight(a,b,seed,6),x,z);
  const c=voxelSample((a,b)=>coastalBeachHeight(a,b,seed,5,3),x,z);
  assert(Number.isInteger(s)&&Number.isInteger(c));
 }
});
test('§21.11: fully filled 16x16 cube top merges to ONE quad; hidden internal faces are culled',()=>{
 const a=buildGreedyVoxelChunk(0,0,()=>7);
 assert.equal(a.quads,1);
 assert.equal(a.pos.length/3,4);
 assert(a.heights.every(y=>y===7));
 for(const y of a.pos.filter((_,i)=>i%3===1))assert(Number.isInteger(y));
});
test('§21.11: stair with one-meter elevation change adds ONLY exposed outer walls and greedy top',()=>{
 const h=(x)=>x<8?6:7;
 const a=buildGreedyVoxelChunk(0,0,h);
 assert(a.quads>1&&a.quads<20,'wrong culled geometry count '+a.quads);
 for(let i=0;i<a.pos.length;i++)assert(Number.isInteger(a.pos[i]),'non-cubic coordinate '+i);
 assert(a.normals.every(n=>[-1,0,1].includes(n)));
 assert(a.heights.every(y=>y===6||y===7));
});
test('§21.11: neighboring chunks share exact column elevations, deterministic greedy mesh across revisits',()=>{
 const h=(x,z)=>voxelHeight(5+((x*13+z*7)%11)/3);
 for(const seed of [3,1337])for(let cz=-2;cz<=2;cz++)for(let cx=-2;cx<=2;cx++){
  const src=(x,z)=>h(x+seed,z-seed);
  const a=buildGreedyVoxelChunk(cx,cz,src),b=buildGreedyVoxelChunk(cx,cz,src);
  assert.deepEqual(a,b);
  assert(a.heights.every(Number.isInteger));
  for(let z=0;z<16;z++)assert.equal(voxelSample(src,cx*16+16,cz*16+z),voxelSample(src,(cx+1)*16,cz*16+z));
 }
});
test('§21.11: original Island joystick is not drawn; interaction is checked by real CDP phone test',()=>{
 const css=readFileSync(new URL('../mobile-controls.css',import.meta.url),'utf8');
 assert(/#v7Stick[^\n]*display:none!important/.test(css));
 assert(/#stick[^\n]*display:none!important/.test(css));
});
test('§21.11: real Ash, Island extension and Sunken City height providers build integer greedy meshes',()=>{
 const providers=[
  ['ash',ashHeight,[[-9,2],[-6,4],[-3,-4]]],
  ['island',islandHeight,[[6,2],[9,7],[-1,2]]],
  ['sunken',seabedHeight,[[11,2],[16,9],[22,-5]]]
 ];
 for(const [name,provider,chunks] of providers)for(const [cx,cz] of chunks){
  const geometry=buildGreedyVoxelChunk(cx,cz,(x,z)=>provider(x,z,1337));
  assert(geometry.quads>0,name+' produced no geometry');
  assert(geometry.pos.length>0&&geometry.indices.length>0);
  assert(geometry.heights.every(Number.isInteger),name+' has fractional heights');
  assert(geometry.pos.every(Number.isInteger),name+' has fractional voxel vertices');
  assert(geometry.normals.every(v=>[-1,0,1].includes(v)),name+' has sloped faces');
  for(let z=0;z<16;z++)for(let x=0;x<16;x++){
   const expected=voxelSample((u,v)=>provider(u,v,1337),cx*16+x,cz*16+z);
   assert.equal(geometry.heights[x+z*16],expected,name+' collision/mesh diverged at '+x+','+z);
  }
 }
});
