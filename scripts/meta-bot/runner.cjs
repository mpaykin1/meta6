#!/usr/bin/env node
'use strict';
// Strict, read-only game state. All actions use real keyboard or browser touch input.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../..');
const games=[
 ['Twilight Island','observer-world-en-v7'],['Ashen Path','ashen-sumerek'],
 ['Underwater World','underwater-world'],['Three Worlds','three-worlds-game'],
 ['Veil Terraces','meta-games-worlds/veil-terraces'],['ABYSS GLOW','abyss-glow/play'],
 ['Archer in the Fog','playgama-games/archer-in-the-fog'],
 ['Twilight Isle Classic','playgama-games/twilight-isle-classic'],
 ['Twilight Isles 2','playgama-games/twilight-isles'],
 ['Underwater Sumerek','underwater-sumerek'],['Island Sumerek Biomes','island-sumerek-biomes']
].map(([name,source])=>({name,source,entry:
 fs.existsSync(path.join(root,'games',source.split('/').at(-1),'index.html'))?
 'games/'+source.split('/').at(-1):source}));
function select(){
 if(process.argv.includes('--all'))return games;
 if(process.argv.includes('--game')){
  const a=process.argv[process.argv.indexOf('--game')+1].replace(/\/index\.html$/,'').replace(/\/$/,'');
  return games.filter(g=>g.entry===a||g.source===a);
 }
 const b=process.env.BASE_SHA,h=process.env.HEAD_SHA;
 if(!b||!h)throw Error('Need exact BASE_SHA and HEAD_SHA');
 const changed=execFileSync('git',['diff','--name-only',b+'...'+h],{cwd:root,encoding:'utf8'}).split('\n');
 return games.filter(g=>changed.some(x=>x.startsWith(g.entry+'/')||x.startsWith(g.source+'/')));
}
function server(){
 const mime={html:'text/html',js:'text/javascript',mjs:'text/javascript',json:'application/json',glsl:'text/plain',png:'image/png',jpg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',glb:'model/gltf-binary',ogg:'audio/ogg',woff2:'font/woff2'};
 const app=http.createServer((req,res)=>{
  let u;try{u=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  const f=path.resolve(root,'.'+u);
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return}
  let target=f;try{if(fs.statSync(f).isDirectory())target=path.join(f,'index.html')}catch{}
  fs.readFile(target,(e,c)=>{
   if(e){res.writeHead(404).end();return}
   res.writeHead(200,{'Content-Type':(mime[path.extname(target).slice(1)]||'application/octet-stream'),'Cache-Control':'no-store'});res.end(c);
  });
 });
 return new Promise(ok=>app.listen(0,'127.0.0.1',()=>ok({app,port:app.address().port})));
}
const num=x=>typeof x==='number'&&Number.isFinite(x);
function valid(s){
 if(!s||!Number.isInteger(s.level)||!Number.isInteger(s.totalLevels)||s.level<1||s.level>s.totalLevels)throw Error('Invalid read-only bot level/totalLevels');
 if(!s.player||!num(s.player.x)||!num(s.player.y)||!num(s.player.z)||!s.goal||!num(s.goal.x)||!num(s.goal.z))throw Error('Missing physical player/goal coordinates');
 if(typeof s.alive!=='boolean'||typeof s.completed!=='boolean'||!Array.isArray(s.buttons)||!s.buttons.length||s.buttons.some(x=>typeof x!=='string'))throw Error('Missing alive/completed/buttons');
 if(typeof s.layout!=='string'||s.layout.length<8)throw Error('Missing world-layout fingerprint');
 if(typeof s.combat!=='boolean'||!Number.isInteger(s.enemies)||!Number.isInteger(s.weapons))throw Error('Missing actual enemy/weapon counters');
 if(s.level===1&&s.combat&&(s.enemies!==1||s.weapons!==1))throw Error('ПОСТЕПЕННО: initial combat must have one enemy and one weapon');
 if(s.level===1&&!s.combat&&s.enemies!==0)throw Error('ПОСТЕПЕННО: unexpected noncombat enemies');
 return s;
}
async function state(page){
 return valid(await page.evaluate(()=>{
  const d=Object.getOwnPropertyDescriptor(window,'__META_BOT__');
  if(!d||d.set)throw Error('Expected read-only window.__META_BOT__');
  const s=window.__META_BOT__;
  if(!s||typeof s!=='object'||Object.values(s).some(v=>typeof v==='function'))throw Error('Bot must expose data only');
  return JSON.parse(JSON.stringify(s));
 }));
}
async function visibleText(page){
 return page.evaluate(()=>{
  const result=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walk.nextNode()){
   const n=walk.currentNode,txt=n.textContent.trim();if(!txt)continue;
   let el=n.parentElement,hide=false;
   while(el){const s=getComputedStyle(el);
    if(el.hidden||el.hasAttribute('inert')||/^(SCRIPT|STYLE|NOSCRIPT|TITLE|TEMPLATE)$/.test(el.tagName)||s.display==='none'||s.visibility!=='visible'||parseFloat(s.opacity)===0){hide=true;break}
    el=el.parentElement;
   }
   if(hide)continue;
   const range=document.createRange();range.selectNodeContents(n);
   if(![...range.getClientRects()].some(r=>r.width&&r.height))continue;
   const button=n.parentElement.closest('button');
   if(txt==='☰'&&button&&button.getBoundingClientRect().right>innerWidth-85)continue;
   result.push(txt.slice(0,90));
  }
  return result;
 });
}
async function bounds(page){
 return page.evaluate(()=>{
  const r=document.querySelector('canvas')?.getBoundingClientRect(),html=document.documentElement;
  return [scrollX,scrollY,html.scrollWidth,html.scrollHeight,innerWidth,innerHeight,
   r?.x,r?.y,r?.width,r?.height,visualViewport?.width,visualViewport?.height];
 });
}
async function fps(page){
 return page.evaluate(async()=>{
  let last=0,frames=[];const start=performance.now();
  await new Promise(resolve=>{function tick(now){if(last)frames.push(now-last);last=now;
   if(now-start<2600)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
  frames.sort((a,b)=>a-b);
  return {fps:Number((frames.length*1000/(performance.now()-start)).toFixed(1)),p95:frames[Math.max(0,Math.ceil(frames.length*.95)-1)]||999};
 });
}
async function press(page,mobile,action,ms,jump=false){
 if(!mobile){
  await page.keyboard.down(action);
  try{if(jump)await page.keyboard.press('Space');await page.waitForTimeout(ms)}
  finally{await page.keyboard.up(action)}
  return;
 }
 // Browser-dispatched native touch events exercise the game's own joystick.
 const cdp=await page.context().newCDPSession(page),v=page.viewportSize();
 const p={id:1,x:Math.round(v.width*.19),y:Math.round(v.height*.8)};
 const m={id:1,x:p.x+Math.round(43*action[0]),y:p.y+Math.round(43*action[1])};
 try{
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[m]});
  if(jump){
   const j={id:2,x:v.width-50,y:v.height-75};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[m,j]});
   await page.waitForTimeout(80);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[m]});
  }
  await page.waitForTimeout(ms);
 }finally{
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}).catch(()=>{});
  await cdp.detach().catch(()=>{});
 }
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
async function playLevel(page,mobile,level){
 const actions=mobile?[[0,-1],[1,0],[0,1],[-1,0]]:['w','d','s','a'],vec=[];
 let s=await state(page);
 // Calibrate actual world motion using real 260ms inputs (camera-relative controls).
 for(const a of actions){
  const from=s.player;await press(page,mobile,a,260);s=await state(page);
  vec.push([s.player.x-from.x,s.player.z-from.z]);
  if(s.level>level||s.completed)return s;
 }
 let stall=0,last=distance(s.player,s.goal),location=s.player;
 const deadline=Date.now()+(Number(process.env.META_BOT_LEVEL_MS)||45000);
 while(Date.now()<deadline){
  s=await state(page);
  if(s.level>level||s.completed||!s.alive)return s;
  const toward=[s.goal.x-s.player.x,s.goal.z-s.player.z];
  let options=actions.map((a,i)=>({a,i,score:(vec[i][0]*toward[0]+vec[i][1]*toward[1])/(Math.hypot(...vec[i])||.001)}));
  options.sort((a,b)=>b.score-a.score);
  const choice=options[stall>=4?1:0],before=s.player;
  await press(page,mobile,choice.a,460,stall>=3);
  s=await state(page);
  if(s.level>level||s.completed||!s.alive)return s;
  const next=distance(s.player,s.goal);
  stall=(distance(location,s.player)<.17||next>last-.07)?stall+1:0;
  vec[choice.i]=[s.player.x-before.x,s.player.z-before.z];
  if(stall>=8){await press(page,mobile,actions[(choice.i+1)%4],540,true);stall=3}
  last=next;location=s.player;
 }
 throw Error('Stuck: cannot reach level '+level+' through real controls');
}
async function run(browser,url,name,mobile,baseline){
 const type=mobile?'390x844':'1280x720',problems=[],layouts=[];
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:720},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage();let total=0,passed=0,perf;
 page.on('pageerror',x=>problems.push('pageerror '+x.message));
 page.on('console',x=>{if(x.type()==='error')problems.push('console '+x.text())});
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2200);
  const first=await state(page);total=first.totalLevels;
  if(first.level!==1||!first.alive)throw Error('Not at playable first level');
  const pre=await bounds(page);
  const txt=await visibleText(page);
  if(txt.length)problems.push('ЧИСТЫЙ ЭКРАН: '+JSON.stringify(txt.slice(0,6)));
  perf=await fps(page);
  if(perf.fps<20)problems.push('FPS below 20: '+perf.fps);
  const prev=baseline[name+'|'+type];
  if(prev&&perf.fps<prev.fps*.7)problems.push('FPS regression '+perf.fps+' < '+prev.fps);
  for(let l=1;l<=total;l++){
   const s=await state(page);
   if(s.level!==l)throw Error('Level order mismatch at '+l+': '+s.level);
   if(layouts.includes(s.layout))problems.push('БЕЗ ПОВТОРОВ: level '+l+' layout repeated');
   layouts.push(s.layout);
   if(problems.length)break;
   const end=await playLevel(page,mobile,l);
   if(!end.alive)throw Error('Hero died at level '+l);
   if(!end.completed&&end.level!==l+1)throw Error('Level '+l+' unfinished');
   if(l<total&&end.level!==l+1)throw Error('Level '+l+' did not advance');
   passed++;
   const text=await visibleText(page);
   if(text.length)problems.push('ЧИСТЫЙ ЭКРАН after level '+l+': '+JSON.stringify(text.slice(0,4)));
  }
  const post=await bounds(page);
  if(pre[0]||pre[1]||post[0]||post[1]||post[2]>post[4]+2||post[3]>post[5]+2||
    [6,7,8,9,10,11].some(i=>!Number.isFinite(pre[i])||!Number.isFinite(post[i])||Math.abs(pre[i]-post[i])>2))
   problems.push('FIX: scrolling, stretching or moving canvas/viewport during joystick');
 }catch(e){problems.push(String(e.message||e))}
 finally{await context.close()}
 return {name,type,total,passed,problems,layouts,perf};
}
(async()=>{
 const chosen=select();
 if(!chosen.length){console.log('No game changed. Browser checks not executed.');return}
 const file=process.env.META_BOT_FPS_CACHE||'/tmp/meta-bot-fps.json';
 let baseline={};try{baseline=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}
 const next={...baseline},svc=await server(),browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const rows=[];
 try{
  for(const g of chosen){
   for(const mobile of [true,false]){
    const u='http://127.0.0.1:'+svc.port+'/'+g.entry+'/';
    const a=await run(browser,u,g.name,mobile,baseline),b=await run(browser,u,g.name,mobile,baseline);
    if(a.layouts.length&&b.layouts.length&&a.layouts[0]===b.layouts[0])a.problems.push('БЕЗ ПОВТОРОВ: identical first layout across independent runs');
    if(a.passed!==b.passed||a.total!==b.total)a.problems.push('Second run incomplete: '+b.passed+'/'+b.total);
    a.problems.push(...b.problems.map(x=>'run2 '+x));
    rows.push(a);
    if(!a.problems.length&&a.total&&a.passed===a.total)next[a.name+'|'+a.type]=a.perf;
   }
  }
 }finally{await browser.close();await new Promise(ok=>svc.app.close(ok))}
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(next));
 const lines=['## META BOT — Chromium player, no cheats','','| Game | Screen | Levels | Completed | Errors |','|---|---|---:|---:|---|'];
 for(const r of rows)lines.push('| '+r.name+' | '+r.type+' | '+r.total+' | '+r.passed+' | '+(r.problems.join('; ').replace(/\|/g,'/')||'0')+' |');
 const summary=lines.join('\n')+'\n';console.log(summary);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
 if(rows.some(r=>r.problems.length||!r.total||r.passed!==r.total))process.exitCode=1;
})().catch(e=>{console.error('META BOT FATAL',e);process.exitCode=1});
