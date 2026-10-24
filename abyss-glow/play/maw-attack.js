(()=>{'use strict';
// ABYSS GLOW play: owner-derived layered maw encounter in actual game.
// No changes to the accepted stand. Transparent overlay does not intercept touch.
const SIZE=[217,289], P=[108,168], atlas=new Image(),lights=new Image();
atlas.src='../assets/maw_front_v1/maw_front_atlas.png';
lights.src='../assets/maw_front_v1/maw_front_light8.png';
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
haloGradient.addColorStop(0,'rgba(255,231,102,.18)');
haloGradient.addColorStop(.36,'rgba(255,143,8,.12)');
haloGradient.addColorStop(.7,'rgba(207,55,0,.045)');
haloGradient.addColorStop(1,'rgba(0,0,0,0)');
haloCtx.fillStyle=haloGradient;haloCtx.fillRect(0,0,256,256);
const throatShape=new Path2D();
throatShape.moveTo(P[0]-3,P[1]-27);
throatShape.bezierCurveTo(P[0]+28,P[1]-22,P[0]+36,P[1]+6,P[0]+30,P[1]+32);
throatShape.bezierCurveTo(P[0]+25,P[1]+53,P[0]+12,P[1]+64,P[0]+2,P[1]+67);
throatShape.bezierCurveTo(P[0]-14,P[1]+61,P[0]-28,P[1]+49,P[0]-33,P[1]+26);
throatShape.bezierCurveTo(P[0]-38,P[1]+1,P[0]-25,P[1]-21,P[0]-3,P[1]-27);throatShape.closePath();
const throatCanvas=document.createElement('canvas'),throatCtx=throatCanvas.getContext('2d');
throatCanvas.width=96;throatCanvas.height=112;
const throatGradient=throatCtx.createRadialGradient(44,60,3,47,58,47);
throatGradient.addColorStop(0,'#010000');throatGradient.addColorStop(.5,'#050000');
throatGradient.addColorStop(.78,'#170200');throatGradient.addColorStop(1,'#020000');
throatCtx.fillStyle=throatGradient;throatCtx.fillRect(0,0,96,112);
const rect={upper:{body:[2,2],detail:[223,2],emissive:[665,2]},lower:{body:[2,295],detail:[223,295],emissive:[665,295]}};
let partCache=null;
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
function cachePart(part){
 const base=document.createElement('canvas'),baseCtx=base.getContext('2d');
 const detail=document.createElement('canvas'),detailCtx=detail.getContext('2d');
 const teeth=document.createElement('canvas'),teethCtx=teeth.getContext('2d');
 const teethGlow=document.createElement('canvas'),teethGlowCtx=teethGlow.getContext('2d');
 const emissive=document.createElement('canvas'),emissiveCtx=emissive.getContext('2d');
 for(const layer of [base,detail,teeth,teethGlow,emissive]){layer.width=SIZE[0];layer.height=SIZE[1]}
 for(const g of [baseCtx,detailCtx,teethCtx,teethGlowCtx,emissiveCtx])g.imageSmoothingEnabled=false;
 const [bx,by]=rect[part].body,[dx,dy]=rect[part].detail;
 baseCtx.drawImage(atlas,bx,by,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 detailCtx.drawImage(atlas,dx,dy,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 // Lift the original painted teeth out of the detail sheet; no replacement geometry.
 teethCtx.drawImage(detail,0,0);teethCtx.globalCompositeOperation='destination-in';
 teethCtx.fillStyle='#fff';toothRegion(teethCtx,part);teethCtx.globalCompositeOperation='source-over';
 teethGlowCtx.shadowColor='#ffb21a';teethGlowCtx.shadowBlur=8;teethGlowCtx.drawImage(teeth,0,0);
 detailCtx.globalCompositeOperation='destination-out';detailCtx.drawImage(teeth,0,0);
 baseCtx.drawImage(detail,0,0);
 const [ex,ey]=rect[part].emissive;
 emissiveCtx.drawImage(atlas,ex,ey,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 return {base,teeth,teethGlow,emissive};
}
const loaded=Promise.all([atlas.decode(),lights.decode()]).then(()=>{
 partCache={upper:cachePart('upper'),lower:cachePart('lower')};
 return true;
}).catch(err=>{console.error('ABYSS play maw art unavailable:',err);return false});
let ready=false;loaded.then(ok=>{ready=ok});
let cw=0,ch=0,viewWidth=0,viewHeight=0;
let lightDirection=1;
function aimLight(event){
 const x=event.clientX-innerWidth*.5,y=event.clientY-innerHeight*.47;
 lightDirection=(Math.round((Math.atan2(y,x)+Math.PI*2)/(Math.PI*.25))+8)%8;
}
addEventListener('pointerdown',aimLight,{passive:true});
addEventListener('pointermove',aimLight,{passive:true});
function resize(){
 const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(devicePixelRatio||1,1.6);
 const factor=Math.min(1,1080/Math.max(w*dpr,h*dpr));
 const width=Math.max(1,Math.round(w*dpr*factor)),height=Math.max(1,Math.round(h*dpr*factor));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;ctx.imageSmoothingEnabled=false}
 cw=width;ch=height;viewWidth=w;viewHeight=h;
}
function clamp(x){return Math.max(0,Math.min(1,x))}
function smooth(t){const a=clamp(t);return a*a*(3-2*a)}
const FIRST=8.5, PERIOD=38.0;
let start=0,last=0,attackedCycle=-1,rendered=0;
let targetCycle=-2,targetHero=null,heroSample=null,nextHeroSample=0,aimX=0,aimY=0;
let worldWidth=1,worldHeight=1;
const gameCanvas=document.getElementById('gl');
let cameraKick=0;
const state={ready:false,visible:false,attackCount:0,avoidedCount:0,lastHit:false,targetOffset:[0,0],cameraKick:0};
function sampleHero(seconds,force){
 if(!force&&seconds<nextHeroSample)return heroSample;
 nextHeroSample=seconds+.08;
 try{
  const stats=typeof window.__abyssStats==='function'?window.__abyssStats():null;
  if(stats&&Array.isArray(stats.hero)){
   heroSample=[Number(stats.hero[0])||0,Number(stats.hero[1])||0];
   worldWidth=Math.max(1,Number(stats.W)||worldWidth);
   worldHeight=Math.max(1,Number(stats.H)||worldHeight);
  }
 }catch(e){}
 return heroSample;
}
Object.defineProperty(window,'__abyssPlayMaw',{value:state,configurable:false});
function frameState(seconds){
 if(seconds<FIRST)return {phase:'waiting',visible:0,scale:.26,open:0,light:0,impact:0,hit:false,cycle:-1};
 const cycle=Math.floor((seconds-FIRST)/PERIOD),t=(seconds-FIRST)-cycle*PERIOD;
 if(t<1.0){const a=smooth(t);return {phase:'warning',visible:.1+.3*a,scale:.26+.06*a,open:0,light:a,impact:0,hit:false,cycle}}
 if(t<1.85){const a=smooth((t-1)/.85);return {phase:'emerge',visible:.4+.6*a,scale:.32+.63*a,open:a*.9,light:.5+.5*a,impact:0,hit:false,cycle}}
 if(t<2.30){
  const raw=(t-1.85)/.45,a=smooth(raw);
  // Anticipation opens wider, then both rigid jaw layers snap shut and rebound.
  let open;
  if(raw<.34)open=.9+.1*smooth(raw/.34);
  else if(raw<.72)open=1-.78*smooth((raw-.34)/.38);
  else open=.22+.16*smooth((raw-.72)/.28);
  const impact=Math.sin(Math.PI*clamp((raw-.48)/.52));
  return {phase:'bite',visible:1,scale:.95+.08*a-.018*impact,open,light:1+.35*impact,impact,hit:raw>=.74,cycle};
 }
 if(t<3.25){const a=smooth((t-2.30)/.95);return {phase:'retreat',visible:1-a,scale:1.03-.77*a,open:.38*(1-a),light:1-a,impact:0,hit:false,cycle}}
 return {phase:'waiting',visible:0,scale:.26,open:0,light:0,impact:0,hit:false,cycle};
}
function drawPart(part,direction,glow){
 const cached=partCache[part];
 ctx.drawImage(cached.base,0,0);
 const row=part==='upper'?0:SIZE[1];
 ctx.drawImage(lights,direction*SIZE[0],row,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 if(glow>0){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,.72+glow*.25);
  ctx.shadowColor='#ff9f0a';ctx.shadowBlur=18+glow*38;
  ctx.drawImage(cached.emissive,0,0);
  ctx.globalAlpha=Math.min(.48,.22+glow*.18);ctx.shadowBlur=4+glow*7;
  ctx.drawImage(cached.emissive,0,0);
  ctx.restore();
 }
 ctx.drawImage(cached.emissive,0,0);
}
function drawTeeth(part,time,open,glow,impact){
 const cached=partCache[part],side=part==='upper'?1:-1;
 const inertia=side*Math.sin(time*8.1+(part==='upper'?0:.7))*open*.65;
 const chatter=side*Math.sin(time*54)*impact*1.8;
 ctx.save();ctx.translate(0,inertia+chatter);ctx.drawImage(cached.teeth,0,0);
 if(glow>0){
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+Math.min(.24,glow*.12);
  ctx.drawImage(cached.teethGlow,0,0);
 }
 ctx.restore();
}
function drawEyes(time,glow){
 const source=partCache.upper.emissive;
 const sockets=[[59,107],[158,105]];
 ctx.save();ctx.globalCompositeOperation='lighter';
 ctx.shadowColor='#ffd95a';ctx.shadowBlur=8+glow*19;
 for(let i=0;i<sockets.length;i++){
  const [x,y]=sockets[i];
  const pulse=.5+.5*Math.sin(time*(5.4+i*.45)+i*1.7);
  const driftX=Math.sin(time*1.9+i*2.3)*.8;
  const driftY=Math.cos(time*1.35+i*1.2)*.45;
  ctx.globalAlpha=Math.min(1,.28+glow*.42+pulse*.26);
  // Reuse each eye's real emissive pixels as a separate animated layer.
  ctx.drawImage(source,x-15,y-13,30,26,x-15+driftX,y-13+driftY,30,26);
 }
 ctx.restore();
}
function bubbles(time,s,ox,oy){
 const n=15;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#faa22b';
 for(let i=0;i<n;i++){
  const p=((time*.28+i/n)%1),drift=Math.sin(time*1.2+i*2.4)*9;
  const x=ox+(Math.sin(i*7.13)*90+drift)*s;
  const y=oy+(115-p*200)*s;
  const r=Math.max(.9,(1.3+i%3)*s*.8);
  ctx.globalAlpha=Math.max(0,.45-p*.3);
  ctx.lineWidth=Math.max(.7,s*.65);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}
const impactColors=['#FFF19A','#F9BD2B','#E57807'];
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
function biteImpact(seconds,intensity,s,ox,oy){
 if(intensity<.68||s<=0)return;
 const fade=clamp((intensity-.68)/.32);
 const frame=impactFrames[Math.min(impactFrames.length-1,Math.floor(fade*impactFrames.length))];
 const size=frame.width*s;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.92+.08*fade;
 ctx.drawImage(frame,ox-size*.5,oy-size*.5,size,size);ctx.restore();
}
function throat(time,open,light){
 const reveal=smooth((open-.08)/.92);
 if(reveal<=0)return;
 const tx=P[0],ty=P[1]+18;
 ctx.save();ctx.globalAlpha=reveal;
 const pulse=.5+.5*Math.sin(time*5.2);
 // The pointed cavity and its depth gradient are cached; only living detail animates each frame.
 ctx.clip(throatShape);
 ctx.drawImage(throatCanvas,tx-48,ty-56);
 ctx.globalCompositeOperation='lighter';ctx.lineWidth=1;
 for(let side=-1;side<=1;side+=2){
  ctx.globalAlpha=reveal*(.13+.07*light);
  ctx.strokeStyle=side<0?'#8e2102':'#b12d03';
  ctx.beginPath();ctx.moveTo(tx+side*25,ty-31);
  ctx.bezierCurveTo(tx+side*(18+Math.sin(time*2.1)*2),ty-9,tx+side*20,ty+15,tx+side*9,ty+38);ctx.stroke();
 }
 // Dim warm flecks at the back of the throat provide depth without a geometric ring.
 for(let i=0;i<9;i++){
  const x=tx-13+(i*17%27),y=ty+19+(i*11%18),r=.45+(i%3)*.22;
  ctx.globalAlpha=reveal*(.08+.08*light)*(1-.25*Math.sin(time*3+i));
  ctx.fillStyle=i%3?'#a32a03':'#e05a08';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=reveal*(.82+.08*pulse);ctx.fillStyle='#010000';
 ctx.beginPath();ctx.ellipse(tx-2,ty+2,7.5+pulse,16+pulse*2,0,0,Math.PI*2);ctx.fill();
 ctx.restore();
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
  aimX=0;aimY=0;
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
 if(!ready||q.visible<=.02)return;
 // Rendered into the actual game and anchored at the camera's center/player region.
 const direction=lightDirection;
 // Keep the whole owner silhouette, fins and teeth inside both portrait and landscape playfields.
 const base=Math.min(cw/SIZE[0],ch/SIZE[1])*.86;
 const s=base*q.scale;
 const cx=cw*.5+aimX,cy=ch*.47+aimY;
 // Composite the broad water glow behind the silhouette so it cannot wash out teeth and pixel detail.
 if(q.light>.02){
  ctx.save();ctx.globalAlpha=clamp(q.visible)*q.light;
  const haloRadius=Math.max(35,140*s);
  ctx.globalCompositeOperation='lighter';
  ctx.drawImage(haloCanvas,cx-haloRadius,cy-haloRadius,haloRadius*2,haloRadius*2);ctx.restore();
 }
 ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.translate(-P[0],-P[1]);
 ctx.globalAlpha=clamp(q.visible);
 // The independently pulsing throat sits behind both rigid articulated layers.
 throat(seconds,q.open,q.light);
 // Rigid frontal articulation stays on the mouth centerline; no lateral swing or tooth/image stretch.
 const jawTremor=q.phase==='bite'?Math.sin((seconds-FIRST)*48)*(1.1+2.2*q.impact):0;
 const upperOpen=smooth(q.open*.82),lowerOpen=smooth(Math.max(0,(q.open-.06)/.94));
 ctx.save();ctx.translate(0,-7*upperOpen-jawTremor);drawPart('upper',direction,q.light);drawTeeth('upper',seconds,upperOpen,q.light,q.impact);drawEyes(seconds,q.light);ctx.restore();
 ctx.save();ctx.translate(0,44*lowerOpen+jawTremor);drawPart('lower',direction,q.light);drawTeeth('lower',seconds,lowerOpen,q.light,q.impact);ctx.restore();
 ctx.restore();
 if(q.light>.02){
  // Bubbles and bite spray remain foreground reactions.
  bubbles(seconds,s,cx,cy);biteImpact(seconds,q.impact,s,cx,cy+20*s);
 }
 // Real gameplay damage, once per encounter, through the existing fish hit path.
 if(q.hit&&q.cycle!==attackedCycle){
  attackedCycle=q.cycle;
  const hero=sampleHero(seconds,true);
  const inMouth=!targetHero||!hero||Math.hypot(hero[0]-targetHero[0],hero[1]-targetHero[1])<38;
  let hit=false;
  if(inMouth){
   try{if(typeof window.__abyssPlayMawHit==='function')hit=!!window.__abyssPlayMawHit()}catch(e){console.error('ABYSS maw hit:',e)}
  }else state.avoidedCount++;
  if(hit)cameraKick=1;
  state.lastHit=hit;state.attackCount++;
 }
 state.rendered=++rendered;
}
// Join the game's existing RAF scheduler instead of creating a parallel loop.
// Both the WebGL update and this layered entity now advance from the same frame clock.
const gameRAF=window.requestAnimationFrame.bind(window);
let gameFrame=-1;
window.requestAnimationFrame=callback=>gameRAF(now=>{
 if(ready&&typeof window.__abyssPlayMawHit==='function'&&now!==gameFrame){
  if(!start)start=now;
  const dt=gameFrame<0?0:Math.min(.05,(now-gameFrame)/1000);gameFrame=now;frame(now,dt);
 }
 callback(now);
});
})();
