// Four short live browser gates; no multi-minute waits or fabricated PASS.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_BASE||'http://127.0.0.1:8765/three-worlds-game/';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={base,environment:'Chromium emulated WebGL; GPU/iPhone unverified'};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await mkdir('three-worlds-game/evidence',{recursive:true});
try{
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>window.__isle?.G?.state==='play',{timeout:20000});
 const shot=async(name,x,z,y)=>{await page.evaluate(({x,z,y})=>{const i=window.__isle;i.player.pos.set(x,y??i.terrainTop(x,z)+.2,z);i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);i.underwater.update(.016);i.terrainWindow().update(x,z);}, {x,z,y});await page.waitForTimeout(300);await page.screenshot({path:'three-worlds-game/evidence/'+name+'.png'});};
 await shot('stage7-shore',63,32);
 report.shore=await page.evaluate(()=>{const i=window.__isle;return {ground:i.terrainTop(63,32),edge:i.terrainTop(64,32),depth:i.underwater.immersionAt()}});
 assert(Math.abs(report.shore.ground-report.shore.edge)<1,'shore vertical seam');
 await shot('stage7-depth',82,35,0.5);
 report.deep=await page.evaluate(()=>{const i=window.__isle;let n=0;for(let k=0;k<90;k++)i.underwater.update(1/60);return {bubbleCount:i.underwater.bubbleCount,population:i.underwater.population(40),y:i.player.pos.y}});
 assert(report.deep.bubbleCount>0&&report.deep.bubbleCount<=96,'bounded bubbles visible');
 assert(report.deep.population.fish>=10,'10 fish within 40');
 assert(report.deep.population.ruins>0&&report.deep.population.plants>0&&report.deep.population.wrecks>0,'visible category distribution');
 const before=await page.evaluate(()=>({yaw:__isle.rig?.yaw??null,rect:document.querySelector('#c').getBoundingClientRect().toJSON()}));
 await page.mouse.move(900,350);await page.mouse.down();await page.mouse.move(1020,390,{steps:6});await page.mouse.up();await page.waitForTimeout(150);
 const after=await page.evaluate(()=>({yaw:__isle.rig?.yaw??null,rect:document.querySelector('#c').getBoundingClientRect().toJSON()}));
 report.camera={before,after};assert.deepEqual(after.rect,before.rect);
 if(before.yaw!==null&&after.yaw!==null)assert.notEqual(before.yaw,after.yaw,'mouse orbit yaw did not change');
 await page.evaluate(()=>{__isle.rifts.spawnGuest()});
 await page.waitForTimeout(250);await page.screenshot({path:'three-worlds-game/evidence/stage7-rift-guest.png'});
 report.guest=await page.evaluate(()=>({active:!!__isle.rifts.guest,timer:__isle.rifts.guestTimer}));assert(report.guest.active,'rift guest must appear');
 await shot('stage7-emergent-island',145,32);
 report.island=await page.evaluate(()=>{const i=__isle;return {landHeight:i.terrainTop(145,32),waterHeight:i.terrainTop(75,32),world:i.worlds.active}});
 assert(report.island.landHeight>3.8,'emergent island above sea');
 assert.equal(errors.length,0,errors.join('\n'));
 report.errors=errors;report.result='BROWSER_GATES_OK (not owner PASS)';
 await writeFile('three-worlds-game/evidence/stage7-browser.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
