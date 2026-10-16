import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = 'http://127.0.0.1:8765/underwater-world/';
await mkdir('underwater-world/evidence',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-certificate-errors']});
async function boot(context,path,extra=''){
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('PAGEERROR '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text());});
 await page.goto(base+'?'+extra,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__isle?.G?.state==='play',{timeout:60000});
 await page.waitForTimeout(5200);
 assert.equal(errors.length,0,'Browser errors: '+errors.join('\n'));
 const baseline=await page.evaluate(()=>({
   state:window.__isle.G.state,
   canvas:!!document.querySelector('canvas'),
   controls:!!document.querySelector('#v7MobileHud'),
   weaponCount:window.__isle.ARSENAL_ORDER.length,
   uw:!!window.__isle.underwater,
   webgl:!!(document.querySelector('canvas').getContext('webgl2')||document.querySelector('canvas').getContext('webgl'))
 }));
 assert(baseline.webgl,'WebGL renderer should initialize');
 assert(baseline.uw,'Underwater runtime should exist');
 await page.screenshot({path:'underwater-world/evidence/'+path+'.png'});
 return {page,baseline,errors};
}
const pc=await browser.newContext({viewport:{width:1440,height:900}});
const d=await boot(pc,'desktop','');
assert.equal(await d.page.locator('#v7MobileHud').isVisible(),false,'Desktop should hide phone buttons');
const start=await d.page.evaluate(()=>[window.__isle.player.pos.x,window.__isle.player.pos.z]);
await d.page.keyboard.down('KeyW');
await d.page.waitForTimeout(650);
await d.page.keyboard.up('KeyW');
const debug=await d.page.evaluate(()=>({state:window.__isle.G.state,timeScale:window.__isle.G.timeScale,fade:window.__isle.G.fade,respawn:window.__isle.player.respawn,hitstop:window.__isle.G.hitstop}));
const pos=await d.page.evaluate(()=>[window.__isle.player.pos.x,window.__isle.player.pos.z]);
console.log('WASD_EVIDENCE',JSON.stringify({start,pos,debug}));
assert(Math.hypot(pos[0]-start[0],pos[1]-start[1])>.12,'WASD must move player');
await d.page.keyboard.down('ArrowRight');
await d.page.waitForTimeout(500);
await d.page.keyboard.up('ArrowRight');
const submerged=await d.page.evaluate(()=>{
 const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0);
 return {y:i.player.pos.y,underwater:i.underwater.isSubmerged()};
});
assert(submerged.underwater,'Teleport into water should activate diving');
await d.page.waitForTimeout(450);
const y0=await d.page.evaluate(()=>window.__isle.player.pos.y);
await d.page.keyboard.down('Space');
await d.page.waitForTimeout(650);
const y1=await d.page.evaluate(()=>window.__isle.player.pos.y);
await d.page.keyboard.up('Space');
await d.page.waitForTimeout(650);
const y2=await d.page.evaluate(()=>window.__isle.player.pos.y);
assert(y1>y0+.12,'Hold Space should rise: '+[y0,y1,y2]);
assert(y2<y1-.08,'Release Space should descend: '+[y0,y1,y2]);
await d.page.keyboard.press('KeyB');
const bathy=await d.page.evaluate(()=>({
 entered:window.__isle.underwater.inBathyscaphe,
 unarmed:window.__isle.underwater.canFire()
}));
assert(bathy.entered,'B should enter bathyscaphe');
assert.equal(bathy.unarmed,false,'Without picked ranged weapon no firing');
await d.page.evaluate(()=>{const i=window.__isle;i.giveAll();i.equip('pistol');i.combat.ammo.pistol=6});
await d.page.waitForTimeout(200);
assert(await d.page.evaluate(()=>window.__isle.underwater.canFire()),'picked pistol with ammo should fire');
await d.page.screenshot({path:'underwater-world/evidence/diving-desktop.png'});
console.log('DESKTOP_PASS',JSON.stringify({baseline:d.baseline,y0,y1,y2,bathy,armed:true}));
await pc.close();
const phone=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const m=await boot(phone,'mobile','v7test=1');
assert.equal(await m.page.locator('#v7MobileHud').isVisible(),true,'Phone HUD should render');
const data=await m.page.evaluate(()=>({
 overflow:getComputedStyle(document.body).overflow,
 hudButtons:['v7Swap','v7Build','v7Action','v7Stick'].every(id=>!!document.getElementById(id)),
 scroll:[scrollX,scrollY]
}));
assert(data.hudButtons,'All phone controls must be present');
assert.equal(data.overflow,'hidden','Viewport should be fixed');
await m.page.evaluate(()=>{const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0)});
await m.page.waitForTimeout(550);
await m.page.locator('#v7Swap').dispatchEvent('pointerdown',{pointerId:501,buttons:1,clientX:336,clientY:650,pointerType:'touch'});
assert(await m.page.evaluate(()=>window.__isle.underwater.inBathyscaphe),'Phone weapon button should enter bathyscaphe underwater');
await m.page.screenshot({path:'underwater-world/evidence/diving-mobile.png'});
console.log('MOBILE_PASS',JSON.stringify({baseline:m.baseline,...data}));
assert.equal(m.errors.length,0,'Phone browser errors: '+m.errors.join('\n'));
await phone.close();await browser.close();
