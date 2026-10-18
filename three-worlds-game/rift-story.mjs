import {DialogueGenerator} from './dialogue.mjs';
import {createAshFactory} from './ash-assets.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {clamp} from './world-core.mjs';
export function guestLine(home,current,state){
 const need=home==='water'&&current!=='water'?'Мне нужна вода. Проводи меня к берегу.':home==='ash'&&current==='water'?'Я замерзаю. Выведи меня к огню.':'Пепел закрыл дорогу домой. Помоги добраться до разлома.';
 return state==='friend'?'Ты не бросил меня. Я прикрою тебя.':state==='hostile'?'Ты видел, что мне нужна помощь. Теперь я защищаюсь.':state==='home'?'Дорога открыта. Это оружие теперь твоё.':need;
}
export function createRiftStory({THREE,scene,renderer,camera,player,height,seed,toast,prepare,onTransition,attacking,onAttack,reward}){
 let snapshot={};try{snapshot=JSON.parse(localStorage.getItem('three-worlds-dialogue')||'{}')}catch{}
 const dialogue=new DialogueGenerator(snapshot);
 function line(g,state){const text=dialogue.next({home:g.home,world:player.pos.y<3.6?'water':player.pos.x<-64?'ash':'island',state,night:clock%120>60});try{localStorage.setItem('three-worlds-dialogue',JSON.stringify(dialogue.serialize()))}catch{}return text}
 const portals=[{x:-22,z:32,to:{x:-82,z:32}},{x:-126,z:32,to:{x:100,z:34}},{x:102,z:40,to:{x:46,z:32}}],meshes=[];
 let clock=0,cooldown=0,guest=null,factory=null,sheet=null,triggered=false;
 const geometry=new THREE.PlaneGeometry(3.5,5);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float ring=exp(-abs(r-.72)*23.);float arc=.65+.35*sin(atan(p.y,p.x)*7.+time*2.);float fog=exp(-r*r*6.)*.12;gl_FragColor=vec4(vec3(.38,.24,1.)*(ring*arc+fog)*2.,clamp(ring+fog,0.,.8));}'});
 for(const p of portals){const m=new THREE.Mesh(geometry,material);m.position.set(p.x,height(p.x,p.z)+2.4,p.z);scene.add(m);meshes.push(m)}
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
 function spawnGuest(){if(guest)return;if(!sheet)bake();const x=player.pos.x+5,z=player.pos.z+2;
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:true,side:THREE.DoubleSide,uniforms:{map:{value:sheet.texture},frame:{value:0},dir:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D map;uniform float frame,dir;varying vec2 vUv;void main(){vec4 c=texture2D(map,(vUv+vec2(dir,frame))/8.);if(c.a<.4)discard;gl_FragColor=c;}'});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,3.2),mat);m.position.set(x,height(x,z)+5,z);scene.add(m);
  guest={mesh:m,brain:createBrain('original-scavenger',{x,z},seed),home:'ash',landed:false,fall:0,help:0,age:0,talk:-99,damageClock:0,rewarded:false};
  toast(line(guest,'neutral'),4200);
 }
 function travel(p){prepare(p.to.x,p.to.z);player.pos.set(p.to.x,height(p.to.x,p.to.z)+.3,p.to.z);player.vel.set(0,0,0);cooldown=6;onTransition();}
 function update(dt){clock+=dt;cooldown=Math.max(0,cooldown-dt);material.uniforms.time.value=clock;
  for(let i=0;i<portals.length;i++){const p=portals[i],m=meshes[i];m.lookAt(camera.position.x,m.position.y,camera.position.z);if(cooldown===0&&Math.hypot(player.pos.x-p.x,player.pos.z-p.z)<1.5&&Math.abs(player.pos.y-height(p.x,p.z))<3)travel(p)}
  if(!triggered&&clock>38){triggered=true;spawnGuest()}
  if(!guest)return;const g=guest,p=g.mesh.position;g.age+=dt;g.damageClock=Math.max(0,g.damageClock-dt);
  const floor=height(p.x,p.z),distance=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);
  if(!g.landed){g.fall+=dt*9;p.y-=g.fall*dt;if(p.y<=floor+1.6){p.y=floor+1.6;g.landed=true;onTransition(.1)}}
  else{
   const attack=attacking();if(attack&&distance<3&&g.damageClock===0){g.brain.hp-=12;g.brain.relation='hostile';g.damageClock=.7;toast(line(g,'hostile'),2600)}
   if(g.brain.hp<=0){scene.remove(g.mesh);g.mesh.geometry.dispose();g.mesh.material.dispose();guest=null;return}
   if(g.brain.relation==='neutral'&&distance<2.6&&!attack){g.help+=dt;if(g.help>2){g.brain.relation='friend';toast(line(g,'friend'),2800)}}
   if(g.brain.relation==='neutral'&&g.age>25&&distance>13)g.brain.relation='hostile';
   stepBrain(g.brain,p,dt,{player:player.pos,height:(x,z)=>height(x,z)+1.6,sea:3.8});
   if(g.brain.relation==='hostile'&&distance<2&&g.damageClock===0){onAttack();g.damageClock=2}
   if(g.brain.relation==='friend'&&player.pos.x<-64&&!g.rewarded){g.rewarded=true;reward();toast(guestLine('ash','ash','home'),3200)}
   if(g.rewarded){g.brain.relation='neutral';g.brain.state='wander';g.brain.target={x:-126,z:32};g.brain.clock=5;if(Math.hypot(p.x+126,p.z-32)<2){scene.remove(g.mesh);g.mesh.geometry.dispose();g.mesh.material.dispose();guest=null;return}}
  }
  g.mesh.rotation.y=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  g.mesh.material.uniforms.frame.value=Math.floor(g.brain.phase*8)%8;
  g.mesh.material.uniforms.dir.value=((Math.round(((g.brain.heading||0)-g.mesh.rotation.y)/(Math.PI/4))%8)+8)%8;
 }
 function dispose(){for(const m of meshes)scene.remove(m);geometry.dispose();material.dispose();if(guest){scene.remove(guest.mesh);guest.mesh.geometry.dispose();guest.mesh.material.dispose()}sheet?.dispose();factory?.dispose()}
 return {update,dispose,travel,portals,spawnGuest,get guest(){return guest}};
}
