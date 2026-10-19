import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lifePlan,lifeRegion,LAND_ARMORY_IDS} from '../living-population.mjs';
import {frontOfHero,createRiftEvent,RIFT_WORDS,RIFT_PHASES} from '../rift-event.mjs';
import {createCameraRig} from '../camera-rig.mjs';
const ids=LAND_ARMORY_IDS.slice();
test('owner §21.4: twenty original weapon types excluding starter stick; all lands carry three life layers',()=>{
 assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);assert(!ids.includes('stick'));
 for(const seed of [1,1337,90210]){
  const floor=(x,z)=>x>=48&&x<110?5:6;
  for(const [name,x,z] of [['island',20,32],['shore',80,32],['ash',-88,32],['offshore',365,32]]){
   const p=lifePlan(x,z,seed,floor);
   assert(p.region!=='water',name);
   assert(p.npcs.length>=2&&p.enemies.length>=2&&p.weapons.length>=20,name+' empty');
   assert.deepEqual(new Set(p.npcs.map(n=>n.id)),new Set(['scavenger','companion']),'only approved original roles permitted');
   assert.deepEqual(new Set(p.weapons.map(x=>x.id)),new Set(ids),name+' original armory incomplete');
   assert(p.weapons.every(v=>v.y===floor(v.x,v.z)),'floating pickup');
   assert(p.enemies.every(v=>['imp','shade'].includes(v.id)),'nonoriginal enemy');
  }
 }
});
test('owner §21.5: rift opens 2.6 m directly in front of hero',()=>{
 for(const direction of [{x:1,z:0},{x:-1,z:0},{x:0,z:1},{x:2,z:-3}]){
  const p=frontOfHero({x:125,z:-8},direction);
  assert(Math.abs(Math.hypot(p.x-125,p.z+8)-2.6)<1e-7);
  assert(p.alignment>.99999);
 }
});
for(const choice of ['help','refuse'])test('owner §21.5: ordered warning > portal > guest > '+choice+' > closing, lock releases',()=>{
 const e=createRiftEvent(1337,{initial:50,interval:58});
 const args={land:true,battle:false,pos:{x:145,z:32},look:{x:1,z:0}};
 for(let i=0;i<1800&&e.state.phase!=='dialogue';i++)e.step(1/30,args);
 assert.equal(e.state.phase,'dialogue');assert(e.blocked);
 assert.deepEqual(e.state.history.slice(0,4),['warning','opening','emerging','dialogue']);
 assert.equal(RIFT_WORDS,'Что происходит?!!!');
 assert(e.choose(choice));assert(e.blocked);assert.equal(e.state.choice,choice);
 e.step(.6,args);assert.equal(e.state.phase,'idle');assert.equal(e.blocked,false);
 assert.deepEqual(e.state.history.slice(0,6),['warning','opening','emerging','dialogue','closing','idle']);
 // Independent fast second-cycle test, not another long 1800-step wait.
 e.step(65,args);assert.equal(e.state.phase,'warning');assert.equal(e.state.cycle,1);
});
test('owner §21.5: event suspends countdown underwater/in battle',()=>{
 const e=createRiftEvent(9);
 const args={pos:{x:0,z:0},look:{x:0,z:1}};
 e.step(60,{...args,land:false});assert.equal(e.state.phase,'idle');
 e.step(60,{...args,battle:true});assert.equal(e.state.phase,'idle');
 e.step(50,args);assert.equal(e.state.phase,'warning');
 assert.equal(RIFT_PHASES.length,6);
});
test('owner §21.7: canonical single camera module replaces canceled phone deadzone',()=>{
 assert.equal(typeof createCameraRig,'function');
});
