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
  return {phase:'bite',visible:1,scale:.95+.08*a-.018*impact,open,light:1+.35*impact,impact,hit:t>2.07,cycle};
 }
 if(t<3.25){const a=smooth((t-2.30)/.95);return {phase:'retreat',visible:1-a,scale:1.03-.77*a,open:.38*(1-a),light:1-a,impact:0,hit:false,cycle}}
 return {phase:'waiting',visible:0,scale:.26,open:0,light:0,impact:0,hit:false,cycle};
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
function throat(time,open,light){
 const reveal=smooth((open-.08)/.92);
 if(reveal<=0)return;
 const tx=P[0],ty=P[1]+18;
 ctx.save();ctx.globalAlpha=reveal;
 const pulse=.5+.5*Math.sin(time*5.2);
 // An asymmetric, pointed cavity joins both jaw roots; no freestanding oval/portal edge.
 ctx.beginPath();ctx.moveTo(tx-3,ty-45);
 ctx.bezierCurveTo(tx+28,ty-40,tx+36,ty-12,tx+30,ty+14);
 ctx.bezierCurveTo(tx+25,ty+35,tx+12,ty+46,tx+2,ty+49);
 ctx.bezierCurveTo(tx-14,ty+43,tx-28,ty+31,tx-33,ty+8);
 ctx.bezierCurveTo(tx-38,ty-17,tx-25,ty-39,tx-3,ty-45);ctx.closePath();ctx.clip();
 const depth=ctx.createRadialGradient(tx-4,ty+4,3,tx-1,ty+2,47);
 depth.addColorStop(0,'#010000');depth.addColorStop(.5,'#050000');
 depth.addColorStop(.78,'#170200');depth.addColorStop(1,'#020000');
 ctx.fillStyle=depth;ctx.fillRect(tx-40,ty-50,80,104);
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
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);
 state.ready=ready;state.visible=ready&&q.visible>.02;state.phase=q.phase;state.elapsed=seconds;state.dt=dt;
 if(!ready||q.visible<=.02)return;
 // Rendered into the actual game and anchored at the camera's center/player region.
 const direction=lightDirection;
 // Keep the whole owner silhouette, fins and teeth inside both portrait and landscape playfields.
 const base=Math.min(cw/SIZE[0],ch/SIZE[1])*.86;
 const s=base*q.scale;
 const cx=cw*.5,cy=ch*.47;
 ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.translate(-P[0],-P[1]);
 ctx.globalAlpha=clamp(q.visible);
 // The independently pulsing throat sits behind both rigid articulated layers.
 throat(seconds,q.open,q.light);
 // Rigid upper/lower body motion; no tooth/image stretch.
 const biteShock=q.phase==='bite'?Math.sin((seconds-FIRST)*48)*(.012+.035*q.impact):0;
 const upperOpen=smooth(q.open*.82),lowerOpen=smooth(Math.max(0,(q.open-.06)/.94));
 ctx.save();ctx.translate(P[0],P[1]-4*upperOpen);ctx.rotate(-.04*upperOpen-biteShock);ctx.translate(-P[0],-P[1]);drawPart('upper',direction,q.light);ctx.restore();
 ctx.save();ctx.translate(P[0],P[1]+52*lowerOpen);ctx.rotate(.032*lowerOpen+biteShock);ctx.translate(-P[0],-P[1]);drawPart('lower',direction,q.light);ctx.restore();
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
