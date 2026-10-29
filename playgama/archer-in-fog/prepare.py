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
(root/'index.html').write_text(s,encoding='utf-8')
print('Generated Playgama index.html',len(s),'bytes of text')
