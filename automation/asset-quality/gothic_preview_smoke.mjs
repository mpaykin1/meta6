import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('/tmp/abyss-gothic');
const report={renderer:'Chromium SwiftShader, NOT physical mobile GPU',profiles:[],status:'UNKNOWN'};
await mkdir(root,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const p of [{name:'portrait-touch',width:390,height:844,touch:true},{name:'desktop',width:960,height:540,touch:false}]){
    const context=await browser.newContext({viewport:{width:p.width,height:p.height},isMobile:p.touch,hasTouch:p.touch});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:8766/',{waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>window.__abyssGothicPreview?.().ready===5,null,{timeout:30000});
    const a=await page.evaluate(()=>window.__abyssGothicPreview());
    await page.waitForTimeout(600);
    const b=await page.evaluate(()=>window.__abyssGothicPreview());
    assert(b.frames>a.frames+2,'preview animation stalled');
    if(p.touch){
      await page.touchscreen.tap(290,370);
    }else{
      await page.mouse.click(700,250);
    }
    const c=await page.evaluate(()=>window.__abyssGothicPreview());
    assert.equal(c.mode,1,'pointer/touch failed');
    assert.equal(c.failed.length,0,'SVG load failures');
    assert.equal(errors.length,0,'browser errors');
    const png=await page.locator('#view').screenshot();
    const file='gothic-preview-'+p.name+'.png';
    await writeFile(path.join(root,file),png);
    report.profiles.push({profile:p.name,assets:c.ready,frames_advanced:b.frames-a.frames,touch_or_mouse:c.mode,errors,screenshot:file});
    await context.close();
  }
  report.status='PASS_BROWSER_EMULATION';
}catch(e){report.status='FAIL';report.error=String(e);process.exitCode=1}
finally{if(browser)await browser.close();await writeFile(path.join(root,'browser-preview-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))}
