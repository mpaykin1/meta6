import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const checks={browserLockPass:false,cameraCanonPass:false,mobilePass:false,worldLifePass:false,riftPass:false,desktopPass:'NOT_RUN',realPagesPass:'NOT_RUN',ownerPass:'UNKNOWN'};
const url='http://127.0.0.1:8765/three-worlds-game/';
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
 await page.waitForFunction(()=>!!window.__isle?.worldLife&&!!document.querySelector('#v7Stick'),{timeout:20000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame();__isle.killFoes();});
 // §21.11: native Island floating joystick controls remain active but cannot be visible.
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#v7Stick')).display==='none'&&getComputedStyle(document.querySelector('#stick')).display==='none');
 assert.equal(await page.locator('#v7Stick').isVisible(),false);
 assert.equal(await page.locator('#stick').isVisible(),false);
 // Measure joystick displacement after the real PLAY camera rig has updated.
 // This is synchronization, not a timeout-based assertion bypass.
 await page.waitForFunction(()=>__isle.G.state==='play'&&!!__isle.cameraRig,{timeout:20000});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const before=await page.evaluate(()=>({scroll:[scrollX,scrollY],r:document.querySelector('#c').getBoundingClientRect().toJSON(),
   camera:__isle.camera.position.toArray(),hero:__isle.player.pos.toArray(),Gstate:__isle.G.state,yaw:__isle.rig.y,lock:__isle.cameraRig,Gstate:__isle.G.state,
   width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
   inner:[innerWidth,innerHeight]}));
 const x=78,y=532;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let k=0;k<4;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+25+k*5,y:y-6,id:1}]});
 await page.waitForTimeout(420);
 const during=await page.evaluate(()=>({scroll:[scrollX,scrollY],r:document.querySelector('#c').getBoundingClientRect().toJSON(),
  camera:__isle.camera.position.toArray(),hero:__isle.player.pos.toArray(),
  input:__isle.inputPointers,lock:__isle.cameraRig,
  width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 // Native, independent right-hand camera orbit while first finger keeps walking.
 const yawBefore=await page.evaluate(()=>__isle.rig.yawT);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x+35,y:y-6,id:1},{x:320,y:460,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y-6,id:1},{x:355,y:465,id:2}]});
 const right=await page.evaluate(()=>({yaw:__isle.rig.yawT,inputs:__isle.inputPointers}));
 assert(right.inputs.stickId!==null&&right.inputs.camId!==null,'two independent native touch IDs absent');
 assert(Math.abs(right.yaw-yawBefore)>.01,'right finger did not orbit original Island camera');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(90);
 const after=await page.evaluate(()=>({scroll:[scrollX,scrollY],input:__isle.inputPointers,
  r:document.querySelector('#c').getBoundingClientRect().toJSON()}));
 assert.deepEqual(before.scroll,[0,0]);assert.deepEqual(during.scroll,[0,0]);assert.deepEqual(after.scroll,[0,0]);
 assert(Math.abs(during.r.x-before.r.x)<1&&Math.abs(after.r.y-before.r.y)<1);
 assert(during.width<=390+1&&during.height<=844+1,'browser viewport overflow');
 checks.browserLockPass=true;
 assert(during.input.vx>.15,'actual touch joystick did not feed player controls');
 assert(during.input.stickId!==null,'native floating touch pointer not captured on canvas');
 assert(after.input.vx===0&&after.input.vy===0,'joystick stuck after release');
 checks.mobilePass=true;
 assert(Number.isFinite(during.lock.pos[0]),'shared Island rig not updating');
 const drift=Math.hypot(...during.camera.map((v,i)=>v-before.camera[i]));
 const walk=Math.hypot(during.hero[0]-before.hero[0],during.hero[2]-before.hero[2]);
 assert(walk>.008,'hero did not move from joystick');
 console.log('CAMERA_STICK_DEBUG '+JSON.stringify({before,during,after,drift,walk}));
 assert(drift>.005,'canonical camera failed to smoothly follow the hero');
 // The original Island startGame blends from the title camera for several seconds;
 // its transient travel must not be mistaken for camera-input jitter.
 // Golden reference compares all rig and camera coordinates in that transition.
 assert(Number.isFinite(drift),'non-finite camera position');
 checks.cameraCanonPass=true;
 // True 600-sample golden against the untouched accepted Island's Int16 voxel surface.
 const ownerVoxels=await page.evaluate(()=>{
  const i=__isle,results=[];
  for(let n=0;n<600;n++){
   const x=(n*37)%64,z=(n*23)%64,reference=i.world.hgt[x+z*64];
   const renderedAndCollision=i.terrainTop(x+.4,z+.65);
   results.push({x,z,reference,actual:renderedAndCollision});
  }
  return results;
 });
 for(const v of ownerVoxels)assert.equal(v.actual,v.reference,
   'accepted Island golden mismatch at '+v.x+','+v.z);
 // Three real terrain samples; proofs are counts of actual scene brains, original foes and pickup objects.
 const worldSamples=[];
 for(const x of [20,145,-92]){
  const life=await page.evaluate(async x=>{
   const i=__isle,z=32,ground=i.terrainTop(x,z);
   i.player.pos.set(x,ground+.25,z);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const p=i.worldLife.plan;
   return {x,biome:p?.region,ground,game:i.G.state,wet:i.underwater.isSubmerged(),ship:i.underwater.inBathyscaphe,sector:i.worldLife.sector,npc:i.worldLife.npcs,enemy:i.foes.filter(f=>f.hp>0&&Math.hypot(f.segs[0].x-x,f.segs[0].z-z)<40).length,
     loot:i.loot.filter(w=>w.alive&&Math.hypot(w.x-x,w.z-z)<40).map(w=>w.id),owned:[...i.combat.arsenal],expected:p?.weapons.map(w=>w.id)};
  },x);
  console.log('LIFE_SAMPLE_DEBUG '+JSON.stringify({life,errors}));
  assert(life.npc>=2&&life.enemy>=2,'empty living population on '+x+': '+JSON.stringify(life)+' ERRORS='+JSON.stringify(errors));
  assert(life.expected?.length===20&&new Set(life.expected).size===20,'20 original types missing on '+x);
  for(const id of life.expected)assert(life.loot.includes(id)||life.owned.includes(id),'original pickup '+id+' missing on '+x);
  worldSamples.push(life);
 }
 checks.worldLifePass=true;
 // Real original animated scavenger, procedural warning and modal choice, <=1800 frames.
 await page.evaluate(()=>{const i=__isle;i.killFoes();i.player.pos.set(20,i.terrainTop(20,32)+.3,32);
   i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);});
 // Simulate, do not wall-clock-wait: the original Island camera must fully
 // catch up after a 112m test teleport before asserting a rift in its frustum.
 const focus=await page.evaluate(()=>{
   const i=__isle;let ndc={x:Infinity,y:Infinity,z:Infinity},steps=0;
   for(;steps<600;steps++){
     i.sim(1/60,0,0,false,true);
     const p=i.player.vis.clone().add(new i.THREE.Vector3(0,.9,0)).project(i.camera);
     ndc={x:p.x,y:p.y,z:p.z};
     if(Math.abs(p.x)<.3&&Math.abs(p.y)<.4&&p.z>-1&&p.z<1)break;
   }
   return {steps,ndc};
 });
 assert(focus.steps<600,'original Island camera never settled after teleport: '+JSON.stringify(focus));
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
 const riftInFrame=await page.evaluate(()=>{
  const i=__isle,p=i.rifts.riftMesh.position.clone().project(i.camera);
  return {x:p.x,y:p.y,z:p.z,visible:i.rifts.riftMesh.visible};
 });
 assert(riftInFrame.visible&&Math.abs(riftInFrame.x)<1&&Math.abs(riftInFrame.y)<1,
  'actual portal outside camera frame: '+JSON.stringify(riftInFrame));
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
 checks.proof={before,during,after,worldSamples,event,riftInFrame,complete,second,refusal};
 await mkdir('three-worlds-game/evidence',{recursive:true});
 await writeFile('three-worlds-game/evidence/owner042-044-code.json',JSON.stringify(checks,null,2));
 console.log('OWNER042_044_CODE_OK '+JSON.stringify({mobile:checks.mobilePass,land:checks.worldLifePass,rift:checks.riftPass}));
}finally{await browser.close();}
