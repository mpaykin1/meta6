// §21.14(B) genuine Playwright/browser check of the live original Island controls.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.mobileMove&&!!window.__isle?.stepKeyboard,{timeout:30000});
 const proof=await page.evaluate(()=>{
  const i=__isle;
  if(i.G.state==='title')i.startGame();
  i.killFoes();i.clearInput();
  const x=20,z=32,y=i.terrainTop(x,z);
  i.player.pos.set(x,y+.08,z);
  i.player.vel.set(0,0,0);
  i.player.onGround=false;
  for(let k=0;k<40;k++)i.stepKeyboard(1/60); // settle on real original voxels
  const before=i.player.pos.clone(),dry=!i.underwater.isSubmerged(),initialLock=!!i.G.riftFrozen;
  i.mobileMove(.85,0);
  for(let k=0;k<90;k++)i.stepKeyboard(1/60);
  const movement=Math.hypot(i.player.pos.x-before.x,i.player.pos.z-before.z);
  i.mobileMove(0,0);
  // Return to accepted dry voxel floor and prime the original coyote/jump circuit.
  i.player.pos.set(20,i.terrainTop(20,32)+.08,32);
  i.player.vel.set(0,0,0);i.player.onGround=true;
  i.player.coyote=.11;
  i.mobileCombo(true);
  const pressed={jumpHeld:i.player.jumpHeld,attack:i.input.atk,source:i.input.src.touch};
  i.stepKeyboard(1/60);
  const jumped=i.player.vel.y>0&&i.player.pos.y>i.terrainTop(i.player.pos.x,i.player.pos.z);
  i.mobileCombo(false);i.mobileRelease();
  const after={attack:i.input.atk,jumpHeld:i.player.jumpHeld,vx:i.inputPointers.vx};
  return {initialLock,dry,movement,pressed,jumped,after,scroll:[scrollX,scrollY],canvas:document.querySelectorAll('#c').length,
    stickDisplay:getComputedStyle(document.querySelector('#stick')).display};
 });
 assert(proof.dry&&!proof.initialLock,'test must start in unfrozen dry original Island');
 assert(proof.movement>.25,'native mobile movement does not move real hero: '+JSON.stringify(proof));
 assert(proof.pressed.jumpHeld&&proof.pressed.attack&&proof.pressed.source,'native jump or attack press is not accepted');
 assert(proof.jumped,'live hero could not jump from original Island voxels');
 assert.equal(proof.after.attack,false,'touch attack stuck after release');
 assert.equal(proof.after.jumpHeld,false,'touch jump stuck after release');
 assert.equal(proof.after.vx,0,'touch movement stuck after release');
 assert.deepEqual(proof.scroll,[0,0]);
 assert.equal(proof.canvas,1);
 assert.equal(proof.stickDisplay,'none','original invisible mobile stick became visible');
 assert.deepEqual(errors,[],'browser errors '+errors.join(' | '));
 console.log('OWNER_2114_INPUT_LIVE_PASS '+JSON.stringify(proof));
}finally{await browser.close();}
