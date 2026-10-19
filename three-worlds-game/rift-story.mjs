import {DialogueGenerator} from './dialogue.mjs';
import {createAshFactory} from './ash-assets.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {clamp} from './world-core.mjs';
import {createGuestSchedule,finishGuestSchedule} from './stage7-simulation.mjs';
import {createRiftEvent,RIFT_WORDS} from './rift-event.mjs';
export function guestHomeFor(world){return world==='ash'?'island':world==='water'?'ash':'water';}
export function guestLine(home,current,state){
 const need=home==='water'&&current!=='water'?'Мне нужна вода. Проводи меня к берегу.':home==='ash'&&current==='water'?'Я замерзаю. Выведи меня к огню.':'Пепел закрыл дорогу домой. Помоги добраться до разлома.';
 return state==='friend'?'Ты не бросил меня. Я прикрою тебя.':state==='hostile'?'Ты видел, что мне нужна помощь. Теперь я защищаюсь.':state==='home'?'Дорога открыта. Это оружие теперь твоё.':need;
}
export function createRiftStory({THREE,scene,renderer,camera,player,height,seed,toast,prepare,onTransition,attacking,onAttack,reward,getHostiles=()=>[],damageHostile=()=>{},getWorldId=()=>player.pos.y<3.6?'water':player.pos.x<-64?'ash':'island',canStart=()=>true,onEventFX=()=>{},onFreeze=()=>{}}){
 let snapshot={};try{snapshot=JSON.parse(localStorage.getItem('three-worlds-dialogue')||'{}')}catch{}
 const dialogue=new DialogueGenerator(snapshot);
 function line(g,state){const text=dialogue.next({home:g.home,world:getWorldId(),state,night:clock%120>60});try{localStorage.setItem('three-worlds-dialogue',JSON.stringify(dialogue.serialize()))}catch{}return text}
 const portals=[{x:-22,z:32,to:{x:-82,z:32}},{x:-126,z:32,to:{x:100,z:34}},{x:102,z:40,to:{x:46,z:32}}],meshes=[];
 let clock=0,cooldown=0,guest=null,factory=null,sheet=null,riftAge=99;
 const guestTimer=createGuestSchedule(seed,{interval:typeof location!=='undefined'&&new URLSearchParams(location.search).get('guestDebug')==='1'?5:50});
 const event=createRiftEvent(seed,{initial:typeof location!=='undefined'&&new URLSearchParams(location.search).get('guestDebug')==='1'?5:50});
 let previousPhase='idle';
 const choiceUI=document.createElement('dialog');choiceUI.id='threeWorldsGuestChoice';
 choiceUI.setAttribute('aria-label','Разрыв: гость из другого мира');
 choiceUI.style.cssText='max-width:min(560px,92vw);background:#171628;color:#f7e9cf;border:2px solid #6ffff0;border-radius:13px;padding:22px;box-shadow:0 15px 75px #000b;font:17px/1.5 Georgia,serif;touch-action:pan-y;z-index:99';
 const speech=document.createElement('p');speech.textContent=RIFT_WORDS;
 const question=document.createElement('p');question.id='guestStoryText';
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
 const help=document.createElement('button');help.textContent='Помочь';help.type='button';
 const refuse=document.createElement('button');refuse.textContent='Отказаться';refuse.type='button';
 for(const btn of [help,refuse])btn.style.cssText='min-width:125px;min-height:48px;border-radius:8px;border:1px solid #aafff4;background:#283945;color:white;font:17px Georgia,serif';
 controls.append(help,refuse);choiceUI.append(speech,question,controls);document.body.appendChild(choiceUI);
 choiceUI.addEventListener('cancel',e=>e.preventDefault());
 function selectChoice(value){if(!event.choose(value))return;choiceUI.close();if(guest){guest.brain.relation=value==='help'?'friend':'hostile';guest.brain.state=value==='help'?'follow':'attack';toast(line(guest,value==='help'?'friend':'hostile'),3600)}onEventFX('closing')}
 help.addEventListener('click',()=>selectChoice('help'));
 refuse.addEventListener('click',()=>selectChoice('refuse'));

 const geometry=new THREE.PlaneGeometry(3.5,5);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;
 void main(){vec2 p=(vUv-.5)*2.;float slit=sin(p.y*19.+time*.9)*.06+sin(p.y*7.-time*.4)*.08;
 float w=(.16+.045*sin(p.y*31.))*(1.-smoothstep(.7,1.,abs(p.y)));
 float edge=abs(abs(p.x-slit)-w);
 float inside=1.-smoothstep(w-.03,w+.015,abs(p.x-slit));
 float fiber=exp(-edge*34.)*(.72+.28*sin(p.y*66.+time*3.));
 float teeth=step(.66,fract(p.y*18.+sin(p.y*51.)*.3))*exp(-edge*13.);
 float stars=step(.993,fract(sin(dot(floor(p*vec2(12.,44.)),vec2(12.9898,78.233)))*43758.5));
 vec3 abyss=mix(vec3(.015,.08,.14),vec3(.06,.3,.36),sin(p.y*6.+time)*.5+.5);
 vec3 rgb=abyss*(inside+stars*inside*1.5)+vec3(.17,1.,.94)*(fiber*1.7+teeth*.3);
 float alpha=clamp(inside*.8+fiber+teeth*.2,0.,.98);
 gl_FragColor=vec4(rgb,alpha);
 }`});
 for(const p of portals){const m=new THREE.Mesh(geometry,material);m.position.set(p.x,height(p.x,p.z)+2.4,p.z);scene.add(m);meshes.push(m)}
 const guestRift=new THREE.Mesh(geometry,material);guestRift.visible=false;scene.add(guestRift);
 const riftLight=new THREE.PointLight(0x38e8e6,0,9);scene.add(riftLight);
 function bake(){
  factory ||= createAshFactory(THREE);const def=factory.models.find(d=>d.id==='scavenger'),inst=factory.instance(def),s=new THREE.Scene();s.add(inst.root);
  const cam=new THREE.OrthographicCamera(-1.8,1.8,2.7,-.9,.1,20);cam.position.set(0,2,7);cam.lookAt(0,1,0);
  const rt=new THREE.WebGLRenderTarget(384,384,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
  const prev=renderer.getRenderTarget(),color=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),test=renderer.getScissorTest(),auto=renderer.autoClear;
  try{renderer.autoClear=false;renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.setScissorTest(true);
   for(let f=0;f<8;f++)for(let d=0;d<8;d++){inst.root.rotation.y=d*Math.PI/4;factory.animate(inst,f/8,{mode:'walk',sp:1});renderer.setViewport(d*48,f*48,48,48);renderer.setScissor(d*48,f*48,48,48);renderer.clear(true,true,true);renderer.render(s,cam)}
  }finally{renderer.setRenderTarget(prev);renderer.setClearColor(color,alpha);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);renderer.autoClear=auto;inst.mat.dispose()}
  sheet=rt;
 }
 function spawnGuest(spot){
  if(guest)return false;
  // Directly animate the owner's original scavenger asset. This removes the
  // first-appearance WebGL readback/render-target dependency which could prevent
  // the timed guest from materializing for an idle player.
  factory ||= createAshFactory(THREE);
  const def=factory.models.find(d=>d.id==='scavenger');
  if(!def)throw new Error('Original Ash scavenger model missing');
  const inst=factory.instance(def);
  const target=spot||event.state.spot||{x:player.pos.x+2.6,z:player.pos.z};
  const x=target.x,z=target.z;
  const m=inst.root;m.position.set(x,height(x,z)+4,z);m.scale.setScalar(1.6);scene.add(m);
  guestRift.position.set(x,height(x,z)+2.3,z);guestRift.visible=true;
  riftLight.position.copy(guestRift.position);riftAge=0;
  guest={mesh:m,inst,brain:createBrain('original-scavenger',{x,z},seed),home:guestHomeFor(getWorldId()),landed:false,fall:0,help:0,age:0,talk:-99,damageClock:0,rewarded:false};
  toast(line(guest,'neutral'),4200);
  return true;
 }
 function finishGuest(g){
  scene.remove(g.mesh);g.inst.mat.dispose();guest=null;finishGuestSchedule(guestTimer);
 }
 function travel(p){prepare(p.to.x,p.to.z);player.pos.set(p.to.x,height(p.to.x,p.to.z)+.3,p.to.z);player.vel.set(0,0,0);cooldown=6;onTransition();}
 function update(dt){clock+=dt;cooldown=Math.max(0,cooldown-dt);material.uniforms.time.value=clock;
  for(let i=0;i<portals.length;i++){const p=portals[i],m=meshes[i];m.lookAt(camera.position.x,m.position.y,camera.position.z);if(cooldown===0&&Math.hypot(player.pos.x-p.x,player.pos.z-p.z)<1.5&&Math.abs(player.pos.y-height(p.x,p.z))<3)travel(p)}
  riftAge+=dt;guestRift.visible=riftAge<3.5;if(guestRift.visible){guestRift.scale.x=clamp(Math.min(riftAge,3.5-riftAge)*2,.01,1);guestRift.lookAt(camera.position.x,guestRift.position.y,camera.position.z)}riftLight.intensity=guestRift.visible?3*Math.min(1,(3.5-riftAge)*2):0;
  // A single scriptable event: sound + glitch -> spoken line -> rift -> guest -> dialog -> close.
  const ground=height(player.pos.x,player.pos.z);
  const land=getWorldId()!=='water'&&Number.isFinite(ground)&&ground>3.92;
  event.step(dt,{land,battle:!canStart(),pos:player.pos,look:player.look});
  const phase=event.state.phase;
  if(phase!==previousPhase){
   previousPhase=phase;
   onEventFX(phase);
   if(phase==='warning'){if(guest)finishGuest(guest);onFreeze(true);toast(RIFT_WORDS,2400,true);}
   if(phase==='opening'){
    const p=event.state.spot;
    guestRift.position.set(p.x,height(p.x,p.z)+2.3,p.z);
    riftAge=0;guestRift.visible=true;riftLight.position.copy(guestRift.position);
   }
   if(phase==='emerging')spawnGuest(event.state.spot);
   if(phase==='dialogue'){
    if(!guest)spawnGuest(event.state.spot);
    question.textContent=guest?line(guest,'neutral'):'Гость из другого мира просит помощи.';
    if(!choiceUI.open)choiceUI.showModal();
   }
   if(phase==='closing'){
    if(choiceUI.open)choiceUI.close();
    riftAge=2.9;
   }
   if(phase==='idle'){onFreeze(false);onEventFX('idle');}
  }
  if(phase==='opening'||phase==='emerging'){
   guestRift.visible=true;riftAge=Math.min(2.8,riftAge+dt*.75);
   guestRift.scale.x=clamp((phase==='opening'?event.state.elapsed:1)*1.1,.08,1);
  }else if(phase==='dialogue'){guestRift.visible=true;guestRift.scale.x=1;}
  if(!guest)return;const g=guest,p=g.mesh.position;g.age+=dt;g.damageClock=Math.max(0,g.damageClock-dt);
  const floor=height(p.x,p.z),distance=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);
  if(!g.landed){g.fall+=dt*9;p.y-=g.fall*dt;if(p.y<=floor+1.6){p.y=floor+1.6;g.landed=true;onTransition(.1)}}
  else{
   if(event.dialogue)return; // Guest waits for the owner's explicit Help/Refuse choice.
   const attack=attacking();if(attack&&distance<3&&g.damageClock===0){g.brain.hp-=12;g.brain.relation='hostile';g.damageClock=.7;toast(line(g,'hostile'),2600)}
   if(g.brain.hp<=0){finishGuest(g);return}
   if(g.brain.relation==='neutral'&&distance<2.6&&!attack){g.help+=dt;if(g.help>2){g.brain.relation='friend';toast(line(g,'friend'),2800)}}
   if(g.brain.relation==='neutral'&&g.age>25&&distance>13)g.brain.relation='hostile';
   stepBrain(g.brain,p,dt,{player:player.pos,height:(x,z)=>height(x,z)+1.6,sea:3.8});
   if(g.brain.relation==='hostile'&&distance<2&&g.damageClock===0){onAttack();g.damageClock=2}
   if(g.brain.relation==='friend'&&!g.rewarded&&g.damageClock===0){
    const nearby=getHostiles().filter(h=>Math.hypot(h.x-p.x,h.z-p.z)<9).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
    if(nearby.length){damageHostile(nearby[0],8);g.damageClock=1.5;}
   }
   if(g.brain.relation==='friend'&&player.pos.x<-64&&Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<=12&&!g.rewarded){g.rewarded=true;reward();toast(guestLine('ash','ash','home'),3200)}
   if(g.rewarded){g.brain.relation='neutral';g.brain.state='wander';g.brain.target={x:-126,z:32};g.brain.clock=5;if(Math.hypot(p.x+126,p.z-32)<2){finishGuest(g);return}}
  }
  g.mesh.rotation.y=Number.isFinite(g.brain.heading)?g.brain.heading:Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  factory.uniforms.uTime.value=clock;
  factory.animate(g.inst,clock,{mode:g.landed?'walk':'idle',sp:g.landed?.7:0});
 }
 function dispose(){onFreeze(false);if(choiceUI.open)choiceUI.close();choiceUI.remove();for(const m of meshes)scene.remove(m);scene.remove(guestRift,riftLight);geometry.dispose();material.dispose();if(guest){scene.remove(guest.mesh);guest.inst.mat.dispose()}sheet?.dispose();factory?.dispose()}
 return {update,dispose,travel,portals,spawnGuest,choose:selectChoice,get locked(){return event.blocked},get event(){return {...event.state}},get riftMesh(){return guestRift},get guest(){return guest},get guestTimer(){return {...event.state,remaining:event.state.remaining}}};
}
