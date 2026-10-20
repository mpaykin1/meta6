import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='three-worlds-game/evidence/model-lab';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:800,height:800},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8765/three-worlds-game/models-lab/gpt-rift-scout-v1.svg',{waitUntil:'load'});
 const info=await page.evaluate(()=>({
  model:document.documentElement.getAttribute('data-model'),
  directions:Number(document.documentElement.getAttribute('data-directions')),
  frames:Number(document.documentElement.getAttribute('data-frames')),
  cells:document.querySelectorAll('g[data-dir][data-frame]').length,
  parts:Number(document.documentElement.getAttribute('data-parts')),
  palette:Number(document.documentElement.getAttribute('data-palette-colors')),
  reusedDefs:Number(document.documentElement.getAttribute('data-reused-defs')),
  useInstances:document.querySelectorAll('use').length,
  facingDetails:[...document.querySelectorAll('[data-facing-detail]')].map(node=>node.getAttribute('data-facing-detail')),
  beaconPulse:[...document.querySelectorAll('[data-motion-detail="beacon-pulse"]')].map(node=>({radius:Number(node.getAttribute('r')),opacity:Number(node.getAttribute('opacity'))}))
 }));
 if(info.model!=='gpt-rift-scout-v1'||info.directions!==8||info.frames!==8||info.cells!==64||info.parts!==15||info.palette!==14||info.reusedDefs!==45||info.useInstances!==896||info.facingDetails.length!==64||new Set(info.facingDetails).size!==8||info.beaconPulse.length!==64||new Set(info.beaconPulse.map(sample=>sample.radius)).size!==5||new Set(info.beaconPulse.map(sample=>sample.opacity)).size!==5)
  throw Error('atlas DOM contract mismatch '+JSON.stringify(info));
 const atlas=await page.screenshot({path:out+'/scout-atlas.png',clip:{x:0,y:0,width:768,height:768},omitBackground:true});
 const atlasHash=createHash('sha256').update(atlas).digest('hex');
 if(atlasHash!=='69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b')throw Error('SVG reuse changed the rendered atlas '+atlasHash);
 const samples=[];
 for(const [name,x,y] of [['front-idle',0,0],['front-stride',0,192],['side-idle',192,0],['rear-stride',384,192]]){
  const png=await page.screenshot({path:`${out}/scout-${name}.png`,clip:{x,y,width:96,height:96},omitBackground:true});
  samples.push({name,sha256:createHash('sha256').update(png).digest('hex'),bytes:png.length});
 }
 if(new Set(samples.map(x=>x.sha256)).size!==samples.length)throw Error('rendered direction/frame samples are identical');
 const labPreviewPerformance=await page.evaluate(async()=>{
  const root=document.documentElement;
  const frameTimes=[];
  let previous;
  for(let frame=0;frame<180;frame++){
   await new Promise(resolve=>requestAnimationFrame(now=>{
    if(previous!==undefined)frameTimes.push(now-previous);
    previous=now;
    const cell=frame%64;
    root.setAttribute('viewBox',`${(cell%8)*96} ${Math.floor(cell/8)*96} 96 96`);
    resolve();
   }));
  }
  root.setAttribute('viewBox','0 0 768 768');
  const percentile=(values,q)=>{
   const sorted=[...values].sort((a,b)=>a-b);
   return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))];
  };
  const fps=frameTimes.map(ms=>1000/ms);
  return {
   frames:frameTimes.length,
   frameTimeMs:{p50:percentile(frameTimes,.5),p95:percentile(frameTimes,.95)},
   fps:{p50:percentile(fps,.5),p95:percentile(fps,.95)}
  };
 });
 if(labPreviewPerformance.frames<170||!Number.isFinite(labPreviewPerformance.frameTimeMs.p95))
  throw Error('lab preview performance sample incomplete '+JSON.stringify(labPreviewPerformance));
 const evidence={...info,atlas:{sha256:atlasHash,bytes:atlas.length},samples,
  browser:'Playwright Chromium 1.56.1 / SwiftShader',resolution:'800x800 DPR1',labPreviewPerformance,visualParity:'UNKNOWN',gameFpsP50P95:'UNKNOWN',gameIntegration:false};
 await writeFile(out+'/scout-render.json',JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence));
}finally{await browser.close()}
