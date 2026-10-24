(()=>{'use strict';
// ABYSS GLOW play: owner-derived layered maw encounter in actual game.
// No changes to the accepted stand. Transparent overlay does not intercept touch.
const SIZE=[217,289], P=[108,168], atlas=new Image(),lights=new Image();
atlas.src='../assets/maw_front_v1/maw_front_atlas.png';
lights.src='../assets/maw_front_v1/maw_front_light8.png';
const canvas=document.createElement('canvas');
canvas.id='play-maw';canvas.setAttribute('aria-hidden','true');
canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;z-index:4;pointer-events:none;image-rendering:pixelated';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
ctx.imageSmoothingEnabled=false;
const rect={upper:{body:[2,2],detail:[223,2],emissive:[665,2]},lower:{body:[2,295],detail:[223,295],emissive:[665,295]}};
const loaded=Promise.all([atlas.decode(),lights.decode()]).then(()=>true).catch(err=>{console.error('ABYSS play maw art unavailable:',err);return false});
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
const state={ready:false,visible:false,attackCount:0,lastHit:false};
Object.defineProperty(window,'__abyssPlayMaw',{value:state,configurable:false});
function frameState(seconds){
 if(seconds<FIRST)return {phase:'waiting',visible:0,scale:.12,open:0,light:0,hit:false,cycle:-1};
 const cycle=Math.floor((seconds-FIRST)/PERIOD),t=(seconds-FIRST)-cycle*PERIOD;
 if(t<1.0){const a=smooth(t);return {phase:'warning',visible:.1+.3*a,scale:.18+.09*a,open:0,light:a,hit:false,cycle}}
 if(t<1.85){const a=smooth((t-1)/.85);return {phase:'emerge',visible:.4+.6*a,scale:.27+1.9*a,open:a*.9,light:.5+.5*a,hit:false,cycle}}
 if(t<2.30){const a=smooth((t-1.85)/.45);return {phase:'bite',visible:1,scale:2.17+.22*a,open:.9+.1*Math.sin(a*Math.PI),light:1.0,hit:t>2.07,cycle}}
 if(t<3.25){const a=smooth((t-2.30)/.95);return {phase:'retreat',visible:1-a,scale:2.39-2.2*a,open:1-a,light:1-a,hit:false,cycle}}
 return {phase:'waiting',visible:0,scale:.12,open:0,light:0,hit:false,cycle};
}
function layer(part,layerName){
 const [sx,sy]=rect[part][layerName];
 ctx.drawImage(atlas,sx,sy,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
}
function drawPart(part,direction,glow){
 layer(part,'body');
 layer(part,'detail');
 const row=part==='upper'?0:SIZE[1];
 ctx.drawImage(lights,direction*SIZE[0],row,SIZE[0],SIZE[1],0,0,SIZE[0],SIZE[1]);
 if(glow>0){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,.6+glow*.32);
  ctx.shadowColor='#ff8b08';ctx.shadowBlur=11+glow*28;
  layer(part,'emissive');
  ctx.restore();
 }
 layer(part,'emissive');
}
function bubbles(time,s,ox,oy){
 const n=15;
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){
  const p=((time*.28+i/n)%1),drift=Math.sin(time*1.2+i*2.4)*9;
  const x=ox+(Math.sin(i*7.13)*90+drift)*s;
  const y=oy+(115-p*200)*s;
  const r=Math.max(.9,(1.3+i%3)*s*.8);
  ctx.strokeStyle='rgba(250,162,43,'+(Math.max(0,.45-p*.3)).toFixed(2)+')';
  ctx.lineWidth=Math.max(.7,s*.65);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}
function frame(now,dt){
 resize();
 const seconds=(now-start)/1000;const q=frameState(seconds);
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);
 state.ready=ready;state.visible=ready&&q.visible>.02;state.phase=q.phase;state.elapsed=seconds;state.dt=dt;
 if(!ready||q.visible<=.02)return;
 // Rendered into the actual game and anchored at the camera's center/player region.
 const direction=lightDirection;
 const base=Math.min(cw/SIZE[0],ch/SIZE[1])*1.25;
 const s=base*q.scale;
 const cx=cw*.5,cy=ch*.47;
 ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.translate(-P[0],-P[1]);
 ctx.globalAlpha=clamp(q.visible);
 // The throat is BEHIND both articulated layers, and revealed by lower-jaw displacement.
 if(q.open>0){
  ctx.save();const throat=ctx.createRadialGradient(P[0],P[1]+22,2,P[0],P[1]+22,70);
  throat.addColorStop(0,'#160000');throat.addColorStop(.55,'#320500');throat.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=throat;ctx.beginPath();ctx.ellipse(P[0],P[1]+22,43,43,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 // Rigid upper/lower body motion; no tooth/image stretch.
 ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-.018*q.open);ctx.translate(-P[0],-P[1]);drawPart('upper',direction,q.light);ctx.restore();
 ctx.save();ctx.translate(P[0],P[1]+36*q.open);ctx.rotate(.018*q.open);ctx.translate(-P[0],-P[1]);drawPart('lower',direction,q.light);ctx.restore();
 ctx.restore();
 if(q.light>.02){
  ctx.save();ctx.globalAlpha=clamp(q.visible)*q.light;
  const halo=ctx.createRadialGradient(cx,cy,6,cx,cy,Math.max(35,140*s));
  halo.addColorStop(0,'rgba(253,200,54,.08)');halo.addColorStop(.4,'rgba(229,100,4,.07)');halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=halo;ctx.fillRect(0,0,cw,ch);ctx.restore();
  bubbles(seconds,s,cx,cy);
 }
 // Real gameplay damage, once per encounter, through the existing fish hit path.
 if(q.hit&&q.cycle!==attackedCycle){
  attackedCycle=q.cycle;
  let hit=false;
  try{if(typeof window.__abyssPlayMawHit==='function')hit=!!window.__abyssPlayMawHit()}catch(e){console.error('ABYSS maw hit:',e)}
  state.lastHit=hit;state.attackCount++;
 }
 state.rendered=++rendered;
}
// Join the game's existing RAF scheduler instead of creating a parallel loop.
// Both the WebGL update and this layered entity now advance from the same frame clock.
const gameRAF=window.requestAnimationFrame.bind(window);
let gameFrame=-1;
window.requestAnimationFrame=callback=>gameRAF(now=>{
 if(typeof window.__abyssPlayMawHit==='function'&&now!==gameFrame){
  if(!start)start=now;
  const dt=gameFrame<0?0:Math.min(.05,(now-gameFrame)/1000);gameFrame=now;frame(now,dt);
 }
 callback(now);
});
})();
