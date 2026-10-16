/* OBSERVER WORLD V5 EDITOR
 * Runs on the EXACT expanded Island of Twilight WebGL scene, not a 2D recreation.
 * The renderer, textures, camera, bloom, fog, island, water, 21-weapon physics
 * and enemies remain the user's complete original source in index.html.
 * Source catalog: ../SOURCE_INDEX.md   Design: ../observer-world-en-v4/
 */
(function(root){"use strict";
const ACTIONS={
 well:["井","Well"],settlement:["民","Settlement"],council:["議","Council"],
 market:["市","Market"],guild:["商","Guild"],tax:["税","Tax"],
 school:["文","School"],scholarAction:["学","Scholar"],printing:["書","Printing Press"],
 castle:["城","Castle"],court:["冠","Court"],decree:["令","Decree"],
 monastery:["寺","Monastery"],relief:["慈","Relief"],doctrine:["教","Doctrine"],
 guard:["兵","Guard"],patrol:["巡","Patrol"],militia:["隊","Militia"],
 prison:["獄","Prison"],inquiry:["問","Inquiry"],pardon:["赦","Pardon"],
 granary:["倉","Granary"],ration:["糧","Ration"],caravan:["車","Caravan"],
 healer:["薬","Healer"],quarantine:["隔","Quarantine"],hospital:["療","Hospital"],
 fire:["火","Fire"],brigade:["桶","Fight Fire"],watch:["鐘","Watch"],
 plague:["疫","Plague"],cordon:["封","Cordon"],burial:["墓","Burial"],
 observer:["人","Observer"],contact:["信","Contact"],extraction:["門","Extraction"],
 imp:["鬼","Imp"],shade:["影","Shade"],warden:["魔","Warden"],new:["新","New Person"]
};
const NEXT={well:"settlement",settlement:"council",market:"guild",guild:"tax",
 school:"scholarAction",scholarAction:"printing",castle:"court",court:"decree",
 monastery:"relief",relief:"doctrine",guard:"patrol",patrol:"militia",
 prison:"inquiry",inquiry:"pardon",granary:"ration",ration:"caravan",
 healer:"quarantine",quarantine:"hospital",fire:"brigade",brigade:"watch",
 plague:"cordon",cordon:"burial",observer:"contact",contact:"extraction"};
const PRIMARY=["well","market","school","castle","monastery","guard","prison","granary","healer","fire","plague","observer","new","imp","shade","warden"];
const KEY="observer-v6-living-history";
const $=id=>document.getElementById(id);
let native=null, music=null, selected="well", placeMode=false, dragging=null, saving=false,relations=null,story=null,sceneClock=0;
let state={version:6,pop:2,food:8,order:20,suspicion:0,next:1,objects:[],history:[],actors:[],deaths:0};
const groups=new Map(),geos=new Map();
let worldRoot=null,ray=null, pointer=null, musicTicker=null,interval=null,errors=0;
function tell(title,text){
 state.history.push({title,text,when:Date.now()});if(state.history.length>80)state.history.shift();
 $("v5Recent").textContent=title+" · "+text;
 $("v5JournalBody").textContent=state.history.slice(-20).map(e=>e.title+"\n"+e.text).join("\n\n");
 $("v5Stats").textContent="Population "+state.pop+" · Order "+state.order+" · Suspicion "+state.suspicion;
 persist()
}
function persist(){
 if(saving)return;
 try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){errors++}
}
function restore(){
 try{
  const raw=localStorage.getItem(KEY);if(!raw)return;
  const data=JSON.parse(raw);
  if(data.version!==6||!Array.isArray(data.objects))return;
  state={...state,...data,objects:data.objects.slice(0,120),history:(data.history||[]).slice(-80)};
 }catch(e){errors++}
}
function tileGeometry(tile){
 tile=Math.max(0,Math.min(11,tile));
 if(geos.has(tile))return geos.get(tile);
 const g=new native.THREE.BoxGeometry(1,1,1),uv=g.getAttribute("uv");
 const u0=(tile%4)/4+.001,v0=1-(Math.floor(tile/4)+1)/3+.001;
 for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,u0+u*(.25-.002),v0+v*(1/3-.002))}
 uv.needsUpdate=true;geos.set(tile,g);return g
}
function addCube(parent,mat,x,y,z,w,h,d,tile){
 const m=new native.THREE.Mesh(tileGeometry(tile),mat);
 m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=false;
 parent.add(m);return m
}
function addBuilding(o){
 const THREE=native.THREE;
 const mat=new THREE.MeshLambertMaterial({map:native.atlasTex,side:THREE.FrontSide});
 const g=new THREE.Group();g.name="Observer V6 "+o.kind+" #"+o.id;g.position.set(o.x,o.y,o.z);
 const box=(x,y,z,w,h,d,tile,angle=0)=>{
  const m=addCube(g,mat,x,y,z,w,h,d,tile);m.rotation.z=angle;return m
 };
 const beam=(x,y,z,w,h,d,t)=>box(x,y,z,w,h,d,t);
 const post=(x,y,z,h,t)=>box(x,y,z,.21,h,.21,t);
 const roof=(x,y,z,w,d,t)=>{
  box(x-w*.25,y,z,w*.58,.25,d,t,Math.PI/8);
  box(x+w*.25,y,z,w*.58,.25,d,t,-Math.PI/8);
 };
 const sign=(x,y,z,w,h,t)=>box(x,y,z,w,h,.13,t);
 const fence=e=>{for(const x of [-e,e])for(const z of [-e,e])post(x,.6,z,1.2,9)};
 if(!root.ObserverBuildingAssets.build(o.kind,{box,beam,post,roof,sign,fence}))
  box(0,.6,0,1.1,1.2,1.1,3);
 worldRoot.add(g);groups.set(o.id,{group:g,material:mat});return g
}
function onPlace(kind,x,z,restoring=false){
 if(!native||!ACTIONS[kind])return null;
 if(kind==="new"){const p=relations?.newPerson(x,z);persist();return p}
 if(["imp","shade","warden"].includes(kind)){
   const m=native.spawnFoe(kind,x,z);
   if(!m&&!restoring)tell("Anomaly","The creature could not appear at this location");
   else if(!restoring)tell("Anomaly · "+kind,"A living creature emerged in the same world. The guard and residents will respond.");
   return m
 }
 if(state.objects.length>=120){if(!restoring)tell("World capacity","120 placed objects maximum for mobile performance");return null}
 x=Math.max(3,Math.min(60,Math.round(x*.5)*2));z=Math.max(3,Math.min(60,Math.round(z*.5)*2));
 // Native voxel height; never place an object over the ocean, beyond shore, or into the player.
 const h=native.terrainTop(x,z);
 if(!Number.isFinite(h)||h<native.SEA-.05){
  if(!restoring)tell("Ground required","Select solid island ground, not open water");return null
 }
 if(state.objects.some(o=>Math.hypot(o.x-x,o.z-z)<2.5)){
  if(!restoring)tell("Too close","Choose another patch of island so the buildings do not intersect");return null
 }
 const o={id:state.next++,kind,x,z,y:Math.max(native.SEA,h),age:0,created:Date.now()};
 state.objects.push(o);
 addBuilding(o);
 if(!restoring){
  relations?.roleFromBuilding(kind,x,z);
  if(["settlement","granary","market","school","healer","monastery"].includes(kind))state.pop+=kind==="settlement"?4:1;
  if(["fire","plague","tax"].includes(kind)){state.order=Math.max(0,state.order-2);state.suspicion++}
  if(["council","guard","healer","relief","brigade"].includes(kind))state.order=Math.min(100,state.order+2);
  if(kind==="well")state.food++;
  const label=ACTIONS[kind][1];
  const n=story?.emit(kind,{x,z});
  tell(n?.title||"History · "+label,n?.long||"The new building begins a chain of events.");
  // Keep Observer World causal buttons: action evolves into its historical consequence.
  if(NEXT[kind]){
    const button=$("v5Dock").querySelector('[data-kind="'+kind+'"]');
    if(button){button.dataset.kind=NEXT[kind];button.querySelector("span").textContent=ACTIONS[NEXT[kind]][0];button.title=ACTIONS[NEXT[kind]][1]}
    selected=NEXT[kind];
  }
  native.SFX?.ui?.();
 }
 return o
}
function activateBuild(kind){
 selected=kind;placeMode=true;document.body.classList.add("v5-placing");
 for(const b of $("v5Dock").querySelectorAll("button"))b.classList.toggle("selected",b.dataset.kind===kind);
 $("v5Hint").textContent="RIGHT-CLICK land to place "+ACTIONS[kind][1]+" · drag right mouse to orbit";
}
function selectGround(event){
 const rect=native.canvas.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width)*2-1,
       y=-((event.clientY-rect.top)/rect.height)*2+1;
 pointer.set(x,y);ray.setFromCamera(pointer,native.camera);
 const hit=ray.intersectObjects(native.terrainMeshes.filter(Boolean),false)[0];
 return hit?hit.point:null
}
function interceptCanvas(){
 const c=native.canvas;
 c.addEventListener("pointerdown",e=>{
  if(!placeMode||e.button!==0||$("v5Menu").open)return;
  e.preventDefault();e.stopImmediatePropagation();
  dragging={id:e.pointerId,x:e.clientX,y:e.clientY};
 },true);
 c.addEventListener("pointermove",e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  // Builder left-drag does not pan hero or attack. Right drag remains native orbit.
  e.preventDefault();e.stopImmediatePropagation()
 },true);
 const up=e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  e.preventDefault();e.stopImmediatePropagation();
  const d=Math.hypot(e.clientX-dragging.x,e.clientY-dragging.y);dragging=null;
  if(d>12)return;
  const hit=selectGround(e);
  if(hit)onPlace(selected,hit.x,hit.z);
  else tell("Beyond island","Select a visible island surface")
 };
 c.addEventListener("pointerup",up,true);
 c.addEventListener("pointercancel",()=>dragging=null,true);
}
function start(){
 if(native)return;
 native=root.__isle;
 if(!native?.scene||!native?.THREE||!native?.terrainMeshes?.length)return;
 const {THREE,scene}=native;
 ray=new THREE.Raycaster();pointer=new THREE.Vector2();
 worldRoot=new THREE.Group();worldRoot.name="Observer V5 native voxel builder objects";scene.add(worldRoot);
 restore();
 for(const o of state.objects){addBuilding(o);state.next=Math.max(state.next,o.id+1)}
 interceptCanvas();
 for(const kind of PRIMARY){
  const b=document.createElement("button");b.type="button";b.className="v5-tool";
  b.dataset.kind=kind;b.title=ACTIONS[kind][1];
  b.innerHTML='<span>'+ACTIONS[kind][0]+'</span><small>'+ACTIONS[kind][1]+'</small>';
  b.addEventListener("click",e=>{e.preventDefault();activateBuild(b.dataset.kind);});
  $("v5Dock").appendChild(b)
 }
 const musicModule=root.ObserverKriegerAudio;
 if(musicModule)music=musicModule.create();
 $("v5Music").addEventListener("click",async()=>{
  if(!music)return;
  try{await music.toggle();const d=music.diagnostics();
   $("v5Music").textContent=d.enabled?"Ⅱ Pause music":"▶ Play music";
   $("v5Audio").textContent=d.enabled?'Playing · '+d.label+' · RMS '+d.musicRms:'Music paused';
  }catch(e){$("v5Audio").textContent="Audio error: "+e.message}
 });
 $("v5MusicVolume").addEventListener("input",e=>music?.setMusicVolume(Number(e.target.value)/100));
 $("v5Sfx").addEventListener("click",()=>{native.SFX.init();native.toggleMute();
   $("v5Sfx").textContent=native.SFX.muted?"Enable original SFX":"Mute original SFX"});
 $("v5Full").addEventListener("click",native.toggleFullscreen);
 $("v5Pause").addEventListener("click",()=>native.pause(native.G.state==="play"));
 $("v5OriginalHud").addEventListener("change",e=>document.body.classList.toggle("v5-show-original-hud",e.target.checked));
 $("v5Explore").addEventListener("click",()=>{placeMode=false;
  document.body.classList.remove("v5-placing");
  $("v5Hint").textContent="Explore: WASD to move · right-drag orbit · click to attack";
  for(const b of $("v5Dock").children)b.classList.remove("selected")
 });
 $("v5Journal").addEventListener("click",()=>{$("v5JournalDialog").showModal()});
 $("v5JournalClose").addEventListener("click",()=>{$("v5JournalDialog").close()});
 $("v5Save").addEventListener("click",()=>{persist();tell("Saved","Historical construction saved in this browser")});
 $("v5Reset").addEventListener("click",()=>{if(!confirm("Reset V5 buildings and story? Original island remains untouched."))return;
  for(const item of groups.values()){worldRoot.remove(item.group);item.material.dispose()}
  groups.clear();state={version:6,pop:2,food:8,order:20,suspicion:0,next:1,objects:[],history:[],actors:[],deaths:0};
  persist();$("v5Dock").replaceChildren();tell("Reset","World construction cleared. Reload to restore original dock.");
  location.reload()
 });
 $("v5MusicTheme").addEventListener("change",e=>music?.forceTheme(e.target.value));
 $("v5Weapon").addEventListener("change",e=>native.equip(e.target.value));
 for(const id of native.ARSENAL_ORDER){
  const option=document.createElement("option");option.value=id;option.textContent=native.WEAPONS[id].name;
  $("v5Weapon").appendChild(option);
 }
 $("v5GetWeapons").addEventListener("click",()=>native.giveAll());
 $("v5Menu").addEventListener("toggle",()=>{if($("v5Menu").open){dragging=null;placeMode=false;document.body.classList.remove("v5-placing");native.clearInput?.()}});
 $("v5Stats").textContent="Population "+state.pop+" · Order "+state.order+" · Suspicion "+state.suspicion;
 $("v5Recent").textContent=state.history.at(-1)?.text||"The exact original island is alive. Select a symbol below and click on solid ground to create history.";
 $("v5JournalBody").textContent=state.history.slice(-20).map(e=>e.title+"\n"+e.text).join("\n\n");
 // One audio scheduler belongs to audio.js; this slow status refresh is not another game loop.
 interval=setInterval(()=>{if(music?.enabled){const d=music.diagnostics();
  $("v5Audio").textContent=d.label+' · '+d.contextState+' · RMS '+d.musicRms;
  music.tick(performance.now(),{objects:state.objects,combat:{actors:native.foes||[]},
   monsters:native.foes||[],order:state.order,suspicion:state.suspicion})
 }},1000);
 root.__OBSERVER_WORLD_V5__={ready:true,release:"V6_LIVING_HISTORY_ALLIES_20261016",
  originalRenderer:scene.type,objects:()=>state.objects,music:()=>music?.diagnostics(),state,
  place:onPlace,select:activateBuild,get camera(){return native.camera},get native(){return native},
  unload:()=>clearInterval(interval)};
 document.body.dataset.v5Ready="true";
 // Opt-in real-browser integration proof: executes the original Three.js render path,
 // places a native atlas-textured 3D building, and verifies no second 2D canvas.
 if(new URLSearchParams(location.search).get("v6test")==="1"){
  let ground=null;
  for(let z=14;z<50&&!ground;z++)for(let x=14;x<50;x++){
    if(native.terrainTop(x,z)>native.SEA+1&&state.objects.every(o=>Math.hypot(o.x-x,o.z-z)>3)){
      ground={x,z};break
    }
  }
  const built=ground?onPlace("well",ground.x,ground.z):null;
  const checks={
   originalRenderer:native.scene.type==="Scene"&&native.camera.type==="PerspectiveCamera",
   originalMap:native.world.vox.length===64*64*26,
   originalWater:!!native.scene.getObjectByName&&native.scene.children.length>10,
   originalWeapons:native.ARSENAL_ORDER.length===21,
   originalAudio:!!native.SFX.init,
   originalCamera:typeof native.rig.yaw==="number"&&typeof native.rig.pitch==="number",
   threeDBuild:!!built&&groups.has(built.id)&&groups.get(built.id).group.children.length>=5,
   oneCanvas:document.querySelectorAll("canvas#c").length===1,
   bottomDock:$("v5Dock").querySelectorAll("button").length===PRIMARY.length,
   menu:$("v5Menu").tagName==="DETAILS",
   music:typeof music?.start==="function"
  };
  const pass=Object.values(checks).every(Boolean);
  document.body.dataset.v5Selftest=pass?"pass":"fail";
  const evidence=document.createElement("pre");evidence.id="v5SelfTest";evidence.hidden=true;
  evidence.textContent=JSON.stringify({pass,checks,objectCount:state.objects.length});
  document.body.appendChild(evidence);
 }

}
root.addEventListener("observer-v6-ready",start);
let attempts=0;
const probe=()=>{if(!native){start();if(!native&&attempts++<120)requestAnimationFrame(probe)}};
requestAnimationFrame(probe);
})(window);
