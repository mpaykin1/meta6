from pathlib import Path
import re, shutil
root=Path(__file__).parent
s=(root/'source.html').read_text(encoding='utf-8')
# Resolve all runtime Three.js modules at build time, not at game runtime.
s=re.sub(r'<script type="importmap">.*?</script>', '', s, count=1, flags=re.S)
s=re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">', '', s)
s=re.sub(r'<link href="https://fonts.googleapis.com/css2\\?family=Russo\\+One&display=swap" rel="stylesheet">', '', s)
public=root/'public'
public.mkdir(exist_ok=True)
for kind in ('latin','cyrillic'):
    source=root/'node_modules'/'@fontsource'/'russo-one'/'files'/f'russo-one-{kind}-400-normal.woff2'
    if source.exists(): shutil.copyfile(source, public/f'russo-{kind}.woff2')
fontcss='''<style>@font-face{font-family:'Russo One';font-style:normal;font-weight:400;src:url('/russo-latin.woff2') format('woff2');font-display:swap}
@font-face{font-family:'Russo One';font-style:normal;font-weight:400;src:url('/russo-cyrillic.woff2') format('woff2');font-display:swap}</style>'''
s=s.replace('</head>',fontcss+'</head>',1)
s=s.replace('<title>Лучник в тумане</title>','<title>Archer in the Fog</title>',1)
s=s.replace('<script type="module">','<script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>\n<script type="module">',1)
# Playgama Bridge lifecycle and cloud-save initialization.
pg_init = """
const PG={ready:false,paused:false,audio:true,language:'en'};
let pgSaved=null;
try {
  await window.bridge.initialize();
  PG.ready=true;
  PG.language=(window.bridge.platform.language||'en').slice(0,2).toLowerCase();
  PG.audio=window.bridge.platform.isAudioEnabled!==false;
  const values=await window.bridge.storage.get(['luchnik_save']);
  pgSaved=values&&values[0]?JSON.parse(values[0]):null;
  window.bridge.platform.on(window.bridge.EVENT_NAME.PAUSE_STATE_CHANGED, state=>{
    PG.paused=!!state;
    if(typeof AU!=='undefined' && AU.ctx){if(PG.paused) AU.ctx.suspend();else if(PG.audio && !document.hidden) AU.ctx.resume();}
  });
  window.bridge.platform.on(window.bridge.EVENT_NAME.AUDIO_STATE_CHANGED, enabled=>{
    PG.audio=!!enabled;
    if(typeof AU!=='undefined' && AU.ctx){if(!PG.audio) AU.ctx.suspend();else if(!PG.paused && !document.hidden) AU.ctx.resume();}
  });
} catch(err) { console.warn('Bridge initialization:',err); }
document.addEventListener('visibilitychange',()=>{
  if(typeof AU!=='undefined' && AU.ctx){
    if(document.hidden) AU.ctx.suspend();
    else if(PG.audio && !PG.paused) AU.ctx.resume();
  }
});
function pgInterstitial(){
  if(PG.ready && window.bridge.advertisement.isInterstitialSupported)
    Promise.resolve(window.bridge.advertisement.showInterstitial('game_over')).catch(()=>{});
}
"""
s=s.replace("import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';", "import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';\n"+pg_init,1)
s=s.replace("try{Object.assign(SAVE,JSON.parse(localStorage.getItem('luchnik_save')||'{}'))}catch(e){}",
"""if(pgSaved && typeof pgSaved==='object'){Object.assign(SAVE,pgSaved);}
if(!Array.isArray(SAVE.owned)) SAVE.owned=['bow'];
if(typeof SAVE.coins!=='number') SAVE.coins=0;""",1)
s=s.replace("function save(){try{localStorage.setItem('luchnik_save',JSON.stringify(SAVE))}catch(e){}}",
"""function save(){if(PG.ready)window.bridge.storage.set(['luchnik_save'],[JSON.stringify(SAVE)]).catch(()=>{});}""",1)
s=s.replace("function gameOver(){G.phase='over';","function gameOver(){pgInterstitial();G.phase='over';",1)
s=s.replace("const dt=(G.paused?0:rdt)*G.slow;","const dt=(G.paused||PG.paused?0:rdt)*G.slow;",1)
s=s.replace("frame();\n\n</script>","frame();\nif(PG.ready) requestAnimationFrame(()=>window.bridge.platform.sendMessage('game_ready'));\n\n</script>",1)
# Make English the default interface; Russian remains available via the language toggle.
english={
 'ЛУЧНИК<br>В ТУМАНЕ':'ARCHER<br>IN THE FOG',
 'Попади в дракона, пока он не рассвирепел. Не успеешь — он разнесёт башню, и ты рухнешь на следующую.':'Hit the dragon before it gets angry. Otherwise it destroys your tower, and you fall to the next.',
 '>ИГРАТЬ<':'>PLAY<','>АССЕТЫ<':'>GALLERY<','>ОРУЖИЕ<':'>WEAPONS<','>В БОЙ<':'>FIGHT<',
 '>ДРАКОН<':'>DRAGON<','ДРАКОН<br>ПОБЕДИЛ':'THE DRAGON<br>WON','>СНОВА<':'>RETRY<',
 '>МЕНЮ<':'>MENU<','← МЕНЮ':'← MENU','>ЯРОСТЬ<':'>RAGE<','ЯРУС 1':'TIER 1',
 'Нажми или держи палец — лучник стреляет туда':'Tap or hold to fire arrows',
 'ЯРУС ':'TIER ','ДРАКОН ОТСТУПИЛ':'DRAGON RETREATS','УРОВЕНЬ ':'LEVEL ',
 'Уровень ':'Level ','Ярус ':'Tier ','уровень ':'level ','монет ':'coins ',
 'рекорд: ярус ':'best tier: ','В РУКАХ':'EQUIPPED','ВЗЯТЬ':'EQUIP',
 'Охотничий лук':'Hunting Bow','Двойной лук':'Twin Bow','Арбалет':'Crossbow','Огненный лук':'Fire Bow','Буря стрел':'Arrow Storm',
 'Одна стрела, надёжный.':'A single reliable arrow.','Две стрелы за выстрел.':'Two arrows per shot.',
 'Очень быстрые болты, частая стрельба.':'Fast bolts and rapid fire.',
 'Двойной урон. Взрыв сбивает соседние шары.':'Double damage. Blast nearby fireballs.',
 'Веер из трёх стрел.':'Three arrows in a spread.',
 'ОТБЕЙ АТАКУ: ':'REPEL THE ATTACK: ',
}
for ru,en in english.items():s=s.replace(ru,en)
# A recognizable button makes localization switch accessible.
s=s.replace('<button class="btn" id="bPlay">', '<button id="lang" class="btn" style="min-width:100px;padding:6px 14px;font-size:13px">EN / РУ</button>\n  <button class="btn" id="bPlay">',1)
lang_js = """
const ruDict={
 'ARCHER<br>IN THE FOG':'ЛУЧНИК<br>В ТУМАНЕ',
 'Hit the dragon before it gets angry. Otherwise it destroys your tower, and you fall to the next.':'Попади в дракона, пока он не рассвирепел. Не успеешь — он разнесёт башню, и ты рухнешь на следующую.',
 'PLAY':'ИГРАТЬ','GALLERY':'АССЕТЫ','WEAPONS':'ОРУЖИЕ','FIGHT':'В БОЙ','RETRY':'СНОВА',
 'RAGE':'ЯРОСТЬ','DRAGON':'ДРАКОН','THE DRAGON<br>WON':'ДРАКОН<br>ПОБЕДИЛ','MENU':'МЕНЮ',
 'Tap or hold to fire arrows':'Нажми или держи палец — лучник стреляет туда'
};
const localeEls=['#menu h1','#menu p','#bPlay','#bGal','#over h1','#bRetry','#bOvMenu','#bShop','#shClose','#bottom .lbl','#top .lbl','#hint'];
const origLocale=new Map(localeEls.map(sel=>[sel,document.querySelector(sel)?.innerHTML]));
function setLang(lang){
 PG.language=lang;
 for(const sel of localeEls){
  const el=document.querySelector(sel),src=origLocale.get(sel);
  if(el&&src)el.innerHTML=lang==='ru'?(ruDict[src]||src):src;
 }
}
document.getElementById('lang').onclick=()=>setLang(PG.language==='ru'?'en':'ru');
setLang(PG.language==='ru'?'ru':'en');
"""
s=s.replace("const $=id=>document.getElementById(id);",lang_js+"\nconst $=id=>document.getElementById(id);",1)
# Fix order: language script needs PG after init, which happens after imports and before const $.
# Move the translation block after PG initialization (safe, evaluated after PG exists).
s=s.replace(lang_js+"\nconst $=id=>document.getElementById(id);","const $=id=>document.getElementById(id);",1)
s=s.replace(pg_init,pg_init+"\n"+lang_js,1)
s=s.replace('font-family:\'Russo One\',system-ui,sans-serif','font-family:\'Russo One\',system-ui,sans-serif')

coop = r"""
const MP={ws:null,id:null,host:null,room:null,count:0,peers:new Map(),lastState:0,
 isHost(){return !!this.id&&this.host===this.id},
 send(v){if(this.ws?.readyState===1)this.ws.send(JSON.stringify(v))},
 connect(code){
  this.room=code.toUpperCase();
  if(this.ws)this.ws.close();
  const ws=this.ws=new WebSocket('wss://archer-fog-coop.onrender.com/?room='+encodeURIComponent(this.room));
  ws.onmessage=e=>{
   let m;try{m=JSON.parse(e.data)}catch{return}
   if(m.t==='welcome'){this.id=m.id;this.host=m.host;this.count=m.count;
    this.peers=new Map(m.peers.map(id=>[id,0]));
    document.getElementById('mpLobby').style.display='none';
    if(G.mode!=='play')startGame();
   }
   if(m.t==='join'){this.peers.set(m.id,0);this.count=m.count;this.host=m.host}
   if(m.t==='leave'){this.peers.delete(m.id);this.count=m.count;this.host=m.host}
   if(m.t==='shot'){this.peers.set(m.id,performance.now());this.remoteShot(m)}
   if(m.t==='state'&&!this.isHost())this.apply(m);
   this.status();
  };
  ws.onclose=()=>{if(this.ws===ws){this.id=null;this.host=null;this.count=0;this.status()}};
  ws.onerror=()=>{this.status()};
 },
 status(){document.getElementById('mpStatus').textContent=this.id?'ROOM '+this.room+' '+this.count+'/4':'OFFLINE'},
 remoteShot(m){
  if(G.mode!=='play')return;
  const from=archer.handPos(new V3()),to=dragon.root.position.clone();
  fireArrow(from,to,{speed:65,dmg:0});
  if(!this.isHost())return;
  const dmg=Math.min(2,Math.max(1,Number(m.dmg)||1));
  if(['windup','dive','tail','spin'].includes(G.phase)){
    G.repelHits+=dmg;showRepel();if(G.repelHits>=G.repelNeed)repel()
  }else if(G.phase==='fight'||G.phase==='intro'){
    G.hits=Math.min(G.need,G.hits+dmg);renderHP();dragon.hit();
    if(G.hits>=G.need){G.phase='retreat';G.pt=0;dragon.jawOpen=1;flashScreen(.25);dropLoot(dragon.root.position.clone(),'coin',4+G.level)}
  }
 },
 apply(m){
  if(G.mode!=='play')return;
  if(Number.isInteger(m.level)&&m.level>0&&m.level!==G.level){G.level=m.level;G.depth=m.depth||1;THT=themeFor(G.level);startRound()}
  if(typeof m.need==='number')G.need=m.need;
  if(typeof m.hits==='number'){G.hits=Math.max(0,Math.min(G.need,m.hits));renderHP()}
  if(m.phase==='retreat'&&G.phase==='fight'){G.phase='retreat';G.pt=0}
 },
 update(t){if(!this.id||G.mode!=='play')return;
  if(this.isHost()&&t-this.lastState>.12){this.lastState=t;this.send({t:'state',level:G.level,depth:G.depth,hits:G.hits,need:G.need,phase:G.phase})}
 }
};
const mpCss=document.createElement('style');mpCss.textContent='#mpLobby{position:fixed;inset:0;z-index:30;background:#121b32ee;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;color:white;font-family:system-ui,sans-serif}#mpLobby input{padding:12px;background:#121b32;color:white;font-size:23px;text-align:center;width:160px}#mpLobby button{padding:12px;color:white;background:#233a55;border:1px solid #7edfff}#mpStatus{position:fixed;top:45px;left:15px;font:12px system-ui,sans-serif;z-index:4;color:#d8eeff;pointer-events:none}';
document.head.appendChild(mpCss);
const mpButton=document.createElement('button');mpButton.className='btn';mpButton.textContent='CO-OP 2–4';document.getElementById('menu').appendChild(mpButton);
const mpStatus=document.createElement('div');mpStatus.id='mpStatus';mpStatus.textContent='OFFLINE';document.body.appendChild(mpStatus);
const mpLobby=document.createElement('div');mpLobby.id='mpLobby';
mpLobby.innerHTML='<h2>CO-OP ROOM</h2><div>Share room code with friends</div><input id="mpCode" maxlength="8" placeholder="CODE"><button id="mpJoin">CREATE / JOIN</button><button id="mpBack">BACK</button>';
document.body.appendChild(mpLobby);
mpButton.onclick=()=>{mpLobby.style.display='flex';document.getElementById('mpCode').value=Math.random().toString(36).slice(2,7).toUpperCase()};
document.getElementById('mpJoin').onclick=()=>{const c=document.getElementById('mpCode').value.trim().toUpperCase();if(/^[A-Z0-9]{4,8}$/.test(c))MP.connect(c)};
document.getElementById('mpBack').onclick=()=>mpLobby.style.display='none';
const _oldTryFire=tryFire;
tryFire=function(){
 const can=G.mode==='play'&&G.fireCD<=0&&archer.fall<=0&&!G.paused&&G.phase!=='fall'&&G.phase!=='over',w=weapon();
 _oldTryFire();
 if(can&&MP.id)MP.send({t:'shot',dmg:w.dmg});
};
"""
s=s.replace("frame();\nif(PG.ready)",coop+"\nframe();\nif(PG.ready)",1)
s=s.replace("frame();\n\n</script>",coop+"\nframe();\n\n</script>",1)
s=s.replace("  G.slow=damp(G.slow,1,1.3,rdt);","  MP.update(t);G.slow=damp(G.slow,1,1.3,rdt);",1)


# Prevent client-side duplicate boss damage for remote-visual arrows.
s=s.replace("arrows.push({m,v:d,life:3.2,stuck:null,g,dmg:o.dmg||1,fire:!!o.fire,freeze:!!o.freeze});",
"""arrows.push({m,v:d,life:3.2,stuck:null,g,dmg:o.dmg||1,ghost:!!o.ghost,fire:!!o.fire,freeze:!!o.freeze});""",1)
s=s.replace("const hitO=dragon.visible?dragon.hitTest(a.m.position):null;",
"""const hitO=!a.ghost&&dragon.visible?dragon.hitTest(a.m.position):null;""",1)
s=s.replace("if(G.mode==='play'){dropLoot(p,'coin',1+",
"""if(MP.id&&!MP.isHost())return;
  if(G.mode==='play'){dropLoot(p,'coin',1+""",1)
s=s.replace("fireArrow(from,to,{speed:65,dmg:0});",
"""fireArrow(from,to,{speed:65,dmg:1,ghost:true});""",1)


# Improve co-op: shared dragon position and companions rendered in the original 3D scene.
s=s.replace("if(!f.far&&a.m.position.distanceTo(f.m.position)<","if(!a.ghost&&!f.far&&a.m.position.distanceTo(f.m.position)<",1)
s=s.replace("if(m.t==='state'&&!this.isHost())this.apply(m);","if(m.t==='state'&&!this.isHost())this.apply(m);",1)
s=s.replace("if(m.t==='welcome'){this.id=m.id;this.host=m.host;this.count=m.count;",
"""if(m.t==='welcome'){this.id=m.id;this.host=m.host;this.count=m.count;""",1)
s=s.replace("if(G.mode!=='play')startGame();\n   }\n   if(m.t==='join')",
"""if(G.mode!=='play')startGame();
    if(m.state&&!this.isHost())this.apply(m.state);
   }
   if(m.t==='join')""",1)
s=s.replace("const from=archer.handPos(new V3()),to=dragon.root.position.clone();",
"""const from=(this.avatars?.get(m.id)||archer).handPos(new V3()),to=dragon.root.position.clone();""",1)
s=s.replace("if(m.phase==='retreat'&&G.phase==='fight'){G.phase='retreat';G.pt=0}",
"""if(m.phase==='retreat'&&G.phase==='fight'){G.phase='retreat';G.pt=0}
  if(Array.isArray(m.pos)&&m.pos.length===3)this.remoteDragon=m;""",1)
s=s.replace("this.send({t:'state',level:G.level,depth:G.depth,hits:G.hits,need:G.need,phase:G.phase})",
"""this.send({t:'state',level:G.level,depth:G.depth,hits:G.hits,need:G.need,phase:G.phase,pos:dragon.root.position.toArray(),rot:dragon.root.quaternion.toArray()})""",1)
s=s.replace("const mpCss=document.createElement('style');",
"""MP.avatars=new Map();
MP.display=function(t,dt){
  if(!this.id)return;
  if(!this.isHost()&&this.remoteDragon){
    const p=this.remoteDragon;
    dragon.root.position.lerp(new V3(...p.pos),Math.min(1,dt*16));
    if(p.rot&&p.rot.length===4)dragon.root.quaternion.slerp(new THREE.Quaternion(...p.rot),Math.min(1,dt*16));
  }
  for(const [id] of this.peers){
    if(!this.avatars.has(id)){const a=new Archer(scene);a.mBow.color.set(id.charCodeAt(0)%2?0xffaa44:0x44faff);this.avatars.set(id,a)}
  }
  for(const [id,a] of this.avatars){
    if(!this.peers.has(id)){scene.remove(a.root);this.avatars.delete(id);continue}
    const peers=[...this.peers.keys()],index=peers.indexOf(id),angle=(index+1)*Math.PI*.42;
    const goal=new V3(cur.stand.x+Math.cos(angle)*1.8,cur.stand.y,cur.stand.z+Math.sin(angle)*1.8);
    a.root.position.lerp(goal,Math.min(1,dt*10));
    a.update(dt,t,dragon.root.position.clone().sub(a.root.position).normalize());
  }
};
const mpCss=document.createElement('style');""",1)
s=s.replace("if(G.mode==='play')updateGame(dt,t);",
"""if(G.mode==='play'){updateGame(dt,t);MP.display(t,dt)}""",1)


# Joining online must dismiss the single-player menu; the game starts in the original scene.
s=s.replace("if(G.mode!=='play')startGame();\n    if(m.state", """if(G.mode!=='play')startGame();
    document.getElementById('menu').classList.add('hide');
    if(m.state""",1)

(root/'index.html').write_text(s,encoding='utf-8')
print('Generated Playgama index.html',len(s),'bytes of text')
