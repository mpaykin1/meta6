s=open('index.html').read()
j=open('ico_jump.svg').read();a=open('ico_atk.svg').read()
o1='<button class="tbtn atk" id="btnAtk" aria-label="Удар">УДАР</button>'
o2='<button class="tbtn jump" id="btnJump" aria-label="Прыжок">ПРЫЖОК</button>'
assert o1 in s and o2 in s
s=s.replace(o1,'<button class="tbtn atk" id="btnAtk" aria-label="Удар">'+a+'</button>').replace(o2,'<button class="tbtn jump" id="btnJump" aria-label="Прыжок">'+j+'</button>')
s=s.replace(".atk:active {",".tbtn svg { display: block; margin: auto; width: 56%; height: 56%; image-rendering: pixelated; pointer-events: none; filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)); }\n.atk:active {",1)
open('index.html','w').write(s)
