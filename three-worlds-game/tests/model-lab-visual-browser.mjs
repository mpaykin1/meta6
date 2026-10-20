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
  palette:Number(document.documentElement.getAttribute('data-palette-colors'))
 }));
 if(info.model!=='gpt-rift-scout-v1'||info.directions!==8||info.frames!==8||info.cells!==64||info.parts!==15||info.palette!==12)
  throw Error('atlas DOM contract mismatch '+JSON.stringify(info));
 const atlas=await page.screenshot({path:out+'/scout-atlas.png',clip:{x:0,y:0,width:768,height:768},omitBackground:true});
 const samples=[];
 for(const [name,x,y] of [['front-idle',0,0],['front-stride',0,192],['side-idle',192,0],['rear-stride',384,192]]){
  const png=await page.screenshot({path:`${out}/scout-${name}.png`,clip:{x,y,width:96,height:96},omitBackground:true});
  samples.push({name,sha256:createHash('sha256').update(png).digest('hex'),bytes:png.length});
 }
 if(new Set(samples.map(x=>x.sha256)).size!==samples.length)throw Error('rendered direction/frame samples are identical');
 const evidence={...info,atlas:{sha256:createHash('sha256').update(atlas).digest('hex'),bytes:atlas.length},samples,
  browser:'Playwright Chromium 1.56.1 / SwiftShader',resolution:'800x800 DPR1',visualParity:'UNKNOWN',fpsP50P95:'UNKNOWN',gameIntegration:false};
 await writeFile(out+'/scout-render.json',JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence));
}finally{await browser.close()}
