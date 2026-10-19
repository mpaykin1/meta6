import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const checks={browserLockPass:false,cameraLockPass:false,mobilePass:false,worldLifePass:false,riftPass:false,desktopPass:'NOT_RUN',realPagesPass:'NOT_RUN',ownerPass:'UNKNOWN'};
const url='http://127.0.0.1:8765/three-worlds-game/';
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
 await page.waitForFunction(()=>!!window.__isle?.worldLife&&!!document.querySelector('#v7Stick'),{timeout:20000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame();__isle.killFoes();});
 await page.locator('#v7Stick').waitFor({state:'visible',timeout:15000});
 await page.waitForTimeout(260);
 const before=await page.evaluate(()=>({scroll:[scrollX,scrollY],r:document.querySelector('#c').getBoundingClientRect().toJSON(),
   camera:__isle.camera.position.toArray(),hero:__isle.player.pos.toArray(),yaw:__isle.rig.yaw,
   width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
   inner:[innerWidth,innerHeight]}));
 const center=await page.locator('#v7Stick').boundingBox();
 const x=center.x+center.width/2,y=center.y+center.height/2;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let k=0;k<4;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+25+k*5,y:y-6,id:1}]});
 await page.waitForTimeout(420);
 const during=await page.evaluate(()=>({scroll:[scrollX,scrollY],r:document.querySelector('#c').getBoundingClientRect().toJSON(),
  camera:__isle.camera.position.toArray(),hero:__isle.player.pos.toArray(),
  input:__isle.inputPointers,lock:__isle.cameraLock,
  width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(90);
 const after=await page.evaluate(()=>({scroll:[scrollX,scrollY],input:__isle.inputPointers,
  r:document.querySelector('#c').getBoundingClientRect().toJSON()}));
 assert.deepEqual(before.scroll,[0,0]);assert.deepEqual(during.scroll,[0,0]);assert.deepEqual(after.scroll,[0,0]);
 assert(Math.abs(during.r.x-before.r.x)<1&&Math.abs(after.r.y-before.r.y)<1);
 assert(during.width<=390+1&&during.height<=844+1,'browser viewport overflow');
 checks.browserLockPass=true;
 assert(during.input.vx>.15,'actual touch joystick did not feed player controls');
 assert(after.input.vx===0&&after.input.vy===0,'joystick stuck after release');
 checks.mobilePass=true;
 assert(during.lock.active,'character camera lock disabled');
 const drift=Math.hypot(...during.camera.map((v,i)=>v-before.camera[i]));
 const walk=Math.hypot(during.hero[0]-before.hero[0],during.hero[2]-before.hero[2]);
 assert(walk>.008,'hero did not move from joystick');
 assert(drift<.1,'camera translated with joystick: '+drift);
 checks.cameraLockPass=true;
 // Three real terrain samples; proofs are counts of actual scene brains, original foes and pickup objects.
 const worldSamples=[];
 for(const x of [20,145,-92]){
  const life=await page.evaluate(async x=>{
   const i=__isle,z=32,ground=i.terrainTop(x,z);
   i.player.pos.set(x,ground+.25,z);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const p=i.worldLife.plan;
   return {x,biome:p?.region,ground,npc:i.worldLife.npcs,enemy:i.foes.filter(f=>f.hp>0&&Math.hypot(f.segs[0].x-x,f.segs[0].z-z)<40).length,
     loot:i.loot.filter(w=>w.alive&&Math.hypot(w.x-x,w.z-z)<40).map(w=>w.id),expected:p?.weapons.map(w=>w.id)};
  },x);
  assert(life.npc>=2&&life.enemy>=2,'empty living population on '+x+': '+JSON.stringify(life));
  assert(life.expected?.length===20&&new Set(life.expected).size===20,'20 original types missing on '+x);
  for(const id of life.expected)assert(life.loot.includes(id),'original pickup '+id+' missing on '+x);
  worldSamples.push(life);
 }
 checks.worldLifePass=true;
 // Real original animated scavenger, procedural warning and modal choice, <=1800 frames.
 await page.evaluate(()=>{const i=__isle;i.killFoes();i.player.pos.set(20,i.terrainTop(20,32)+.3,32);
   i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);});
 const event=await page.evaluate(()=>{
  const i=__isle;for(let j=0;j<1800&&i.rifts.event.phase!=='dialogue';j++)i.rifts.update(1/30);
  const g=i.rifts.guest,st=i.rifts.event,dx=st.spot?.x-i.player.pos.x,dz=st.spot?.z-i.player.pos.z;
  const facing=i.player.look;
  return {phase:st.phase,history:st.history,locked:i.G.riftFrozen,visible:!!g&&i.scene.children.includes(g.mesh),
    parts:g?.mesh.children.length||0,distance:Math.hypot(dx,dz),alignment:(dx*facing.x+dz*facing.z)/(Math.hypot(dx,dz)*Math.hypot(facing.x,facing.z)),
    modal:!!document.querySelector('#threeWorldsGuestChoice')?.open,
    labels:[...document.querySelectorAll('#threeWorldsGuestChoice button')].map(b=>b.textContent)};
 });
 assert.deepEqual(event.history.slice(0,4),['warning','opening','emerging','dialogue']);
 assert(event.visible&&event.parts>0&&event.modal&&event.locked,'guest or dialog missing');
 assert(Math.abs(event.distance-2.6)<.1&&event.alignment>.99,'portal not facing hero');
 assert.deepEqual(event.labels,['Помочь','Отказаться']);
 await page.locator('#threeWorldsGuestChoice button').first().click();
 const complete=await page.evaluate(()=>{const i=__isle;i.rifts.update(.7);return {locked:i.G.riftFrozen,phase:i.rifts.event.phase,relation:i.rifts.guest?.brain.relation}});
 assert.equal(complete.locked,false);assert.equal(complete.phase,'idle');assert.equal(complete.relation,'friend');
 // Short second cycle in ONE virtual update; verify refusal branch too.
 const second=await page.evaluate(()=>{const i=__isle;i.rifts.update(65);i.rifts.update(.65);i.rifts.update(1.25);i.rifts.update(1);
  return {phase:i.rifts.event.phase,cycle:i.rifts.event.cycle,visible:!!i.rifts.guest}});
 assert.equal(second.phase,'dialogue');assert(second.visible);
 await page.locator('#threeWorldsGuestChoice button').last().click();
 const refusal=await page.evaluate(()=>{const i=__isle;i.rifts.update(.7);
  return {phase:i.rifts.event.phase,relation:i.rifts.guest?.brain.relation,locked:i.G.riftFrozen}});
 assert.equal(refusal.relation,'hostile');assert.equal(refusal.locked,false);
 checks.riftPass=true;
 assert.deepEqual(errors,[]);
 checks.proof={before,during,after,worldSamples,event,complete,second,refusal};
 await mkdir('three-worlds-game/evidence',{recursive:true});
 await writeFile('three-worlds-game/evidence/owner042-044-code.json',JSON.stringify(checks,null,2));
 console.log('OWNER042_044_CODE_OK '+JSON.stringify({mobile:checks.mobilePass,land:checks.worldLifePass,rift:checks.riftPass}));
}finally{await browser.close();}
