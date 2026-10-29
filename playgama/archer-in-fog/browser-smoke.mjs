import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',err=>errors.push(err.message));
try {
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.getByText('CO-OP 2–4').waitFor({timeout:45000});
  assert.match(await page.locator('#menu h1').innerText(),/ARCHER/);
  await page.screenshot({path:'browser-390.png'});
  console.log('MENU_READY_390');
  await page.getByText('CO-OP 2–4').click();
  assert.equal(await page.locator('#mpLobby').isVisible(),true);
  const room='T'+Math.random().toString(36).slice(2,7).toUpperCase();
  await page.locator('#mpCode').fill(room);
  await page.locator('#mpJoin').click();
  await page.waitForFunction(code=>document.querySelector('#mpStatus')?.textContent?.includes('ROOM '+code+' 1/4'),room,{timeout:90000});
  assert.equal(await page.locator('#menu').evaluate(e=>e.classList.contains('hide')),true);
  await page.screenshot({path:'browser-room.png'});
  console.log('BROWSER_COOP_JOIN_PASS');
  assert.deepEqual(errors,[],'JavaScript runtime errors');
} finally {await browser.close()}
