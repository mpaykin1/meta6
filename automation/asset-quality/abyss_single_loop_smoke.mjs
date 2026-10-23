import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {chromium} from 'playwright';

const out = path.resolve('abyss-glow/evidence');
await mkdir(out,{recursive:true});
const report = {target:'one gameplay RAF loop; unchanged art and assets',runtime:'Chromium SwiftShader software GPU',real_device:false,results:[],failures:[]};
const profiles=[
  {name:'desktop',width:960,height:540,touch:false,scale:1},
  {name:'touch',width:390,height:844,touch:true,scale:2}
];
async function pixels(page,png) {
  return page.evaluate(async base64=>{
    const img = new Image();img.src='data:image/png;base64,'+base64;await img.decode();
    const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;
    const c=cv.getContext('2d');c.drawImage(img,0,0);
    const data=c.getImageData(0,0,cv.width,cv.height).data;
    let dark=0,total=0,visible=0,central=0;
    for(let y=0;y<cv.height;y+=3)for(let x=0;x<cv.width;x+=3){
      const ix=(y*cv.width+x)*4,v=Math.max(data[ix],data[ix+1],data[ix+2]);
      total++;if(v<30)dark++;
      if(x>=cv.width*.25&&x<cv.width*.75&&y>=cv.height*.25&&y<cv.height*.75){central++;if(v>60)visible++}
    }
    return {dark:Number((dark/total).toFixed(4)),visible_center:Number((visible/central).toFixed(4))};
  },png.toString('base64'));
}
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  for(const profile of profiles){
    const variants=[];
    for(const variant of ['original','optimized']){
      const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.scale,isMobile:profile.touch,hasTouch:profile.touch});
      const page=await context.newPage();
      const errors=[];
      try{
        await page.addInitScript(()=>{const previous=window.requestAnimationFrame;window.__rafCounts={};window.requestAnimationFrame=function(fn){const n=fn.name||'anonymous';window.__rafCounts[n]=(window.__rafCounts[n]||0)+1;return previous.call(window,fn)}});
        page.on('pageerror',e=>errors.push(String(e)));
        page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
        const route=variant==='original'?'/':'/single-loop.html';
        await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>typeof window.__abyssStats==='function'&&window.__abyssStats().calls>0,null,{timeout:90000});
        await page.waitForTimeout(1300);
        const before=await page.evaluate(()=>window.__abyssStats());
        const tx=Math.round(profile.width*.83),ty=Math.round(profile.height*.39);
        if(profile.touch){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:tx,y:ty}]});await page.waitForTimeout(1100);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach()}
        else{await page.mouse.move(tx,ty);await page.mouse.down();await page.waitForTimeout(1100);await page.mouse.up()}
        const after=await page.evaluate(()=>window.__abyssStats());
        const movement=Number(Math.hypot(after.hero[0]-before.hero[0],after.hero[1]-before.hero[1]).toFixed(2));
        assert(movement>1,variant+': '+profile.name+' player motion missing');
        const zones=[];
        for(const zone of [0,4]){
          await page.evaluate(z=>{const prev=Math.random;Math.random=()=>0;try{window.__abyssTest(z)}finally{Math.random=prev}},zone);
          await page.waitForTimeout(1200);
          const shot=await page.locator('#gl').screenshot({timeout:60000});
          const score=await pixels(page,shot);
          const file='single-loop-'+profile.name+'-'+variant+'-zone'+(zone+1)+'.png';
          await writeFile(path.join(out,file),shot);
          assert(score.dark>=.70,variant+' zone '+(zone+1)+' darkness failed');
          assert(score.visible_center>=.001,variant+' zone '+(zone+1)+' blank center');
          zones.push({zone:zone+1,screenshot:file,sha256:createHash('sha256').update(shot).digest('hex'),...score});
        }
        const final=await page.evaluate(()=>({stats:window.__abyssStats(),raf:{...window.__rafCounts},scrollY:window.scrollY}));
        assert(final.stats.calls>0,'draw calls absent');
        assert(final.stats.chunks>0,'chunks absent');
        assert.equal(final.scrollY,0,'scroll detected');
        assert.equal(errors.length,0,'browser errors '+errors.join('; '));
        assert(final.raf.q0>0,'game RAF not executing');
        if(variant==='original')assert(final.raf.D>0,'expected documented secondary FPS RAF in source');
        else assert.equal(final.raf.D||0,0,'secondary RAF persists');
        const result={variant,profile:profile.name,raf:final.raf,movement,zones,fps_samples:final.stats.fps,errors,status:'PASS_SWIFTSHADER'};
        report.results.push(result);variants.push(result);
      }catch(e){report.failures.push({variant,profile:profile.name,error:String(e)});variants.push(null)}
      finally{await context.close()}
    }
    if(variants.every(Boolean))for(let i=0;i<2;i++){
      const delta=Math.abs(variants[0].zones[i].dark-variants[1].zones[i].dark);
      assert(delta<=.08,profile.name+' zone '+variants[0].zones[i].zone+' dark area visually regressed: '+delta);
    }
  }
}catch(e){report.failures.push({error:String(e)})}
finally{if(browser)await browser.close();report.status=report.failures.length?'FAIL':'PASS_SOFTWARE_BROWSER_NOT_DEVICE';await writeFile(path.join(out,'single-loop-comparison.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
if(report.failures.length)process.exitCode=1;
