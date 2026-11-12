/* Observer World V8: observer is an independent view; original 3D person engine remains intact. */
(()=>{'use strict';
const state={mode:'person',x:0,y:0,zoom:1,markers:JSON.parse(localStorage.getItem('observer-v8-markers')||'[]')};
const $=s=>document.querySelector(s);
function boot(){
 const menu=$('#v5Menu');if(!menu){setTimeout(boot,150);return}
 const wrap=document.createElement('div');wrap.id='v8Modes';
 wrap.innerHTML='<button id="v8Toggle" aria-label="Switch observer and person modes"><span id="v8Pixel">▦</span><span id="v8ModeLabel">👁 НАБЛЮДАТЕЛЬ</span></button>';
 menu.insertBefore(wrap,menu.querySelector('summary').nextSibling);
 const layer=document.createElement('section');layer.id='v8Observer';layer.hidden=true;
 layer.innerHTML='<button id="v8Return" type="button">♟ Вернуться к персонажу</button><canvas id="v8Map" aria-label="Overhead island map"></canvas><div id="v8Actions"><button data-action="build">⚒ Построить</button><button data-action="spawn">♟ Персонаж</button><button data-action="story">▤ История</button></div><div id="v8Story" hidden><button id="v8Close">×</button><button id="v8Expand">⛶</button><article id="v8Text"></article></div>';
 document.body.appendChild(layer);
 const canvas=$('#v8Map'),ctx=canvas.getContext('2d');let touches=new Map(),lastPinch=0,frame=0;
 function noise(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
 function island(x,y){let a=Math.sin(x*.011)+Math.cos(y*.013)+.45*Math.sin((x+y)*.027);return a+noise(Math.floor(x/13),Math.floor(y/13))*.33>.18}
 function draw(){
  if(state.mode!=='eye')return;
  let w=canvas.width=canvas.clientWidth*devicePixelRatio,h=canvas.height=canvas.clientHeight*devicePixelRatio;
  ctx.fillStyle='#12354b';ctx.fillRect(0,0,w,h);
  const tile=Math.max(8,Math.round(18*state.zoom*devicePixelRatio)),cols=Math.ceil(w/tile)+2,rows=Math.ceil(h/tile)+2;
  const startX=Math.floor(state.x-w/tile/2),startY=Math.floor(state.y-h/tile/2);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let x=startX+i,y=startY+j,land=island(x*3,y*3);
   ctx.fillStyle=land?(noise(x,y)>.78?'#8eaa65':noise(x+3,y)>.4?'#48763f':'#335d38'):'#16465d';
   ctx.fillRect(i*tile,j*tile,tile+1,tile+1);
   if(land&&noise(x*3,y*4)>.95){ctx.fillStyle='#234e30';ctx.fillRect(i*tile+tile*.3,j*tile+tile*.15,tile*.4,tile*.65)}
  }
  for(const m of state.markers){const px=(m.x-startX)*tile,py=(m.y-startY)*tile;if(px<0||py<0||px>w||py>h)continue;ctx.font=tile+'px monospace';ctx.fillText(m.type==='spawn'?'♟':'▣',px,py+tile)}
  frame=requestAnimationFrame(()=>{}); // view is event-driven, not a second game loop
 }
 function redraw(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw)}
 function mode(next){state.mode=next;layer.hidden=next!=='eye';document.body.classList.toggle('v8-eye',next==='eye');$('#v8ModeLabel').textContent=next==='eye'?'♟ ПЕРСОНАЖ':'👁 НАБЛЮДАТЕЛЬ';if(next==='eye'){window.__observerV8?.onEnter?.();redraw()}else{window.ObserverMobileControls?.active?.release?.()}menu.open=false}
 $('#v8Toggle').onclick=()=>mode(state.mode==='eye'?'person':'eye');$('#v8Return').onclick=()=>mode('person');
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0});
 canvas.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;e.preventDefault();let old=touches.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===1){state.x-=dx/(18*state.zoom);state.y-=dy/(18*state.zoom)}else if(touches.size===2){const [a,b]=[...touches.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch)state.zoom=Math.max(.45,Math.min(3.8,state.zoom*d/lastPinch));lastPinch=d}redraw()});
 const end=e=>{touches.delete(e.pointerId);lastPinch=0};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 const stories=['На острове появился новый объект. Жители сперва приняли его за случайность, затем за закономерность. К вечеру возник комитет по исследованию причин, но причины уже успели изменить самих исследователей.','Строительство закончилось, и мир стал немного другим. Никто не заметил момента перемены: лишь вода отразила незнакомый свет, а старый сторож вдруг вспомнил будущее, которого ещё не было.'];
 let selected=0;
 layer.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{let action=b.dataset.action;if(action==='story'){$('#v8Story').hidden=false;return}
 state.markers.push({x:Math.round(state.x),y:Math.round(state.y),type:action});localStorage.setItem('observer-v8-markers',JSON.stringify(state.markers));selected++;$('#v8Text').textContent=stories[selected%stories.length];$('#v8Story').hidden=false;redraw()});
 $('#v8Close').onclick=()=>$('#v8Story').hidden=true;$('#v8Expand').onclick=()=>$('#v8Story').classList.toggle('expanded');
 window.addEventListener('resize',redraw);window.__observerV8={state,mode,redraw};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();