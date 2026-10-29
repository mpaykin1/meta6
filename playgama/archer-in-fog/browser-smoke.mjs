import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const errors=[];
const pages=[];
const code='T'+Math.random().toString(36).slice(2,7).toUpperCase();
try {
 for(const dim of [[390,844],[1280,720]]){
  const pg=await b.newPage({viewport:{width:dim[0],height:dim[1]}});
  pg.on('pageerror',err=>errors.push(err.message));
  await pg.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:45000});
  await pg.locator('text=CO-OP 2–4').waitFor({timeout:45000});
  const label=await pg.locator('#menu h1').innerText();
  assert.match(label,/ARCHER/);
  pages.push(pg);
  await pg.screenshot({path:'browser-'+dim[0]+'.png'});
  console.log('MENU_READY',dim[0],dim[1]);
 }
 for(const pg of pages){
   await pg.getByText('CO-OP 2–4').click();
   await pg.locator('#mpCode').fill(code);
   await pg.locator('#mpJoin').click();
 }
 for(const pg of pages){
  await pg.waitForFunction((c)=>document.querySelector('#mpStatus')?.textContent?.includes('ROOM '+c+' 2/4'),code,{timeout:90000});
  assert.equal(await pg.locator('#menu').evaluate(e=>e.classList.contains('hide')),true);
 }
 console.log('BROWSER_MULTIPLAYER_ROOM_PASS');
 assert.deepEqual(errors,[]);
} finally{await b.close()}
