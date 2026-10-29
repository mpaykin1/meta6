(()=>{'use strict';
// ABYSS GLOW play: owner-derived layered maw encounter in actual game.
// No changes to the accepted stand. Transparent overlay does not intercept touch.
const SIZE=[217,289], P=[108,168], atlas=new Image(),lights=new Image(),throatArt=new Image();
const lanternSide=new Image(),lanternFront=new Image(),invertedBells=new Image();
atlas.src='../assets/maw_front_v1/maw_front_atlas.png';
lights.src='../assets/maw_front_v1/maw_front_light8.png';
lanternSide.src='assets/lantern-ray/lantern_ray_side4.png';
lanternFront.src='assets/lantern-ray/lantern_ray_front.png';
invertedBells.src='assets/lantern-ray/inverted_bells_biome.png';
// Palette-locked 96x112 crop from sketches/maw_front_owner.png; embedded to avoid a third network request.
throatArt.src='data:image/png;base64,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';
const canvas=document.createElement('canvas');
canvas.id='play-maw';canvas.setAttribute('aria-hidden','true');
canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;z-index:4;pointer-events:none;image-rendering:pixelated';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
ctx.imageSmoothingEnabled=false;
// Cache the two soft gradients and the throat silhouette once; the live loop only composites them.
const haloCanvas=document.createElement('canvas'),haloCtx=haloCanvas.getContext('2d');
haloCanvas.width=haloCanvas.height=256;
const haloGradient=haloCtx.createRadialGradient(128,128,6,128,128,128);
haloGradient.addColorStop(0,'rgba(253,231,102,.18)');
haloGradient.addColorStop(.36,'rgba(249,189,43,.12)');
haloGradient.addColorStop(.7,'rgba(173,66,1,.045)');
haloGradient.addColorStop(1,'rgba(0,0,0,0)');
haloCtx.fillStyle=haloGradient;haloCtx.fillRect(0,0,256,256);
// Cached broken rings and suspended flecks make the predator travel through water depth instead of only scaling up.
const wakeCanvas=document.createElement('canvas'),wakeCtx=wakeCanvas.getContext('2d');
wakeCanvas.width=wakeCanvas.height=256;wakeCtx.translate(128,128);wakeCtx.globalCompositeOperation='lighter';
for(let ring=0;ring<4;ring++){
 wakeCtx.strokeStyle=ring%2?'rgba(229,120,7,.22)':'rgba(249,189,43,.17)';
 wakeCtx.lineWidth=1+ring*.45;wakeCtx.setLineDash([8+ring*3,15+ring*5]);
 wakeCtx.beginPath();wakeCtx.arc(0,0,30+ring*22,-2.75,2.7);wakeCtx.stroke();
}
wakeCtx.setLineDash([]);
for(let i=0;i<24;i++){
 const angle=(i/24)*Math.PI*2+(i%3)*.09,r=24+(i*29%83),length=4+(i%5)*2;
 wakeCtx.save();wakeCtx.rotate(angle);wakeCtx.globalAlpha=.14+(i%4)*.035;
 wakeCtx.fillStyle=i%3?'#E57807':'#FDE766';wakeCtx.fillRect(r,-.55,length,1.1);wakeCtx.restore();
}
function traceThroat(g){
 g.beginPath();g.moveTo(P[0]-3,P[1]-27);
 g.bezierCurveTo(P[0]+28,P[1]-22,P[0]+36,P[1]+6,P[0]+30,P[1]+32);
 g.bezierCurveTo(P[0]+25,P[1]+53,P[0]+12,P[1]+64,P[0]+2,P[1]+67);
 g.bezierCurveTo(P[0]-14,P[1]+61,P[0]-28,P[1]+49,P[0]-33,P[1]+26);
 g.bezierCurveTo(P[0]-38,P[1]+1,P[0]-25,P[1]-21,P[0]-3,P[1]-27);g.closePath();
}
const throatGlowCanvas=document.createElement('canvas'),throatGlowCtx=throatGlowCanvas.getContext('2d');
throatGlowCanvas.width=96;throatGlowCanvas.height=112;
const throatLayers=[];
function cacheThroatGlow(){
 throatGlowCtx.imageSmoothingEnabled=false;throatGlowCtx.globalCompositeOperation='lighter';
 throatGlowCtx.shadowColor='#E57807';throatGlowCtx.shadowBlur=11;throatGlowCtx.globalAlpha=.7;
 throatGlowCtx.drawImage(throatArt,0,0);
 throatGlowCtx.shadowColor='#F9BD2B';throatGlowCtx.shadowBlur=4;throatGlowCtx.globalAlpha=.34;
 throatGlowCtx.drawImage(throatArt,0,0);
 // Split the owner's painted cavity into concentric tissue rings once; the live loop only articulates them.
 const rings=[[47,55,35,42],[36,43,25,31],[26,32,15,20],[16,21,0,0]];
 for(const [outerX,outerY,innerX,innerY] of rings){
  const layer=document.createElement('canvas'),g=layer.getContext('2d');
  layer.width=96;layer.height=112;g.imageSmoothingEnabled=false;g.drawImage(throatArt,0,0);
  g.globalCompositeOperation='destination-in';g.beginPath();g.ellipse(48,56,outerX,outerY,0,0,Math.PI*2);g.fill();
  if(innerX>0){g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(48,56,innerX,innerY,0,0,Math.PI*2);g.fill()}
  throatLayers.push(layer);
 }
}
const rect={upper:{body:[2,2],detail:[223,2],emissive:[665,2]},lower:{body:[2,295],detail:[223,295],emissive:[665,295]}};
let partCache=null;
// Blend the 8 painted light directions only when touch/pointer input moves; the live renderer keeps one draw per jaw.
const lightCanvas={upper:document.createElement('canvas'),lower:document.createElement('canvas')};
const lightCtx={upper:lightCanvas.upper.getContext('2d'),lower:lightCanvas.lower.getContext('2d')};
for(const part of ['upper','lower']){
 lightCanvas[part].width=SIZE[0];lightCanvas[part].height=SIZE[1];lightCtx[part].imageSmoothingEnabled=false;
}
// Side fins and long owner-painted spines are separate rigid secondary parts.
// Each polygon stays outside the eyes, teeth and central jaw hinge.
const FIN_REGIONS=[
 // Keep the eye sockets and central jaw out of the moving masks; only the external painted fins articulate.
 {pivot:[45,123],phase:.25,points:[[0,72],[43,72],[43,116],[55,145],[55,166],[0,166]]},
 {pivot:[172,123],phase:1.65,points:[[174,70],[217,70],[217,166],[162,166],[162,145],[174,116]]}
];
function traceRegion(g,points){
 g.beginPath();g.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
 g.closePath();
}
function layerCanvas(){
 const c=document.createElement('canvas');c.width=SIZE[0];c.height=SIZE[1];
 c.getContext('2d').imageSmoothingEnabled=false;return c;
}
function extractRegions(source,targets,remove=true){
 for(let i=0;i<targets.length;i++){
  const g=targets[i].getContext('2d');g.clearRect(0,0,SIZE[0],SIZE[1]);g.globalCompositeOperation='source-over';
  g.drawImage(source,0,0);g.globalCompositeOperation='destination-in';traceRegion(g,FIN_REGIONS[i].points);g.fill();
  g.globalCompositeOperation='source-over';
 }
 if(remove){
  const g=source.getContext('2d');g.save();g.globalCompositeOperation='destination-out';g.globalAlpha=1;
  for(const region of FIN_REGIONS){traceRegion(g,region.points);g.fill()}
  g.restore();
 }
}
const finLightCanvas=FIN_REGIONS.map(layerCanvas);
function rebuildDirectionalLight(){
 if(!lights.naturalWidth)return;
 const direction=((lightDirection%8)+8)%8,first=Math.floor(direction),mix=direction-first,second=(first+1)%8;
 for(const part of ['upper','lower']){
  const g=lightCtx[part],row=part==='upper'?0:SIZE[1];
  g.clearRect(0,0,SIZE[0],SIZE[1]);g.globalAlpha=1-mix;
  g.drawImage(lights,first*SIZE[0],row,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
  if(mix>.001){g.globalAlpha=mix;g.drawImage(lights,second*SIZE[0],row,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1])}
  g.globalAlpha=1;
 }
 // Refresh the two articulated fin-light slices only when the eight-way light changes.
 extractRegions(lightCanvas.upper,finLightCanvas,true);
}
function toothRegion(g,part){
 g.beginPath();
 if(part==='upper'){
  g.moveTo(35,126);g.bezierCurveTo(55,106,82,105,108,105);
  g.bezierCurveTo(139,104,166,109,183,127);g.lineTo(188,198);g.lineTo(30,198);
 }else{
  g.moveTo(29,70);g.lineTo(190,70);g.lineTo(186,121);
  g.bezierCurveTo(168,150,143,176,108,182);
  g.bezierCurveTo(73,177,47,151,31,122);
 }
 g.closePath();g.fill();
}
const GLOW_PAD=64;
function cacheEmissiveGlow(source,glow){
 const layer=document.createElement('canvas'),g=layer.getContext('2d');
 layer.width=SIZE[0]+GLOW_PAD*2;layer.height=SIZE[1]+GLOW_PAD*2;g.imageSmoothingEnabled=false;
 g.globalCompositeOperation='lighter';g.shadowColor='#F9BD2B';
 g.globalAlpha=Math.min(1,.72+glow*.25);g.shadowBlur=18+glow*38;g.drawImage(source,GLOW_PAD,GLOW_PAD);
 g.globalAlpha=Math.min(.48,.22+glow*.18);g.shadowBlur=4+glow*7;g.drawImage(source,GLOW_PAD,GLOW_PAD);
 return layer;
}
function cacheEyeGlow(source,blur){
 const layer=document.createElement('canvas'),g=layer.getContext('2d');
 layer.width=SIZE[0];layer.height=SIZE[1];g.imageSmoothingEnabled=false;
 g.globalCompositeOperation='lighter';g.shadowColor='#FDE766';g.shadowBlur=blur;
 g.globalAlpha=.92;g.drawImage(source,0,0);return layer;
}
function cachePart(part){
 const base=document.createElement('canvas'),baseCtx=base.getContext('2d');
 const detail=document.createElement('canvas'),detailCtx=detail.getContext('2d');
 const teeth=document.createElement('canvas'),teethCtx=teeth.getContext('2d');
 const teethGlow=document.createElement('canvas'),teethGlowCtx=teethGlow.getContext('2d');
 const emissive=document.createElement('canvas'),emissiveCtx=emissive.getContext('2d');
 const eyes=document.createElement('canvas'),eyesCtx=eyes.getContext('2d');
 for(const layer of [base,detail,teeth,teethGlow,emissive,eyes]){layer.width=SIZE[0];layer.height=SIZE[1]}
 for(const g of [baseCtx,detailCtx,teethCtx,teethGlowCtx,emissiveCtx,eyesCtx])g.imageSmoothingEnabled=false;
 const [bx,by]=rect[part].body,[dx,dy]=rect[part].detail;
 baseCtx.drawImage(atlas,bx,by,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 detailCtx.drawImage(atlas,dx,dy,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 // Lift the original painted teeth out of the detail sheet; no replacement geometry.
 teethCtx.drawImage(detail,0,0);teethCtx.globalCompositeOperation='destination-in';
 teethCtx.fillStyle='#fff';toothRegion(teethCtx,part);teethCtx.globalCompositeOperation='source-over';
 teethGlowCtx.shadowColor='#F9BD2B';teethGlowCtx.shadowBlur=8;teethGlowCtx.drawImage(teeth,0,0);
 detailCtx.globalCompositeOperation='destination-out';detailCtx.drawImage(teeth,0,0);
 baseCtx.drawImage(detail,0,0);
 const finBase=part==='upper'?FIN_REGIONS.map(layerCanvas):null;
 if(finBase)extractRegions(base,finBase,true);
 const [ex,ey]=rect[part].emissive;
 emissiveCtx.drawImage(atlas,ex,ey,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 if(part==='upper'){
  // Move the original emissive eye pixels into their own layer so animated eyes do not ghost over static cores.
  for(const [x,y] of [[59,107],[158,105]])eyesCtx.drawImage(emissive,x-15,y-13,30,26,x-15,y-13,30,26);
  emissiveCtx.globalCompositeOperation='destination-out';emissiveCtx.drawImage(eyes,0,0);
  emissiveCtx.globalCompositeOperation='source-over';
 }
 let fins=null;
 if(finBase){
  const finEmissive=FIN_REGIONS.map(layerCanvas);extractRegions(emissive,finEmissive,true);
  fins=finBase.map((fin,i)=>({
   base:fin,emissive:finEmissive[i],
   glowLow:cacheEmissiveGlow(finEmissive[i],.35),
   glowHigh:cacheEmissiveGlow(finEmissive[i],1.2)
  }));
 }
 // Cache the stationary upper glow only after the moving fin emissive has been removed.
 const glowLow=cacheEmissiveGlow(emissive,.35);
 const glowMid=cacheEmissiveGlow(emissive,1);
 const glowHigh=cacheEmissiveGlow(emissive,1.35);
 const eyeGlowLow=part==='upper'?cacheEyeGlow(eyes,8):null;
 const eyeGlowMid=part==='upper'?cacheEyeGlow(eyes,19):null;
 const eyeGlowHigh=part==='upper'?cacheEyeGlow(eyes,27):null;
 return {base,teeth,teethGlow,emissive,eyes,glowLow,glowMid,glowHigh,eyeGlowLow,eyeGlowMid,eyeGlowHigh,fins};
}
function imageReady(image){
 if(image.complete)return image.naturalWidth?Promise.resolve():Promise.reject(new Error('image unavailable'));
 const eventReady=()=>new Promise((resolve,reject)=>{
  if(image.complete){image.naturalWidth?resolve():reject(new Error('image unavailable'));return}
  image.addEventListener('load',resolve,{once:true});
  image.addEventListener('error',()=>reject(new Error('image unavailable')),{once:true});
 });
 if(typeof image.decode!=='function')return eventReady();
 return image.decode().catch(eventReady);
}
const loaded=Promise.all([
 imageReady(atlas),imageReady(lights),imageReady(throatArt),
 imageReady(lanternSide),imageReady(lanternFront),imageReady(invertedBells)
]).then(()=>{
 partCache={upper:cachePart('upper'),lower:cachePart('lower')};
 cacheThroatGlow();rebuildDirectionalLight();
 return true;
}).catch(err=>{console.error('ABYSS play maw art unavailable:',err);return false});
let ready=false;loaded.then(ok=>{ready=ok});
let cw=0,ch=0,viewWidth=0,viewHeight=0,resizeDirty=true;
const markResize=()=>{resizeDirty=true};
addEventListener('resize',markResize,{passive:true});
if(window.visualViewport)visualViewport.addEventListener('resize',markResize,{passive:true});
let lightDirection=1;
function aimLight(event){
 const point=event.touches&&event.touches.length?event.touches[0]:event;
 if(!point||!Number.isFinite(point.clientX)||!Number.isFinite(point.clientY))return;
 const x=point.clientX-innerWidth*.5,y=point.clientY-innerHeight*.47;
 const next=((Math.atan2(y,x)+Math.PI*2)/(Math.PI*.25)+8)%8;
 if(Math.abs(next-lightDirection)>.025){lightDirection=next;rebuildDirectionalLight()}
}
addEventListener('pointerdown',aimLight,{passive:true});
addEventListener('pointermove',aimLight,{passive:true});
// Older mobile Safari: mirror the finger into directional light without stealing fish controls.
if(!('PointerEvent' in window)){
 addEventListener('touchstart',aimLight,{passive:true});
 addEventListener('touchmove',aimLight,{passive:true});
}
function resize(){
 if(!resizeDirty)return;
 resizeDirty=false;
 const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(devicePixelRatio||1,1.6);
 const factor=Math.min(1,1080/Math.max(w*dpr,h*dpr));
 const width=Math.max(1,Math.round(w*dpr*factor)),height=Math.max(1,Math.round(h*dpr*factor));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;ctx.imageSmoothingEnabled=false}
 cw=width;ch=height;viewWidth=w;viewHeight=h;
}
function clamp(x){return Math.max(0,Math.min(1,x))}
function smooth(t){const a=clamp(t);return a*a*(3-2*a)}
function springJaw(target,dt){
 const step=Math.min(.05,Math.max(0,dt));
 // The lower jaw follows the phase with mass instead of copying it frame-for-frame.
 // Closing is faster than opening, with a small overshoot that reads as bite recoil.
 const stiffness=target<jawOpen?150:92,damping=target<jawOpen?9.5:11.5;
 jawVelocity+=(target-jawOpen)*stiffness*step;
 jawVelocity*=Math.exp(-damping*step);
 jawOpen=Math.max(-.045,Math.min(1.075,jawOpen+jawVelocity*step));
 return jawOpen;
}
const FIRST=8.5, PERIOD=38.0;
let start=0,last=0,attackedCycle=-1,rendered=0;
let targetCycle=-2,targetHero=null,heroSample=null,nextHeroSample=0,aimX=0,aimY=0;
let worldWidth=1,worldHeight=1;
const gameCanvas=document.getElementById('gl');
let cameraKick=0,retreatKickX=0,retreatKickY=0;
let jawOpen=0,jawVelocity=0;
const state={ready:false,visible:false,attackCount:0,avoidedCount:0,lastHit:false,reaction:'none',targetOffset:[0,0],cameraKick:0};
function sampleHero(seconds,force){
 if(!force&&seconds<nextHeroSample)return heroSample;
 nextHeroSample=seconds+.08;
 try{
  const stats=typeof window.__abyssPlayHero==='function'?window.__abyssPlayHero():(typeof window.__abyssStats==='function'?window.__abyssStats():null);
  if(stats&&Array.isArray(stats.hero)){
   if(!heroSample)heroSample=[0,0];
   heroSample[0]=Number(stats.hero[0])||0;heroSample[1]=Number(stats.hero[1])||0;
   worldWidth=Math.max(1,Number(stats.W)||worldWidth);
   worldHeight=Math.max(1,Number(stats.H)||worldHeight);
  }
 }catch(e){}
 return heroSample;
}
Object.defineProperty(window,'__abyssPlayMaw',{value:state,configurable:false});
const frameQ={phase:'waiting',visible:0,scale:.68,open:0,light:0,impact:0,hit:false,cycle:-1};
function setFrameQ(phase,visible,scale,open,light,impact,hit,cycle){
 frameQ.phase=phase;frameQ.visible=visible;frameQ.scale=scale;frameQ.open=open;
 frameQ.light=light;frameQ.impact=impact;frameQ.hit=hit;frameQ.cycle=cycle;return frameQ;
}
function frameState(seconds){
 if(seconds<FIRST)return setFrameQ('waiting',0,.68,0,0,0,false,-1);
 const cycle=Math.floor((seconds-FIRST)/PERIOD),t=(seconds-FIRST)-cycle*PERIOD;
 // Depth now reads through darkness, glow and wake parallax; the owner silhouette no longer grows from a point.
 if(t<1.0){const a=smooth(t);return setFrameQ('warning',.08+.34*a,.68+.04*a,0,.14+.76*a,0,false,cycle)}
 if(t<1.95){const a=smooth((t-1)/.95);return setFrameQ('emerge',.08+.92*a,.72+.23*a,a*.9,.46+.54*a,0,false,cycle)}
 if(t<2.68){
  const raw=(t-1.95)/.73,a=smooth(raw);
  // Anticipate, hold the articulated jaws open long enough to read the throat, then snap shut and rebound.
  let open;
  if(raw<.30)open=.9+.1*smooth(raw/.30);
  else if(raw<.48)open=1;
  else if(raw<.82)open=1-.95*smooth((raw-.48)/.34);
  else open=.05+.13*smooth((raw-.82)/.18);
  const impact=Math.sin(Math.PI*clamp((raw-.48)/.52));
  return setFrameQ('bite',1,.95+.08*a-.018*impact,open,1+.35*impact,impact,raw>=.78,cycle);
 }
 if(t<3.63){const a=smooth((t-2.68)/.95);return setFrameQ('retreat',1-a,1.03-.31*a,.38*(1-a),1-a,0,false,cycle)}
 return setFrameQ('waiting',0,.68,0,0,0,false,cycle);
}
function drawPart(part,direction,glow){
 const cached=partCache[part],baseAlpha=ctx.globalAlpha;
 ctx.drawImage(cached.base,0,0);
 ctx.drawImage(lightCanvas[part],0,0);
 if(glow>0){
  ctx.save();ctx.globalCompositeOperation='lighter';
  let first=cached.glowLow,second=null,mix=0;
  if(glow<.35)ctx.globalAlpha=baseAlpha*glow/.35;
  else if(glow<=1){first=cached.glowLow;second=cached.glowMid;mix=(glow-.35)/.65;ctx.globalAlpha=baseAlpha*(1-mix)}
  else{first=cached.glowMid;second=cached.glowHigh;mix=clamp((glow-1)/.35);ctx.globalAlpha=baseAlpha*(1-mix)}
  if(ctx.globalAlpha>0)ctx.drawImage(first,-GLOW_PAD,-GLOW_PAD);
  if(second&&mix>0){ctx.globalAlpha=baseAlpha*mix;ctx.drawImage(second,-GLOW_PAD,-GLOW_PAD)}
  ctx.restore();
 }
}
function drawEmissive(part,time,glow,impact){
 const source=partCache[part].emissive,bands=5,bandH=Math.ceil(SIZE[1]/bands),baseAlpha=ctx.globalAlpha;
 const lag=part==='upper'?0:.62;
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let band=0;band<bands;band++){
  const sy=band*bandH,h=Math.min(bandH,SIZE[1]-sy);
  if(h<=0)continue;
  const wave=Math.sin(time*2.7-band*.72+lag);
  const follow=Math.sin(time*1.55-band*.41+lag)*.55;
  const dx=wave*.7,dy=follow*.65;
  const pulse=.72+.2*Math.sin(time*4.1-band*.63+lag)+impact*.22;
  ctx.globalAlpha=baseAlpha*clamp((.36+glow*.48)*pulse);
  ctx.drawImage(source,0,sy,SIZE[0],h,dx,sy+dy,SIZE[0],h);
 }
 // A crisp core follows the slower travelling wave, so the original pixel detail stays readable.
 ctx.globalAlpha=baseAlpha*clamp(.22+glow*.24+impact*.18);
 ctx.drawImage(source,Math.sin(time*2.1+lag)*.35,Math.cos(time*1.7+lag)*.3);
 ctx.restore();
}
const TOOTH_SEGMENTS=7,toothDx=new Int8Array(TOOTH_SEGMENTS),toothDy=new Int8Array(TOOTH_SEGMENTS);
function drawTeeth(part,time,open,glow,impact){
 const cached=partCache[part],side=part==='upper'?1:-1,baseAlpha=ctx.globalAlpha;
 const lag=part==='upper'?0:.7,segW=Math.ceil(SIZE[0]/TOOTH_SEGMENTS);
 const baseY=Math.round(side*Math.sin(time*8.1+lag)*open*.9);
 for(let i=0;i<TOOTH_SEGMENTS;i++){
  const centerDistance=Math.abs(i-(TOOTH_SEGMENTS-1)*.5)/((TOOTH_SEGMENTS-1)*.5);
  // The central teeth take the bite first; outer groups follow with a damped visible cascade.
  const localImpact=clamp(impact*1.18-centerDistance*.18);
  const idle=Math.sin(time*7.2+i*.83+lag)*open*(.28+centerDistance*.34);
  toothDx[i]=Math.round(idle+Math.sin(time*39+i*1.91+lag)*localImpact*(1.25+centerDistance*.75));
  toothDy[i]=baseY+Math.round(side*Math.sin(time*47+i*1.27+lag)*localImpact*(1.15+(i%3)*.55));
 }
 ctx.save();
 for(let i=0;i<TOOTH_SEGMENTS;i++){
  const sx=Math.max(0,i*segW-1),w=Math.min(SIZE[0]-sx,segW+2);
  if(w>0)ctx.drawImage(cached.teeth,sx,0,w,SIZE[1],sx+toothDx[i],toothDy[i],w,SIZE[1]);
 }
 if(glow>0){
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=baseAlpha*(.12+Math.min(.24,glow*.12));
  for(let i=0;i<TOOTH_SEGMENTS;i++){
   const sx=Math.max(0,i*segW-1),w=Math.min(SIZE[0]-sx,segW+2);
   if(w>0)ctx.drawImage(cached.teethGlow,sx,0,w,SIZE[1],sx+toothDx[i],toothDy[i],w,SIZE[1]);
  }
 }
 ctx.restore();
}
const eyeSockets=[[59,107],[158,105]];
function drawEyes(time,glow,impact,side=0){
 const cached=partCache.upper,source=cached.eyes,baseAlpha=ctx.globalAlpha;
 const gazeX=Math.max(-1,Math.min(1,aimX/Math.max(1,cw)))*5.5;
 const gazeY=Math.max(-1,Math.min(1,aimY/Math.max(1,ch)))*4;
 let glowA=cached.eyeGlowLow,glowB=null,mix=0;
 if(glow<.35)mix=glow/.35;
 else if(glow<=1){glowB=cached.eyeGlowMid;mix=(glow-.35)/.65}
 else{glowA=cached.eyeGlowMid;glowB=cached.eyeGlowHigh;mix=clamp((glow-1)/.35)}
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<eyeSockets.length;i++){
  if(side<0&&i>0||side>0&&i<1)continue;
  const [x,y]=eyeSockets[i];
  const pulse=.5+.5*Math.sin(time*(5.4+i*.45)+i*1.7);
  const driftX=Math.sin(time*1.9+i*2.3)*.45+gazeX;
  const driftY=Math.cos(time*1.35+i*1.2)*.28+gazeY;
  // Rare cropped blink and bite squint keep the real eye pixels rigid instead of stretching them.
  const blink=Math.pow(Math.max(0,Math.sin(time*.91+i*.035)),30);
  const lid=Math.min(11,Math.floor(blink*11+impact*2.5));
  const h=26-lid*2,alpha=baseAlpha*Math.min(1,.28+glow*.42+pulse*.26);
  if(h<=2)continue;
  const sx=x-32,sy=y-30+lid,sw=64,sh=60-lid*2;
  ctx.globalAlpha=alpha*(glowB?1-mix:mix);
  if(ctx.globalAlpha>0)ctx.drawImage(glowA,sx,sy,sw,sh,sx+driftX,sy+driftY,sw,sh);
  if(glowB&&mix>0){ctx.globalAlpha=alpha*mix;ctx.drawImage(glowB,sx,sy,sw,sh,sx+driftX,sy+driftY,sw,sh)}
  ctx.globalAlpha=alpha;ctx.drawImage(source,x-15,y-13+lid,30,h,x-15+driftX,y-13+lid+driftY,30,h);
 }
 ctx.restore();
}
const BUBBLE_N=15,bubbleBaseX=new Float32Array(BUBBLE_N),bubblePhase=new Float32Array(BUBBLE_N);
for(let i=0;i<BUBBLE_N;i++){bubbleBaseX[i]=Math.sin(i*7.13)*90;bubblePhase[i]=i/BUBBLE_N}
const bubbleAlpha=[.2,.32,.43];
const bubbleSprites=[0,1,2].map(layer=>{
 const size=20+layer*8,c=document.createElement('canvas'),g=c.getContext('2d');
 c.width=c.height=size;g.imageSmoothingEnabled=false;g.globalCompositeOperation='lighter';
 const center=size*.5,radius=5+layer*3,dot=1+layer;
 g.shadowColor=layer===2?'#F9BD2B':'#E57807';g.shadowBlur=2+layer*2;
 for(let step=0;step<24;step++){
  if((step+layer*3)%7===0||(step+layer)%11===0)continue;
  const angle=step/24*Math.PI*2,x=Math.round(center+Math.cos(angle)*radius),y=Math.round(center+Math.sin(angle)*radius);
  g.globalAlpha=.48+(step%4)*.12;g.fillStyle=step%5===0?'#FDE766':step%2?'#F9BD2B':'#AD4201';
  g.fillRect(x-dot*.5,y-dot*.5,dot,dot);
 }
 g.shadowBlur=0;g.globalAlpha=.95;g.fillStyle='#FDE766';
 g.fillRect(Math.round(center-radius*.62),Math.round(center-radius*.72),dot+1,dot);
 return c;
});
function bubbles(time,s,ox,oy){
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<BUBBLE_N;i++){
  const layer=i%3,p=(time*(.18+layer*.035)+bubblePhase[i])%1;
  const drift=Math.sin(time*(1.05+layer*.13)+i*2.4)*(6+layer*2.5);
  const x=ox+(bubbleBaseX[i]+drift)*s,y=oy+(118-p*210)*s;
  const pulse=.9+.1*Math.sin(time*2.2+i*.91),size=(9+layer*5)*s*pulse;
  ctx.globalAlpha=bubbleAlpha[layer]*smooth(Math.min(p/.12,(1-p)/.12));
  ctx.drawImage(bubbleSprites[layer],x-size*.5,y-size*.5,size,size);
 }
 ctx.restore();
}
const impactColors=['#FDE766','#F9BD2B','#E57807'];
const impactFrames=[.08,.25,.5,.75,1].map(fade=>{
 const c=document.createElement('canvas'),g=c.getContext('2d'),ox=96,oy=96,pixel=1;
 c.width=c.height=192;g.globalCompositeOperation='lighter';
 const flashW=24+fade*34,flashH=8+fade*11;
 g.globalAlpha=fade*.22;g.fillStyle=impactColors[1];
 g.beginPath();g.ellipse(ox,oy,flashW,flashH,-.08,0,Math.PI*2);g.fill();
 for(let i=0;i<28;i++){
  const side=i%2?1:-1,lane=(i*7)%13;
  const angle=side*(.12+.047*lane)+Math.sin(i*2.31)*.055;
  const radius=18+(i*19%47)+(1-fade)*32,lift=((i*11)%17-8)*.72;
  const x=ox+Math.cos(angle)*radius*side,y=oy+Math.sin(angle)*radius*.54+lift;
  const length=1+(i%4);
  g.globalAlpha=fade*(.34+.08*(i%5));g.fillStyle=impactColors[i%3];
  g.save();g.translate(Math.round(x),Math.round(y));g.rotate(side*(.08+.03*(i%5)));
  g.fillRect(-length*.5,-.5,length,1);g.restore();
 }
 for(let i=0;i<9;i++){
  const x=ox+((i*29)%71)-35,y=oy-(10+(i*17)%43),r=i%3===0?1.5:1;
  g.globalAlpha=fade*(.28+.06*(i%4));g.strokeStyle=i%2?impactColors[1]:impactColors[0];
  g.lineWidth=.65;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
 }
 return c;
});
function depthWake(time,q,s,ox,oy){
 let force=0;
 if(q.phase==='warning')force=.18+.25*q.light;
 else if(q.phase==='emerge')force=.35+.65*q.visible;
 else if(q.phase==='bite')force=1;
 else if(q.phase==='retreat')force=q.visible*.72;
 if(force<=.02)return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let layer=0;layer<3;layer++){
  const drift=(time*(.075+layer*.018)+layer*.31)%1;
  const radius=(92+layer*38)*s*(.68+drift*.42);
  const squash=1.12-layer*.1;
  ctx.save();ctx.translate(ox,oy);ctx.rotate(time*(layer%2?-.055:.04)+layer*.7);
  ctx.scale(squash,1/squash);
  ctx.globalAlpha=force*(.16+layer*.035)*(1-drift*.55);
  ctx.drawImage(wakeCanvas,-radius,-radius,radius*2,radius*2);ctx.restore();
 }
 ctx.restore();
}
function biteImpact(seconds,intensity,s,ox,oy){
 if(intensity<.68||s<=0)return;
 const fade=clamp((intensity-.68)/.32);
 const frame=impactFrames[Math.min(impactFrames.length-1,Math.floor(fade*impactFrames.length))];
 const size=frame.width*s;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.92+.08*fade;
 ctx.drawImage(frame,ox-size*.5,oy-size*.5,size,size);ctx.restore();
}
// The predator lives behind the hero's WebGL layer. Clear only the hero footprint from this
// transparent encounter canvas so the fish remains readable through jaws, glow and spray.
function preserveHeroForeground(){
 const radiusX=Math.max(24,Math.min(cw,ch)*.10),radiusY=Math.max(13,radiusX*.52);
 ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;
 ctx.beginPath();ctx.ellipse(cw*.5,ch*.5,radiusX,radiusY,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function throat(time,open,light,impact){
 const reveal=smooth((open-.08)/.92),baseAlpha=ctx.globalAlpha;
 if(reveal<=0)return;
 const tx=P[0],ty=P[1]+18;
 ctx.save();ctx.globalAlpha=baseAlpha*reveal;
 const pulse=.5+.5*Math.sin(time*5.2);
 // The cavity is cut directly from the owner's painting; nested tissue rings contract toward the dark core.
 traceThroat(ctx);ctx.clip();
 for(let ring=0;ring<throatLayers.length;ring++){
  const depth=ring/(throatLayers.length-1),phase=time*3.05-ring*.82;
  const swallow=Math.sin(phase)*(.018+depth*.012)*reveal;
  const recoil=impact*Math.sin(ring*1.8+1.1)*(.026+depth*.012);
  const scale=1+swallow+recoil;
  const dx=Math.sin(time*1.55-ring*.63)*(1.25-depth*.42)*reveal;
  const dy=Math.cos(time*1.32-ring*.47)*(.48+depth*.15)*reveal;
  ctx.save();ctx.translate(tx+dx,ty+dy);ctx.rotate(Math.sin(phase*.55)*(.005+depth*.004));
  ctx.scale(scale,scale);ctx.drawImage(throatLayers[ring],-48,-56);ctx.restore();
 }
 ctx.globalCompositeOperation='lighter';
 ctx.globalAlpha=baseAlpha*reveal*(.16+.13*pulse)*(.58+.42*light);
 ctx.drawImage(throatGlowCanvas,tx-48+Math.sin(time*1.7)*1.2,ty-56+Math.cos(time*1.3)*.8);
 ctx.restore();
}
function drawUpperFins(time,open,glow,impact,recoil){
 const cached=partCache.upper,baseAlpha=ctx.globalAlpha;
 for(let i=0;i<FIN_REGIONS.length;i++){
  const region=FIN_REGIONS[i],fin=cached.fins[i],side=i?1:-1;
  // The long fins lag the jaw and counter-sway with the water; only rigid rotation is used.
  const idle=Math.sin(time*1.42+region.phase)*.017+Math.sin(time*2.65+region.phase)*.005;
  const angle=idle*(.38+open*.62)+side*recoil*.34-side*impact*.008;
  ctx.save();ctx.translate(region.pivot[0],region.pivot[1]);ctx.rotate(angle);ctx.translate(-region.pivot[0],-region.pivot[1]);
  ctx.globalAlpha=baseAlpha;ctx.drawImage(fin.base,0,0);ctx.drawImage(finLightCanvas[i],0,0);
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=baseAlpha*clamp(.24+glow*.48+impact*.16);ctx.drawImage(fin.emissive,0,0);
  ctx.globalAlpha=baseAlpha*clamp(.12+glow*.22);
  ctx.drawImage(glow>1?fin.glowHigh:fin.glowLow,-GLOW_PAD,-GLOW_PAD);
  ctx.restore();
 }
}
function drawJawLayer(part,time,open,glow,impact,direction,recoil,showEyes){
 ctx.save();
 if(part==='upper'){
  // Close inward, then lift the complete upper source layer from the hinge. No jaw or tooth stretching.
  const lift=-5+12*open;
  const angle=-.012*(1-open)+.018*open+recoil*.45;
  ctx.translate(P[0],P[1]-lift);
  ctx.rotate(angle);
  ctx.translate(-P[0],-P[1]);
 }else{
  // The lower source layer interlocks on impact, then carries most of the opening around the same pivot.
  const drop=-30+54*open;
  const angle=.04*(1-open)-.068*open-recoil;
  ctx.translate(P[0],P[1]+drop);
  ctx.rotate(angle);
  ctx.translate(-P[0],-P[1]);
 }
 drawPart(part,direction,glow);
 drawEmissive(part,time,glow,impact);
 if(part==='upper')drawUpperFins(time,open,glow,impact,recoil);
 drawTeeth(part,time,open,glow,impact);
 if(part==='upper'&&showEyes)drawEyes(time,glow,impact);
 ctx.restore();
}
const lanternState={visible:false,front:false,side:true,guide:'finger-light',z:-24,biomePlanes:3,position:[0,0]};
window.__abyssLanternRay=()=>lanternState;
let lanternX=0,lanternY=0,lanternStarted=false;
let lanternGpu=null;
function createLanternGpu(){
 const gl=gameCanvas&&(gameCanvas.getContext('webgl2')||gameCanvas.getContext('webgl'));
 if(!gl)return null;
 const webgl2=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
 const vertexBody=`precision highp float;
attribute vec2 aPos; attribute vec2 aUv;
uniform vec2 uViewport,uCenter,uSize; uniform float uTime,uMode;
varying vec2 vUv;
void main(){
 vec2 p=aPos;
 if(uMode<0.5){
  float tail=(1.0-p.x)*0.5;
  p.y+=sin(uTime*2.25-p.x*2.8)*0.035*tail;
  p.x+=sin(uTime*1.35+p.y*2.1)*0.012;
 }
 vec2 px=uCenter+p*uSize*0.5;
 gl_Position=vec4(px.x/uViewport.x*2.0-1.0,1.0-px.y/uViewport.y*2.0,0.0,1.0);
 vUv=aUv;
}`;
 const fragmentBody=`precision highp float;
uniform sampler2D tSide,tFront,tBiome;
uniform vec2 uViewport,uLightDir,uHeroCenter,uHeroRadius;
uniform float uTime,uMode,uLayer,uAlpha,uFlip;
varying vec2 vUv;
vec3 pal(float i){
 if(i<0.5)return vec3(0.0);
 if(i<1.5)return vec3(62.0,21.0,0.0)/255.0;
 if(i<2.5)return vec3(112.0,39.0,0.0)/255.0;
 if(i<3.5)return vec3(173.0,66.0,1.0)/255.0;
 if(i<4.5)return vec3(229.0,120.0,7.0)/255.0;
 if(i<5.5)return vec3(249.0,189.0,43.0)/255.0;
 return vec3(253.0,231.0,102.0)/255.0;
}
float nearestTone(vec3 c){
 float best=0.0,dist=dot(c,c);
 for(int i=1;i<7;i++){
  vec3 d=c-pal(float(i));float q=dot(d,d);
  if(q<dist){dist=q;best=float(i);}
 }
 return best;
}
vec2 mirrorUv(vec2 p){
 vec2 cell=floor(p),f=fract(p);
 if(mod(cell.x,2.0)>0.5)f.x=1.0-f.x;
 if(mod(cell.y,2.0)>0.5)f.y=1.0-f.y;
 return f;
}
void main(){
 vec2 frag=gl_FragCoord.xy;
 vec2 hero=(frag-uHeroCenter)/max(uHeroRadius,vec2(1.0));
 if(dot(hero,hero)<1.0)discard;
 if(uMode>0.5){
  float tiles=1.15+uLayer*0.38;
  vec2 drift=vec2(uTime*(0.008+uLayer*0.004),sin(uTime*(0.055+uLayer*0.018))*0.055);
  vec4 c=texture2D(tBiome,mirrorUv(vUv*vec2(tiles,tiles*1.8)+drift+uLayer*0.31));
  if(c.a<0.03)discard;
  float tone=nearestTone(c.rgb);
  gl_FragColor=vec4(pal(tone),c.a*uAlpha);
  return;
 }
 vec2 uv=vUv; if(uFlip>0.5)uv.x=1.0-uv.x;
 float phase=mod(uTime*2.2,4.0),frame=floor(phase),next=mod(frame+1.0,4.0);
 vec4 sideA=texture2D(tSide,vec2((uv.x+frame)*0.25,uv.y));
 vec4 sideB=texture2D(tSide,vec2((uv.x+next)*0.25,uv.y));
 float mixK=smoothstep(0.0,1.0,fract(phase));
 vec4 side=mix(sideA,sideB,mixK);
 vec4 front=texture2D(tFront,uv);
 float frontK=smoothstep(0.72,0.9,abs(uLightDir.y));
 vec4 c=mix(side,front,frontK);
 float halo=exp(-dot(vUv-0.5,vUv-0.5)*13.0)*0.10*uAlpha;
 if(c.a<0.03){if(halo<0.008)discard;gl_FragColor=vec4(pal(5.0),halo);return;}
 float tone=nearestTone(c.rgb);
 float directional=clamp(0.42+0.58*dot(normalize(vUv-0.5+vec2(0.001)),uLightDir),0.18,1.0);
 tone=floor(tone*(0.58+0.42*directional)+0.5);
 gl_FragColor=vec4(pal(tone),c.a*uAlpha);
}`;
 const vertex=webgl2?'#version 300 es\n'+vertexBody.replace(/attribute/g,'in').replace(/varying/g,'out'):vertexBody;
 const fragment=webgl2?'#version 300 es\n'+fragmentBody.replace(/varying/g,'in').replace(/texture2D/g,'texture').replace(/gl_FragColor/g,'outColor').replace('precision highp float;','precision highp float; out vec4 outColor;'):fragmentBody;
 const shader=(type,source)=>{
  const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);
  if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(item)||'lantern shader compile failed');
  return item;
 };
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'lantern shader link failed');
 gl.deleteShader(vs);gl.deleteShader(fs);
 const state={
  program:gl.getParameter(gl.CURRENT_PROGRAM),array:gl.getParameter(gl.ARRAY_BUFFER_BINDING),
  element:gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING),framebuffer:gl.getParameter(gl.FRAMEBUFFER_BINDING),
  active:gl.getParameter(gl.ACTIVE_TEXTURE),viewport:gl.getParameter(gl.VIEWPORT),
  blend:gl.isEnabled(gl.BLEND),depth:gl.isEnabled(gl.DEPTH_TEST),cull:gl.isEnabled(gl.CULL_FACE),scissor:gl.isEnabled(gl.SCISSOR_TEST),
  srcRGB:gl.getParameter(gl.BLEND_SRC_RGB),dstRGB:gl.getParameter(gl.BLEND_DST_RGB),
  srcA:gl.getParameter(gl.BLEND_SRC_ALPHA),dstA:gl.getParameter(gl.BLEND_DST_ALPHA),
  eqRGB:gl.getParameter(gl.BLEND_EQUATION_RGB),eqA:gl.getParameter(gl.BLEND_EQUATION_ALPHA),
  depthMask:gl.getParameter(gl.DEPTH_WRITEMASK),colorMask:gl.getParameter(gl.COLOR_WRITEMASK),textures:[]
 };
 const vaoExt=!webgl2&&gl.getExtension('OES_vertex_array_object');
 state.vao=webgl2?gl.getParameter(gl.VERTEX_ARRAY_BINDING):vaoExt?gl.getParameter(vaoExt.VERTEX_ARRAY_BINDING_OES):null;
 for(let unit=0;unit<3;unit++){gl.activeTexture(gl.TEXTURE0+unit);state.textures[unit]=gl.getParameter(gl.TEXTURE_BINDING_2D)}
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,1,1,-1,1,1,-1,1,0,0,1,1,1,0]),gl.STATIC_DRAW);
 const vao=webgl2?gl.createVertexArray():vaoExt?vaoExt.createVertexArrayOES():null;
 if(webgl2)gl.bindVertexArray(vao);else if(vaoExt)vaoExt.bindVertexArrayOES(vao);
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 const aPos=gl.getAttribLocation(program,'aPos'),aUv=gl.getAttribLocation(program,'aUv');
 gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,16,0);
 gl.enableVertexAttribArray(aUv);gl.vertexAttribPointer(aUv,2,gl.FLOAT,false,16,8);
 const makeTexture=image=>{
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);return texture;
 };
 const textures=[makeTexture(lanternSide),makeTexture(lanternFront),makeTexture(invertedBells)];
 const uniforms={};
 for(const name of ['uViewport','uCenter','uSize','uTime','uMode','uLayer','uAlpha','uFlip','uLightDir','uHeroCenter','uHeroRadius','tSide','tFront','tBiome'])uniforms[name]=gl.getUniformLocation(program,name);
 const restore=()=>{
  for(let unit=0;unit<3;unit++){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,state.textures[unit])}
  gl.activeTexture(state.active);gl.useProgram(state.program);gl.bindBuffer(gl.ARRAY_BUFFER,state.array);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,state.element);
  gl.bindFramebuffer(gl.FRAMEBUFFER,state.framebuffer);gl.viewport(state.viewport[0],state.viewport[1],state.viewport[2],state.viewport[3]);
  state.blend?gl.enable(gl.BLEND):gl.disable(gl.BLEND);state.depth?gl.enable(gl.DEPTH_TEST):gl.disable(gl.DEPTH_TEST);
  state.cull?gl.enable(gl.CULL_FACE):gl.disable(gl.CULL_FACE);state.scissor?gl.enable(gl.SCISSOR_TEST):gl.disable(gl.SCISSOR_TEST);
  gl.blendFuncSeparate(state.srcRGB,state.dstRGB,state.srcA,state.dstA);gl.blendEquationSeparate(state.eqRGB,state.eqA);
  gl.depthMask(state.depthMask);gl.colorMask(state.colorMask[0],state.colorMask[1],state.colorMask[2],state.colorMask[3]);
  if(webgl2)gl.bindVertexArray(state.vao);else if(vaoExt)vaoExt.bindVertexArrayOES(state.vao);
 };
 restore();
 return {gl,program,vao,vaoExt,webgl2,textures,uniforms,restore};
}
function renderLanternGpu(time,dt){
 if(!lanternGpu){try{lanternGpu=createLanternGpu()}catch(error){console.error('ABYSS lantern GPU:',error);lanternGpu=false}if(!lanternGpu)return}
 if(lanternGpu===false)return;
 const {gl,program,vao,vaoExt,webgl2,textures,uniforms,restore}=lanternGpu,w=gameCanvas.width,h=gameCanvas.height;
 if(!w||!h)return;
 const angle=lightDirection*Math.PI*.25,reach=Math.min(w,h)*.235;
 const targetX=w*.5+Math.cos(angle)*reach,targetY=h*.5+Math.sin(angle)*reach*.78;
 if(!lanternStarted){lanternX=w*.5-reach;lanternY=h*.57;lanternStarted=true}
 const follow=1-Math.exp(-Math.max(0,dt)*2.15);
 lanternX+=(targetX-lanternX)*follow;lanternY+=(targetY-lanternY)*follow;
 const alpha=clamp((time-2.5)/2.4),bob=Math.sin(time*1.35)*Math.max(2,h*.006);
 const dx=targetX-lanternX,dy=targetY-lanternY,front=Math.abs(dy)>Math.abs(dx)*1.08;
 lanternState.visible=alpha>.02;lanternState.front=front;lanternState.side=!front;
 lanternState.position[0]=Math.round(lanternX);lanternState.position[1]=Math.round(lanternY+bob);
 gl.useProgram(program);if(webgl2)gl.bindVertexArray(vao);else if(vaoExt)vaoExt.bindVertexArrayOES(vao);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.disable(gl.SCISSOR_TEST);
 gl.enable(gl.BLEND);gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.colorMask(true,true,true,true);
 for(let unit=0;unit<3;unit++){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,textures[unit])}
 gl.uniform1i(uniforms.tSide,0);gl.uniform1i(uniforms.tFront,1);gl.uniform1i(uniforms.tBiome,2);
 gl.uniform2f(uniforms.uViewport,w,h);gl.uniform1f(uniforms.uTime,time);
 gl.uniform2f(uniforms.uLightDir,Math.cos(angle),Math.sin(angle));
 gl.uniform2f(uniforms.uHeroCenter,w*.5,h*.5);gl.uniform2f(uniforms.uHeroRadius,Math.max(24,Math.min(w,h)*.10),Math.max(13,Math.min(w,h)*.052));
 gl.uniform1f(uniforms.uMode,1);gl.uniform2f(uniforms.uCenter,w*.5,h*.5);gl.uniform2f(uniforms.uSize,w,h);gl.uniform1f(uniforms.uFlip,0);
 for(let layer=0;layer<3;layer++){
  gl.uniform1f(uniforms.uLayer,layer);gl.uniform1f(uniforms.uAlpha,[.10,.16,.22][layer]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 if(alpha>.001){
  const width=Math.min(w*.52,220),height=width*160/256;
  gl.uniform1f(uniforms.uMode,0);gl.uniform1f(uniforms.uLayer,0);gl.uniform1f(uniforms.uAlpha,alpha);gl.uniform1f(uniforms.uFlip,dx<0?1:0);
  gl.uniform2f(uniforms.uCenter,lanternX,lanternY+bob);gl.uniform2f(uniforms.uSize,width,height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 // Restore the stable end-of-frame state that Three.js left before this pass.
 restore();
}
function frame(now,dt){
 resize();
 const seconds=(now-start)/1000;const q=frameState(seconds);
 // Successful bites kick the actual playfield, while the HUD and touch layer remain stable.
 if(gameCanvas){
  if(cameraKick>0){
   cameraKick=Math.max(0,cameraKick-Math.max(0,dt)*3.8);
   const amp=cameraKick*7.5;
   gameCanvas.style.transform=`translate3d(${Math.sin(seconds*71)*amp}px,${Math.cos(seconds*59)*amp*.55}px,0) scale(1.018)`;
  }else if(gameCanvas.style.transform)gameCanvas.style.transform='';
 }
 state.cameraKick=cameraKick;
 if(q.cycle>=0&&q.cycle!==targetCycle){
  targetCycle=q.cycle;
  const hero=sampleHero(seconds,true);
  targetHero=hero&&hero.slice();
  aimX=0;aimY=0;retreatKickX=0;retreatKickY=0;state.reaction='warning';
  // The fish notices the eye-and-bubble warning before the jaws lunge; one hook call per encounter.
  try{if(typeof window.__abyssPlayMawWarn==='function')window.__abyssPlayMawWarn(q.cycle%2?1:-1)}catch(e){console.error('ABYSS maw warning:',e)}
 }
 const hero=q.cycle>=0?sampleHero(seconds,false):heroSample;
 if(targetHero&&hero){
  const desiredX=clamp((targetHero[0]-hero[0])/worldWidth+.5)-.5;
  const desiredY=clamp((hero[1]-targetHero[1])/worldHeight+.5)-.5;
  const follow=1-Math.exp(-Math.max(0,dt)*12);
  aimX+=(desiredX*cw-aimX)*follow;
  aimY+=(desiredY*ch-aimY)*follow;
 }else{aimX*=.85;aimY*=.85}
 state.targetOffset[0]=aimX;state.targetOffset[1]=aimY;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);
 state.ready=ready;state.visible=ready&&q.visible>.02;state.phase=q.phase;state.elapsed=seconds;state.dt=dt;
 const articulatedOpen=Math.max(0,springJaw(q.open,dt));
 if(!ready)return;
 if(q.visible<=.02){preserveHeroForeground();state.rendered=++rendered;return}
 // Rendered into the actual game and anchored at the camera's center/player region.
 const direction=lightDirection;
 // Keep the whole owner silhouette, fins and teeth inside both portrait and landscape playfields.
 const base=Math.min(cw/SIZE[0],ch/SIZE[1])*.86;
 const s=base*q.scale;
 const retreatProgress=q.phase==='retreat'?smooth(1-q.visible):0;
 let approachX=0,approachY=0,approachRoll=0;
 const approachSide=q.cycle%2?1:-1;
 if(q.phase==='warning'){
  // The eye warning drifts out of black water instead of appearing as a centered overlay.
  const settle=smooth((q.light-.14)/.76);
  approachX=approachSide*cw*(.085-.035*settle);
  approachY=ch*(.055-.018*settle);
  approachRoll=approachSide*(.045-.015*settle);
 }else if(q.phase==='emerge'){
  // Perspective travel resolves to the fish before the bite so the hit area stays honest.
  const settle=smooth((q.visible-.42)/.58),remaining=1-settle;
  approachX=approachSide*cw*.05*remaining;
  approachY=ch*.037*remaining;
  approachRoll=approachSide*.03*remaining;
 }
 // A missed strike carries past the fish and rolls away; a hit recoils mostly into depth.
 const cx=cw*.5+aimX+approachX+retreatKickX*retreatProgress;
 const cy=ch*.47+aimY+approachY+retreatKickY*retreatProgress;
 const retreatRoll=(retreatKickX/Math.max(1,cw))*retreatProgress*.72;
 // Staggered parallax wake makes the approach read as travel through black water, not a flat sprite zoom.
 depthWake(seconds,q,s,cx,cy);
 // Composite the broad water glow behind the silhouette so it cannot wash out teeth and pixel detail.
 if(q.light>.02){
  ctx.save();ctx.globalAlpha=clamp(q.visible)*q.light;
  const haloRadius=Math.max(35,140*s);
  ctx.globalCompositeOperation='lighter';
  ctx.drawImage(haloCanvas,cx-haloRadius,cy-haloRadius,haloRadius*2,haloRadius*2);ctx.restore();
 }
 ctx.save();ctx.translate(cx,cy);ctx.rotate(approachRoll+retreatRoll);ctx.scale(s,s);ctx.translate(-P[0],-P[1]);
 const warning=q.phase==='warning';
 // During warning the real emissive eyes appear first; the full silhouette stays inside black water until the lunge.
 const bodyReveal=warning?smooth((q.light-.45)/.45):1;
 ctx.globalAlpha=warning?clamp(q.visible*(.08+.12*bodyReveal)):clamp(q.visible);
 // The independently pulsing throat sits behind both rigid articulated layers.
 throat(seconds,clamp(articulatedOpen),q.light,q.impact);
 // Both owner-painted halves now separate around their shared pivot; neither source layer is scaled.
 const upperOpen=smooth(clamp(articulatedOpen*.82));
 const lowerOpen=smooth(clamp((articulatedOpen-.035)/.965));
 let recoil=0;
 if(q.phase==='bite')recoil=Math.sin((seconds-FIRST)*38)*q.impact*.012;
 else if(q.phase==='retreat')recoil=Math.sin(retreatProgress*Math.PI*4)*q.visible*.008;
  // Opposed recoil keeps both original jaw halves alive through impact and the first retreat beats.
  drawJawLayer('upper',seconds,upperOpen,q.light,q.impact,direction,recoil,!warning);
  drawJawLayer('lower',seconds,lowerOpen,q.light,q.impact,direction,recoil,false);
 if(warning||q.phase==='emerge'){
  // Hold the warning eyes in the darkness while the jaw-bound eyes cross-fade into the lunging body.
  const carry=warning?1:1-smooth((q.visible-.08)/.92);
  ctx.globalAlpha=clamp((.22+q.light*.72)*carry);drawEyes(seconds,q.light,0);
 }
 ctx.restore();
 if(q.light>.02){
  // Bubbles and bite spray remain foreground reactions.
  bubbles(seconds,s,cx,cy);biteImpact(seconds,q.impact,s,cx,cy+20*s);
 }
 // Restore front-to-back composition after every maw pass; this never touches gameplay input or hit logic.
 preserveHeroForeground();
 // Real gameplay damage, once per encounter, through the existing fish hit path.
 if(q.hit&&q.cycle!==attackedCycle){
  attackedCycle=q.cycle;
  const hero=sampleHero(seconds,true);
  // Resolve the bite against the visible mouth in screen space, so portrait touch and desktop share one honest hit area.
  const mouthDistance=Math.hypot(aimX,aimY);
  const mouthRadius=Math.max(22*s,Math.min(cw,ch)*.055);
  const inMouth=!targetHero||!hero||mouthDistance<mouthRadius;
  let hit=false;
  if(inMouth){
   try{if(typeof window.__abyssPlayMawHit==='function')hit=!!window.__abyssPlayMawHit()}catch(e){console.error('ABYSS maw hit:',e)}
  }else{
   state.avoidedCount++;
   const sweep=q.cycle%2?1:-1;
   retreatKickX=sweep*cw*.12;retreatKickY=-ch*.045;
   try{if(typeof window.__abyssPlayMawDodge==='function')window.__abyssPlayMawDodge(sweep)}catch(e){console.error('ABYSS maw dodge:',e)}
   state.reaction='dodged';
  }
  if(hit){cameraKick=1;retreatKickY=-ch*.025;state.reaction='hit'}
  state.lastHit=hit;state.attackCount++;
 }
 state.rendered=++rendered;
}
// Join the game's existing RAF scheduler instead of creating a parallel loop.
// Both the WebGL update and this layered entity now advance from the same frame clock.
const gameRAF=window.requestAnimationFrame.bind(window);
let gameFrame=-1,hiddenAt=0;
// Mobile app switching must pause the encounter clock, otherwise the bite can land immediately on resume.
document.addEventListener('visibilitychange',()=>{
 const now=performance.now();
 if(document.hidden){hiddenAt=now;return}
 if(hiddenAt){if(start)start+=now-hiddenAt;hiddenAt=0;gameFrame=now}
},{passive:true});
window.requestAnimationFrame=callback=>gameRAF(now=>{
 if(ready&&typeof window.__abyssPlayMawHit==='function'&&now!==gameFrame){
  if(!start)start=now;
  const dt=gameFrame<0?0:Math.min(.05,(now-gameFrame)/1000);gameFrame=now;frame(now,dt);
 }
 callback(now);
 if(ready&&start)renderLanternGpu((now-start)/1000,state.dt||0);
});
})();
