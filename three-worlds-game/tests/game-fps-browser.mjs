// Reproducible actual-game FPS baseline for §15 / graf §27.
// This records CI Chromium + SwiftShader only; it is not physical-iPhone evidence
// and intentionally introduces no performance pass/fail threshold.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,unlink,stat} from 'node:fs/promises';
import path from 'node:path';

const root='three-worlds-game/evidence/performance';
const base=process.env.TEST_BASE||'http://127.0.0.1:8765/three-worlds-game/';
const profiles=[
 {name:'desktop-1440x900',viewport:{width:1440,height:900},deviceScaleFactor:1},
 {name:'mobile-emulation-390x844-dpr2',viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}
];
const percentile=(sorted,p)=>sorted[Math.max(0,Math.ceil(sorted.length*p)-1)];
const summarize=deltas=>{
 const frameTimes=[...deltas].sort((a,b)=>a-b);
 const fps=deltas.map(ms=>1000/ms).sort((a,b)=>a-b);
 return {
  frameTimeMs:{
   p50:Number(percentile(frameTimes,.50).toFixed(3)),
   p95:Number(percentile(frameTimes,.95).toFixed(3)),
   max:Number(frameTimes.at(-1).toFixed(3))
  },
  fps:{
   p05:Number(percentile(fps,.05).toFixed(2)),
   p50:Number(percentile(fps,.50).toFixed(2)),
   p95:Number(percentile(fps,.95).toFixed(2))
  }
 };
};
await mkdir(root,{recursive:true});
// Expose existing production pass instances only inside this disposable test page.
// The shipped index remains byte-identical to the pinned offline build.
const instrumentedPath=path.join(root,'postfx-instrumented.html');
const marker='window.__isle = {';
const productionHtml=await readFile('three-worlds-game/index.html','utf8');
assert.equal(productionHtml.split(marker).length,2,'post-FX instrumentation marker must be unique');
await writeFile(instrumentedPath,productionHtml.replace(marker,
 `${marker}\n  postFx: { composer, bloom, dofH, dofV, finalPass },`));
const testUrl=new URL('evidence/performance/postfx-instrumented.html',base).href;
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--enable-unsafe-swiftshader'
]});
const report={
 kind:'ACTUAL_GAME_RAF_BASELINE',
 performancePass:'UNKNOWN - measurement only',
 physicalIPhone:'UNKNOWN - mobile profile is Chromium emulation',
 sampleFrames:240,
 profiles:[]
};
try{
 for(const profile of profiles){
  const {name,...contextOptions}=profile;
  const context=await browser.newContext(contextOptions);
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push('PAGE '+e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text());});
   await page.goto(testUrl,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>!!window.__isle?.renderer&&!!window.__isle?.startGame,{timeout:30000});
   const scene=await page.evaluate(async()=>{
    const i=window.__isle,p=i.player;
    if(i.G.state==='title')i.startGame();
    i.killFoes();i.clearInput();i.G.fade=1;i.G.todT=i.G.tod=.1;
    const x=44.5,z=49.5,y=i.terrainTop(x,z)+.3;
    p.pos.set(x,y,z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=false;
    // Warm the exact production game loop and renderer before sampling.
    await new Promise(resolve=>{
     let frames=120;
     const tick=()=>--frames<=0?resolve():requestAnimationFrame(tick);
     requestAnimationFrame(tick);
    });
    const gl=i.renderer.getContext();
    const debug=gl.getExtension('WEBGL_debug_renderer_info');
    return {
     state:i.G.state,position:{x:p.pos.x,y:p.pos.y,z:p.pos.z},
     seed:i.SEED??i.world?.seed??i.G.seed??'UNKNOWN',
     canvasCss:{width:i.renderer.domElement.clientWidth,height:i.renderer.domElement.clientHeight},
     drawingBuffer:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight},
     gpuVendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),
     gpuRenderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
     webglVersion:gl.getParameter(gl.VERSION),
     rendererIsOriginalCanvas:i.renderer.domElement===document.querySelector('#c'),
     canvasCount:document.querySelectorAll('canvas').length
    };
   });
   assert.equal(scene.state,'play','game must be running during FPS sample');
   assert(scene.rendererIsOriginalCanvas,'FPS sample must use the original game renderer canvas');
   const deltas=await page.evaluate(sampleFrames=>new Promise(resolve=>{
    const values=[];let previous;
    const tick=now=>{
     if(previous!==undefined)values.push(now-previous);
     previous=now;
     if(values.length>=sampleFrames)resolve(values);
     else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
   }),report.sampleFrames);
   assert.equal(deltas.length,report.sampleFrames,'incomplete RAF sample');
   assert(deltas.every(n=>Number.isFinite(n)&&n>0),'invalid RAF frame time');
   const metrics=summarize(deltas);
   assert(metrics.frameTimeMs.p95>=metrics.frameTimeMs.p50,'invalid frame-time percentiles');
   const screenshot=path.join(root,name+'.png');
   await page.screenshot({path:screenshot,animations:'disabled',timeout:30000});
   assert((await stat(screenshot)).size>7000,'empty FPS evidence screenshot');
   const renderInfo=await page.evaluate(()=>{
    const info=__isle.renderer.info;
    return {
     render:{calls:info.render.calls,triangles:info.render.triangles,points:info.render.points,lines:info.render.lines},
     memory:{geometries:info.memory.geometries,textures:info.memory.textures},
     programs:info.programs?.length||0
    };
   });
   const scaleSweep=[];
   const postFxAblation=[];
   if(name==='desktop-1440x900'){
    for(const scale of [.5,.4,.3]){
     const sample=await page.evaluate(async scale=>{
      const i=__isle;
      i.perf.lock=true;
      i.perf.scale=scale;
      dispatchEvent(new Event('resize'));
      await new Promise(resolve=>{
       let frames=8;
       const tick=()=>--frames<=0?resolve():requestAnimationFrame(tick);
       requestAnimationFrame(tick);
      });
      const deltas=await new Promise(resolve=>{
       const values=[];let previous;
       const tick=now=>{
        if(previous!==undefined)values.push(now-previous);
        previous=now;
        if(values.length>=24)resolve(values);
        else requestAnimationFrame(tick);
       };
       requestAnimationFrame(tick);
      });
      const gl=i.renderer.getContext();
      return {scale,deltas,drawingBuffer:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight}};
     },scale);
     scaleSweep.push({scale:sample.scale,drawingBuffer:sample.drawingBuffer,metrics:summarize(sample.deltas)});
    }
    for(let i=1;i<scaleSweep.length;i++){
     const prev=scaleSweep[i-1].drawingBuffer,cur=scaleSweep[i].drawingBuffer;
     assert(cur.width*cur.height<prev.width*prev.height,'scale sweep must reduce rendered pixels');
    }
    const scenarios=[
     {name:'all-on',enabled:{bloom:true,dofH:true,dofV:true,finalPass:true}},
     {name:'bloom-off',enabled:{bloom:false,dofH:true,dofV:true,finalPass:true}},
     {name:'dof-off',enabled:{bloom:true,dofH:false,dofV:false,finalPass:true}},
     {name:'final-off',enabled:{bloom:true,dofH:true,dofV:true,finalPass:false}},
     {name:'bloom-dof-off',enabled:{bloom:false,dofH:false,dofV:false,finalPass:true}}
    ];
    for(const scenario of scenarios){
     const sample=await page.evaluate(async scenario=>{
      const i=__isle,fx=i.postFx;
      assertPostFx(fx);
      i.perf.lock=true;i.perf.scale=.5;dispatchEvent(new Event('resize'));
      for(const [key,enabled] of Object.entries(scenario.enabled))fx[key].enabled=enabled;
      await new Promise(resolve=>{
       let frames=8;
       const tick=()=>--frames<=0?resolve():requestAnimationFrame(tick);
       requestAnimationFrame(tick);
      });
      const deltas=await new Promise(resolve=>{
       const values=[];let previous;
       const tick=now=>{
        if(previous!==undefined)values.push(now-previous);
        previous=now;
        if(values.length>=24)resolve(values);
        else requestAnimationFrame(tick);
       };
       requestAnimationFrame(tick);
      });
      const gl=i.renderer.getContext();
      return {
       deltas,
       drawingBuffer:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight},
       enabled:Object.fromEntries(Object.keys(scenario.enabled).map(key=>[key,fx[key].enabled])),
       passCount:fx.composer.passes.length
      };
      function assertPostFx(fx){
       if(!fx||!fx.composer||!fx.bloom||!fx.dofH||!fx.dofV||!fx.finalPass)
        throw Error('production post-processing diagnostics unavailable');
      }
     },scenario);
     const screenshot=path.join(root,'postfx-'+scenario.name+'.png');
     await page.screenshot({path:screenshot,animations:'disabled',timeout:30000});
     assert((await stat(screenshot)).size>7000,'empty post-FX ablation screenshot');
     assert.deepEqual(sample.enabled,scenario.enabled,scenario.name+' pass state mismatch');
     assert(sample.passCount>=6,'production post-processing stack is incomplete');
     postFxAblation.push({
      name:scenario.name,drawingBuffer:sample.drawingBuffer,enabled:sample.enabled,
      passCount:sample.passCount,metrics:summarize(sample.deltas),screenshot
     });
    }
    const expectedBuffer=postFxAblation[0].drawingBuffer;
    assert(postFxAblation.every(x=>x.drawingBuffer.width===expectedBuffer.width&&
     x.drawingBuffer.height===expectedBuffer.height),'post-FX ablation changed resolution');
    await page.evaluate(()=>{
     const fx=__isle.postFx;
     fx.bloom.enabled=fx.dofH.enabled=fx.dofV.enabled=fx.finalPass.enabled=true;
     __isle.perf.lock=false;
    });
   }
   assert.deepEqual(errors,[],'browser errors during FPS sample: '+errors.join(' | '));
   report.profiles.push({name,scenario:'accepted island test plaza, idle, tod=0.1',scene,metrics,renderInfo,scaleSweep,postFxAblation,errors,screenshot});
   console.log('GAME_FPS_PROFILE '+JSON.stringify({name,scene,metrics,renderInfo,scaleSweep,postFxAblation}));
  }finally{await context.close();}
 }
 await writeFile(path.join(root,'game-fps-baseline.json'),JSON.stringify(report,null,2)+'\n');
 console.log('GAME_FPS_BASELINE_RECORDED '+JSON.stringify({
  physicalIPhone:report.physicalIPhone,
  profiles:report.profiles.map(({name,scene,metrics})=>({name,resolution:scene.drawingBuffer,metrics}))
 }));
}finally{
 await browser.close();
 await unlink(instrumentedPath).catch(()=>{});
}
