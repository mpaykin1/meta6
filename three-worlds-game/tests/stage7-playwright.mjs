// Short Chromium/SwiftShader integration gates; evidence is UNKNOWN until this script executes.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_BASE||'http://127.0.0.1:8765/three-worlds-game/';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:800},hasTouch:true}),errors=[],report={base,environment:'Chromium emulated WebGL; GPU/iPhone unverified'};
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await mkdir('three-worlds-game/evidence',{recursive:true});
const shot=async(name,x,z,y)=>{
 await page.evaluate(({x,z,y})=>{const i=window.__isle;i.player.pos.set(x,y??i.terrainTop(x,z)+.2,z);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);i.terrainWindow().update(x,z);i.underwater.update(.016);
 // Recenter only the test camera after a debug teleport; otherwise inertial lag photographs the old island.
 i.rig.pos.set(x+11,i.player.pos.y+8,z+13);i.rig.look.set(x,i.player.pos.y+1,z);
 i.camera.position.copy(i.rig.pos);i.camera.lookAt(i.rig.look);}, {x,z,y});
 await page.waitForTimeout(200);
 await page.screenshot({path:'three-worlds-game/evidence/'+name+'.png'});
};
try{
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:16000});
 await page.waitForFunction(()=>window.__isle?.underwater,{timeout:16000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame()});
 await page.waitForFunction(()=>window.__isle.G.state==='play',{timeout:6000});
 await page.waitForFunction(()=>!document.querySelector('#loading'),null,{timeout:6000});
 await shot('stage7-shore',63,32);
 report.shore=await page.evaluate(()=>{const i=__isle;return {ground:i.terrainTop(63,32),edge:i.terrainTop(64,32),depth:i.underwater.immersionAt()}});
 assert(Math.abs(report.shore.ground-report.shore.edge)<1,'A: shore vertical seam');
 // D: check actual loaded model instances, not estimated per-chunk multipliers, at 3 seeds.
 report.populationBySeed=[];
 for(const seed of [1,1337,90210]){
  await page.evaluate(seed=>{const i=__isle;i.rebuild(seed);i.player.pos.set(82,.5,35);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);i.terrainWindow().update(82,35);i.underwater.update(1/30)},seed);
  await page.waitForFunction(()=>{const p=__isle.underwater.population(40);return p.ruins>0&&p.wrecks>0&&p.plants>0&&p.fish>=10},{timeout:6000});
  const p=await page.evaluate(()=>{const i=__isle,p=i.underwater.population(40),h=[];for(let x=65;x<=105;x+=5)for(let z=15;z<=55;z+=5)h.push(i.terrainTop(x,z));return {...p,seed:i.G.seed,relief:Math.max(...h)-Math.min(...h)}});
  assert.equal(p.seed,seed);assert(p.relief>3,'D: flat ocean for seed '+seed);
  report.populationBySeed.push(p);
 }
 await shot('stage7-depth',82,35,0.5);
 // C: actual runtime pooled bubbles, emitted from the live underwater module.
 report.bubbles=await page.evaluate(()=>{const i=__isle;i.player.pos.set(82,.5,35);i.player.vel.y=1.4;for(let k=0;k<120;k++)i.underwater.update(1/60);return i.underwater.bubbleCount});
 assert(report.bubbles>0&&report.bubbles<=96,'C: live bubble pool empty/unbounded');
 // F desktop LMB drag: BOTH yaw and canvas geometry must be asserted (no optional null gate).
 const before=await page.evaluate(()=>({yaw:__isle.rig.yawT,rect:document.querySelector('#c').getBoundingClientRect().toJSON(),scrollX,scrollY}));
 await page.mouse.move(900,350);await page.mouse.down();await page.mouse.move(1050,390,{steps:6});await page.mouse.up();
 const after=await page.evaluate(()=>({yaw:__isle.rig.yawT,rect:document.querySelector('#c').getBoundingClientRect().toJSON(),scrollX,scrollY}));
 assert.notEqual(before.yaw,after.yaw,'F: LMB orbit yaw did not change');assert.deepEqual(after.rect,before.rect);assert.equal(after.scrollX,before.scrollX);assert.equal(after.scrollY,before.scrollY);
 // F independent actual touch pointers: hold joystick and drag camera simultaneously via CDP.
 const cdp=await page.context().newCDPSession(page);
 const fire=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
 const stick={x:160,y:600,id:1},stickMoved={x:210,y:600,id:1},look={x:900,y:410,id:2},lookMoved={x:1040,y:450,id:2};
 const yaw0=await page.evaluate(()=>__isle.rig.yawT);
 await fire('touchStart',[stick]);await fire('touchStart',[stick,look]);await fire('touchMove',[stickMoved,lookMoved]);
 report.dualTouch=await page.evaluate(()=>({yaw:__isle.rig.yawT,stickId:__isle.inputPointers.stickId,camId:__isle.inputPointers.camId,vx:__isle.inputPointers.vx}));
 await fire('touchEnd',[]);
 assert.notEqual(report.dualTouch.stickId,null);assert.notEqual(report.dualTouch.camId,null);assert.notEqual(report.dualTouch.stickId,report.dualTouch.camId);
 assert(report.dualTouch.vx>.1,'F: joystick did not respond while orbit dragged');
 assert.notEqual(report.dualTouch.yaw,yaw0,'F: camera did not respond while stick held');
 report.camera={before,after};
 // E two REAL finishGuest paths: death and rewarded return; check timer reset in runtime.
 await page.evaluate(()=>__isle.rifts.spawnGuest());
 await page.waitForTimeout(180);
 await page.screenshot({path:'three-worlds-game/evidence/stage7-rift-guest.png'});
 report.kill=await page.evaluate(()=>{const r=__isle.rifts,g=r.guest;if(!g)throw Error('guest missing');g.landed=true;g.brain.hp=0;r.update(1/60);return {ended:!r.guest,...r.guestTimer}});
 assert(report.kill.ended&&report.kill.cycle===1&&report.kill.remaining>=50&&report.kill.remaining<=70,'E: kill did not rearm guest');
 report.reward=await page.evaluate(()=>{const r=__isle.rifts;r.spawnGuest();const g=r.guest;if(!g)throw Error('second guest missing');g.landed=true;g.rewarded=true;g.brain.relation='friend';g.mesh.position.set(-126,__isle.terrainTop(-126,32)+1.6,32);r.update(1/60);return {ended:!r.guest,...r.guestTimer}});
 assert(report.reward.ended&&report.reward.cycle===2&&report.reward.remaining>=50&&report.reward.remaining<=70,'E: rewarded return did not rearm guest');
 // G virtual WALK/SWIM simulation uses the real updatePlayer and underwater physics.
 await page.evaluate(()=>{const i=__isle;i.player.pos.set(82,i.terrainTop(82,32)+.3,32);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);i.player.onGround=true;i.G.state='play';i.terrainWindow().update(82,32)});
 report.path=await page.evaluate(()=>{const i=__isle,trace=[];let steps=0;while(i.player.pos.x<142&&steps<950){i.sim(1/30,1,0,false,false);steps++;if(steps%90===0)trace.push([+i.player.pos.x.toFixed(2),+i.player.pos.y.toFixed(2)])}return {steps,x:i.player.pos.x,z:i.player.pos.z,y:i.player.pos.y,sea:i.SEA,health:i.player.hp,trace,ground:i.terrainTop(i.player.pos.x,i.player.pos.z)}});
 assert(report.path.x>=142,'G: player cannot traverse water to emergent island');
 assert(report.path.ground>report.path.sea,'G: destination is not walkable land');
 await shot('stage7-emergent-island',report.path.x,report.path.z);
 assert.equal(errors.length,0,errors.join('\n'));
 report.errors=errors;report.result='BROWSER_GATES_OK (NOT OWNER PASS)';
 await writeFile('three-worlds-game/evidence/stage7-browser.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
