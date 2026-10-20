import {DialogueGenerator} from './dialogue.mjs';
import {createAshFactory} from './ash-assets.mjs';
import {instantiateOriginalGuest} from './guest-roster.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {clamp} from './world-core.mjs';
import {createRiftEvent,RIFT_WORDS} from './rift-event.mjs';
export function riftCountdownAllowed(_land,guest){return !guest;}
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
 let clock=0,cooldown=0,guest=null,factory=null,sheet=null,riftAge=99,mission=null,bossState=null,dialogFull='',dialogTyped=0;
 const event=createRiftEvent(seed,{initial:typeof location!=='undefined'&&new URLSearchParams(location.search).get('guestDebug')==='1'?5:50});
 let previousPhase='idle';
 const choiceUI=document.createElement('dialog');choiceUI.id='threeWorldsGuestChoice';
 choiceUI.setAttribute('aria-label','Разрыв: гость из другого мира');
 choiceUI.style.cssText='max-width:min(560px,92vw);background:#171628;color:#f7e9cf;border:2px solid #6ffff0;border-radius:13px;padding:22px;box-shadow:0 15px 75px #000b;font:17px/1.5 Georgia,serif;touch-action:pan-y;z-index:99';
 const speech=document.createElement('p');speech.textContent=RIFT_WORDS;
 const question=document.createElement('p');question.id='guestStoryText';question.setAttribute('aria-live','polite');
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
 const help=document.createElement('button');help.textContent='Помочь';help.type='button';
 const refuse=document.createElement('button');refuse.textContent='Отказаться';refuse.type='button';
 for(const btn of [help,refuse])btn.style.cssText='min-width:125px;min-height:48px;border-radius:8px;border:1px solid #aafff4;background:#283945;color:white;font:17px Georgia,serif';
 controls.append(help,refuse);controls.hidden=true;choiceUI.append(speech,question,controls);document.body.appendChild(choiceUI);
 choiceUI.addEventListener('cancel',e=>e.preventDefault());
 function selectChoice(value){if(!event.choose(value))return;choiceUI.close();onFreeze(false);if(guest){guest.brain.relation=value==='help'?'friend':'hostile';guest.brain.state=value==='help'?'follow':'attack';toast(value==='help'?'Пойдём со мной.':'Жаль, что ты выбрал быть моим врагом.',3600)}if(value==='refuse'&&guest){guest.brain.hp=180;bossState={hp:180,maxHp:180,phase:1};onEventFX('boss');}else onEventFX('closing')}
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
  factory ||= createAshFactory(THREE);const {inst}=instantiateOriginalGuest(factory),s=new THREE.Scene();s.add(inst.root);
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
  const {inst,ref,sourceVoxels,sourceParts}=instantiateOriginalGuest(factory);
  const target=spot||event.state.spot||{x:player.pos.x+2.6,z:player.pos.z};
  const x=target.x,z=target.z;
  const m=inst.root;m.position.set(x,height(x,z)+1.6,z);m.scale.setScalar(0.92);scene.add(m);
  guestRift.position.set(x,height(x,z)+2.3,z);guestRift.visible=true;
  riftLight.position.copy(guestRift.position);riftAge=0;
  guest={mesh:m,inst,brain:createBrain('original-strider_m',{x,z},seed),origin:ref.origin,originalId:ref.sourceModel,sourceVoxels,sourceParts,home:guestHomeFor(getWorldId()),landed:false,fall:0,help:0,age:0,talk:-99,damageClock:0,rewarded:false,sourceWorld:getWorldId()};
  // The guest is revealed from the depth of the original rift, without ballistic fall.
  m.visible=false;
  return true;
 }
 function finishGuest(g){
  scene.remove(g.mesh);g.inst.mat.dispose();guest=null;bossState=null;
 }
 function travel(p){prepare(p.to.x,p.to.z);player.pos.set(p.to.x,height(p.to.x,p.to.z)+.3,p.to.z);player.vel.set(0,0,0);cooldown=6;onTransition();}
 function update(dt){clock+=dt;cooldown=Math.max(0,cooldown-dt);material.uniforms.time.value=clock;
  for(let i=0;i<portals.length;i++){const p=portals[i],m=meshes[i];m.lookAt(camera.position.x,m.position.y,camera.position.z);if(cooldown===0&&Math.hypot(player.pos.x-p.x,player.pos.z-p.z)<1.5&&Math.abs(player.pos.y-height(p.x,p.z))<3)travel(p)}
  // Owner §21.15: 5s in-world glitch, 5s held line, 5s real depth emergence.
  // Exactly one phase source controls both post FX and the terrain-anchored object.
  const phaseBefore=event.state.phase;
  if(riftCountdownAllowed(true,guest)&&phaseBefore==='idle'&&event.state.remaining<=dt){
    const pos=player.pos,probe=new THREE.Vector3(),steps=32;
    camera.updateMatrixWorld();
    let best=null;
    for(let i=0;i<steps;i++){
      const theta=i*Math.PI*2/steps,dx=Math.cos(theta),dz=Math.sin(theta);
      const x=pos.x+3.2*dx,z=pos.z+3.2*dz;
      probe.set(x,height(x,z)+2.3,z).project(camera);
      if(!Number.isFinite(probe.x)||!Number.isFinite(probe.y)||probe.z<=-1||probe.z>=1)continue;
      const score=probe.x*probe.x+probe.y*probe.y;
      if(!best||score<best.score)best={dx,dz,score};
    }
    if(best)player.look.set(best.dx,0,best.dz);
  }
  event.step(dt,{land:true,battle:false,occupied:!!guest,pos:player.pos,look:player.look});
  const phase=event.state.phase,spot=event.state.spot;
  const glitch=phase==='warning'?clamp(event.state.elapsed/5,0,1):
    ['opening','emerging','closing'].includes(phase)?1:0;
  onEventFX('intensity',glitch);
  if(phase!==previousPhase){
    previousPhase=phase;onEventFX(phase);
    if(phase==='warning'){
      onFreeze(true);
      guestRift.position.set(spot.x,height(spot.x,spot.z)+2.3,spot.z);
      guestRift.visible=true;
      riftLight.position.copy(guestRift.position);
    }
    if(phase==='opening')toast(RIFT_WORDS,5000,true);
    if(phase==='emerging')spawnGuest(spot);
    if(phase==='dialogue'){
      if(!guest)spawnGuest(spot);
      onFreeze(false);
      dialogFull=guest?line(guest,'neutral'):'Гость из другого мира просит помощи.';
      dialogTyped=0;question.textContent='';controls.hidden=true;
      if(!choiceUI.open)choiceUI.showModal();
    }
    if(phase==='closing'){
      if(choiceUI.open)choiceUI.close();
      onFreeze(false);
    }
    if(phase==='escort'&&guest){
      const from=getWorldId(),to=guestHomeFor(from),
        destinations={island:{x:30,z:32},ash:{x:-90,z:32},water:{x:95,z:34}},
        destination=destinations[to],floor=height(destination.x,destination.z);
      travel({to:destination});
      if(to==='water')player.pos.y=Math.min(3,Math.max(floor+.35,1));
      guest.mesh.position.set(player.pos.x+1.5,height(player.pos.x+1.5,player.pos.z)+1.6,player.pos.z);
      guest.landed=true;guest.brain.relation='friend';guest.age=0;
      mission={origin:from,world:to,kind:'escort',text:to==='water'?
        'Новая миссия: исследуй затонувшие руины и найди знак пути.':
        to==='ash'?'Новая миссия: найди безопасную тропу сквозь пепел.':
        'Новая миссия: доберись до маяка и узнай источник разломов.'};
      toast('Пойдём со мной. '+mission.text,7000);
      event.finishArc(mission);
    }
    if(phase==='idle'){onFreeze(false);onEventFX('idle');}
  }
  if(phase==='dialogue'){
    dialogTyped=Math.min(dialogFull.length,dialogTyped+dt*30);
    question.textContent=dialogFull.slice(0,Math.floor(dialogTyped));
    controls.hidden=dialogTyped<dialogFull.length;
  }
  guestRift.visible=['warning','opening','emerging','dialogue','closing'].includes(phase);
  if(guestRift.visible&&spot){
    guestRift.position.set(spot.x,height(spot.x,spot.z)+2.3,spot.z);
    guestRift.lookAt(camera.position.x,guestRift.position.y,camera.position.z);
    const progress=phase==='warning'?clamp(event.state.elapsed/5,0,1):1;
    guestRift.scale.set(Math.max(.015,progress),Math.max(.015,progress),1);
    riftLight.position.copy(guestRift.position);
    riftLight.intensity=3*progress;
  }else riftLight.intensity=0;
  if(!guest)return;const g=guest,p=g.mesh.position;g.age+=dt;g.damageClock=Math.max(0,g.damageClock-dt);
  const floor=height(p.x,p.z),distance=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);
  if(!g.landed){
   // Emerge five full seconds from INSIDE the slit, at floor height: never drop onto the hero.
   const t=phase==='emerging'?clamp(event.state.elapsed/5,0,1):0;
   const deltaX=spot.x-player.pos.x,deltaZ=spot.z-player.pos.z,L=Math.hypot(deltaX,deltaZ)||1;
   const u=deltaX/L,v=deltaZ/L;
   p.x=spot.x+u*(1.6-2.2*t);p.z=spot.z+v*(1.6-2.2*t);
   p.y=height(p.x,p.z)+1.6;g.mesh.visible=t>.01;
   if(phase==='dialogue'||t>=1){g.landed=true;g.mesh.visible=true;onTransition(.1)}
  }
  else{
   if(event.dialogue)return; // Choice remains explicit; no auto-friendship.
   const attack=attacking();if(attack&&distance<3&&g.damageClock===0){g.brain.hp-=12;g.brain.relation='hostile';g.damageClock=.7;if(bossState){bossState.hp=Math.max(0,g.brain.hp);bossState.phase=g.brain.hp<90?2:1;}toast(line(g,'hostile'),2600)}
   if(g.brain.hp<=0){if(event.state.phase==='boss'){reward();event.finishArc({kind:'victory',world:getWorldId(),text:'Победа над гостем из разлома.'});toast('Победа. Награда получена.',4000)}finishGuest(g);return}
   // The visitor never silently switches allegiance: the player's choice is authoritative.
   stepBrain(g.brain,p,dt,{player:player.pos,height:(x,z)=>height(x,z)+1.6,sea:3.8});
   if(g.brain.relation==='hostile'&&distance<2&&g.damageClock===0){onAttack();g.damageClock=2}
   if(g.brain.relation==='friend'&&!g.rewarded&&g.damageClock===0){
    const nearby=getHostiles().filter(h=>Math.hypot(h.x-p.x,h.z-p.z)<9).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
    if(nearby.length){damageHostile(nearby[0],8);g.damageClock=1.5;}
   }
   if(mission&&g.brain.relation==='friend'&&g.age>25){finishGuest(g);return;}
  }
  g.mesh.rotation.y=Number.isFinite(g.brain.heading)?g.brain.heading:Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  factory.uniforms.uTime.value=clock;
  factory.animate(g.inst,clock,{mode:g.landed?'walk':'idle',sp:g.landed?.7:0});
 }
 function dispose(){onFreeze(false);if(choiceUI.open)choiceUI.close();choiceUI.remove();for(const m of meshes)scene.remove(m);scene.remove(guestRift,riftLight);geometry.dispose();material.dispose();if(guest){scene.remove(guest.mesh);guest.inst.mat.dispose()}sheet?.dispose();factory?.dispose()}
 return {update,dispose,travel,portals,spawnGuest,choose:selectChoice,get locked(){return event.blocked},get event(){return {...event.state}},get riftMesh(){return guestRift},get guest(){return guest},get mission(){return mission},get boss(){return bossState?{...bossState}:null},get eventTimer(){return {...event.state,remaining:event.state.remaining}}};
}
