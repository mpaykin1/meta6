import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const out=path.resolve('abyss-glow/evidence/maw-stand');
await mkdir(out,{recursive:true});
const profiles=[
  {name:'desktop',width:960,height:540,touch:false,scale:1},
  {name:'touch',width:390,height:844,touch:true,scale:2}
];
const phases=[['closed',0],['mid',.5],['open',1]];
const P=[108,168],TIP=[108,289];
const report={
  source:'abyss-glow/maw-stand/index.html',
  runtime:'GitHub Actions / headless Chromium / SwiftShader software renderer',
  physical_iphone:'UNKNOWN',gpu_draw_calls:'UNKNOWN',profiles:[],failures:[]
};

function percentile(values,p){
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return Number(sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(p*sorted.length)-1))].toFixed(3));
}
function map(matrix,point){
  return [matrix.a*point[0]+matrix.c*point[1]+matrix.e,
    matrix.b*point[0]+matrix.d*point[1]+matrix.f];
}
function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}

let browser;
try{
  browser=await chromium.launch({headless:true,args:[
    '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--enable-precise-memory-info'
  ]});
  for(const profile of profiles){
    const record={name:profile.name,viewport:[profile.width,profile.height],
      device_pixel_ratio:profile.scale,errors:[],samples:[],screenshots:[]};
    report.profiles.push(record);
    let context;
    try{
      context=await browser.newContext({viewport:{width:profile.width,height:profile.height},
        deviceScaleFactor:profile.scale,isMobile:profile.touch,hasTouch:profile.touch});
      const page=await context.newPage();
      await page.addInitScript(()=>{
        window.__mawDrawCalls=[];
        const original=CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage=function(...args){
          const m=this.getTransform();
          window.__mawDrawCalls.push({a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f,
            source:String(args[0]?.src||'')});
          return original.apply(this,args);
        };
      });
      page.on('pageerror',error=>record.errors.push('pageerror: '+error.message));
      page.on('console',msg=>{if(msg.type()==='error')record.errors.push('console: '+msg.text());});
      page.on('requestfailed',req=>record.errors.push('request: '+req.url()+' '+(req.failure()?.errorText||'failed')));
      await page.goto('http://127.0.0.1:8766/maw-stand/',{waitUntil:'networkidle',timeout:60000});
      await page.waitForFunction(()=>typeof window.__mawTest==='function',null,{timeout:30000});
      await page.waitForTimeout(250);
      const canvas=page.locator('canvas');
      const box=await canvas.boundingBox();
      assert(box,'canvas missing');
      assert.equal(Math.round(box.width),profile.width,profile.name+': canvas width');
      assert.equal(Math.round(box.height),profile.height,profile.name+': canvas height');

      const frameTimes=await page.evaluate(async()=>{
        const values=[];let previous=performance.now();
        await new Promise(resolve=>{
          function tick(now){values.push(now-previous);previous=now;if(values.length>=180)resolve();else requestAnimationFrame(tick)}
          requestAnimationFrame(tick);
        });
        return values.slice(5);
      });
      record.performance={sample_count:frameTimes.length,
        frame_time_p50_ms:percentile(frameTimes,.5),frame_time_p95_ms:percentile(frameTimes,.95),
        fps_p50:Number((1000/percentile(frameTimes,.5)).toFixed(2))};
      record.memory=await page.evaluate(()=>({
        used_js_heap_bytes:performance.memory?.usedJSHeapSize??null,
        total_js_heap_bytes:performance.memory?.totalJSHeapSize??null
      }));

      let closedPivot=null,closedTip=null;
      for(let direction=0;direction<8;direction++){
        for(const [phase,open] of phases){
          const calls=await page.evaluate(({open,direction})=>{
            window.__mawDrawCalls=[];window.__mawTest(open,direction);
            return window.__mawDrawCalls;
          },{open,direction});
          assert.equal(calls.length,6,profile.name+`: ${phase} direction ${direction} drawImage count`);
          const lower=calls[3];
          assert(lower.source.endsWith('/maw_front_atlas.png'),profile.name+': lower body source');
          const pivot=map(lower,P),tip=map(lower,TIP);
          if(direction===0&&phase==='closed'){closedPivot=pivot;closedTip=tip;}
          const pivotDrift=distance(pivot,closedPivot??pivot);
          const tipDisplacement=distance(tip,closedTip??tip);
          const visiblePixels=await page.evaluate(()=>{
            const canvas=document.querySelector('canvas');
            const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
            let visible=0;
            for(let i=0;i<pixels.length;i+=4){
              if(pixels[i]>30||pixels[i+1]>30||pixels[i+2]>30)visible++;
            }
            return visible;
          });
          record.samples.push({direction,phase,open,
            matrix:{a:lower.a,b:lower.b,c:lower.c,d:lower.d,e:lower.e,f:lower.f},
            pivot_drift_px:Number(pivotDrift.toFixed(4)),
            lower_tip_displacement_px:Number(tipDisplacement.toFixed(4)),
            visible_pixels:visiblePixels,canvas2d_draw_image_calls:calls.length});
          assert(pivotDrift<=.25,profile.name+`: ${phase} direction ${direction} hinge drift ${pivotDrift}`);
          if(phase==='open')assert(tipDisplacement>5,profile.name+`: direction ${direction} no tip motion`);
          assert(visiblePixels>200,profile.name+`: ${phase} direction ${direction} frame is empty/dark`);
          const file=`${profile.name}-d${direction}-${phase}.png`;
          const shot=await canvas.screenshot({path:path.join(out,file),timeout:30000});
          record.screenshots.push({file,bytes:shot.length,
            sha256:createHash('sha256').update(shot).digest('hex')});
          assert(shot.length>1500,profile.name+`: ${file} is empty`);
        }
      }
      const directionHashes=record.screenshots.filter(s=>s.file.endsWith('-closed.png')).map(s=>s.sha256);
      assert.equal(new Set(directionHashes).size,8,profile.name+': eight light directions are not visually distinct');
      for(let direction=0;direction<8;direction++){
        const phaseHashes=record.screenshots.filter(s=>s.file.includes(`-d${direction}-`)).map(s=>s.sha256);
        assert.equal(new Set(phaseHashes).size,3,profile.name+`: direction ${direction} animation phases are static`);
      }
      // Actual on-canvas dark-to-lunge pixels: software Chromium, not artistic or iPhone approval.
      record.attack_gate=[];
      for(const [label,seconds] of [['dark',0.4],['lunge',1.22],['attack',1.75],['retreat',2.8],['dark_again',4.4]]){
        const result=await page.evaluate(({seconds})=>{
          window.__mawDrawCalls=[];
          const state=window.__mawAttackTest(seconds,0);
          const c=document.querySelector('canvas'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
          let visible=0;
          for(let i=0;i<data.length;i+=4)if(data[i]>30||data[i+1]>30||data[i+2]>30)visible++;
          return {state,visible_pixels:visible,draw_calls:window.__mawDrawCalls.length};
        },{seconds});
        const shot=await canvas.screenshot({path:path.join(out,profile.name+'-attack-'+label+'.png'),timeout:30000});
        const digest=createHash('sha256').update(shot).digest('hex');
        record.attack_gate.push({label,seconds,...result,sha256:digest});
      }
      const attacks=Object.fromEntries(record.attack_gate.map(s=>[s.label,s]));
      assert.equal(attacks.dark.visible_pixels,0,profile.name+': initial darkness must be black');
      assert.equal(attacks.dark_again.visible_pixels,0,profile.name+': final darkness must be black');
      assert.equal(attacks.dark.draw_calls,0,profile.name+': darkness should avoid asset draws');
      assert(attacks.attack.visible_pixels>200,profile.name+': maw did not emerge from darkness');
      assert.equal(attacks.attack.draw_calls,6,profile.name+': jaw layers missing');
      assert(attacks.attack.state.scale>attacks.lunge.state.scale,profile.name+': maw failed to approach camera');
      assert(attacks.attack.state.open>=.95,profile.name+': jaw not fully open');
      assert(attacks.lunge.state.visibility>0&&attacks.lunge.state.visibility<1,profile.name+': lunge transition missing');
      assert.notEqual(attacks.lunge.sha256,attacks.attack.sha256,profile.name+': identical lunge and attack');
      assert.notEqual(attacks.attack.sha256,attacks.retreat.sha256,profile.name+': identical attack and retreat');
      if(profile.touch){
        const before=await page.evaluate(()=>({scrollX,scrollY}));
        await page.touchscreen.tap(Math.round(profile.width*.5),Math.round(profile.height*.5));
        const after=await page.evaluate(()=>({scrollX,scrollY}));
        assert.deepEqual(after,before,'touch changed page scroll');
      }
      assert.equal(record.errors.length,0,profile.name+': '+record.errors.join('; '));
      record.status='PASS_SWIFTSHADER_NOT_DEVICE';
    }catch(error){
      record.status='FAIL';record.error=String(error?.stack||error);
      report.failures.push(profile.name+': '+String(error?.message||error));
    }finally{if(context)await context.close();}
  }
}catch(error){report.failures.push('browser: '+String(error?.stack||error));}
finally{
  if(browser)await browser.close();
  report.status=report.failures.length?'FAIL':'PASS_SWIFTSHADER_NOT_ARTISTIC_ACCEPTANCE';
  await writeFile(path.join(out,'maw-browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,profiles:report.profiles.map(p=>({
    name:p.name,status:p.status,performance:p.performance,memory:p.memory,
    sample_count:p.samples.length,screenshot_count:p.screenshots.length,error:p.error
  })),failures:report.failures},null,2));
}
if(report.failures.length)process.exitCode=1;
