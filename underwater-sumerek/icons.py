pal={'o':'#2b1608','w':'#ffffff','s':'#cfdcee','y':'#ffd23f','b':'#8a4b1e','g':'#e9a21b','r':'#c92f2f','k':'#9aa8c0'}
def svg(rows):
    assert len(rows)==16 and all(len(r)==16 for r in rows),[len(r) for r in rows]
    out=['<svg viewBox="0 0 16 16" width="48" height="48" shape-rendering="crispEdges" aria-hidden="true">']
    for y,r in enumerate(rows):
        x=0
        while x<16:
            c=r[x]
            if c=='.': x+=1; continue
            e=x
            while e<16 and r[e]==c: e+=1
            out.append(f'<rect x="{x}" y="{y}" width="{e-x}" height="1" fill="{pal[c]}"/>'); x=e
    out.append('</svg>'); return ''.join(out)
jump=[
"................",
".......oo.......",
"......owwo......",
".....owwwwo.....",
"....owwwwwwo....",
"...owwwwwwwso...",
"..owwwwwwwwsso..",
".oooowwwwsooooo.",
"....owwwwso.....",
"....owwwwso.....",
"....owwwwso.....",
"....oooooooo....",
"...w..w..w..w...",
"................",
"..w...w...w..w..",
"................"]
# sword from grid via raster
G=[['.']*16 for _ in range(16)]
def put(x,y,c):
    if 0<=x<16 and 0<=y<16: G[y][x]=c
S={}
for t in range(3,12):
    S[(2+t,13-t)]='w'; S[(3+t,13-t)]='k'
for t in range(0,2):
    S[(2+t,13-t)]='b'; S[(3+t,13-t)]='b'
for d in (-2,-1,0,1,2):
    S[(4+d+1,11+d)]='g'; S[(4+d,11+d)]='g'
S[(14,1)]='w'
S[(1,14)]='g';S[(2,14)]='g';S[(1,15)]='g'
for (x,y),c in S.items(): put(x,y,c)
for (x,y) in list(S):
    for dx in(-1,0,1):
        for dy in(-1,0,1):
            X,Y=x+dx,y+dy
            if 0<=X<16 and 0<=Y<16 and (X,Y) not in S and G[Y][X]=='.': G[Y][X]='o'
sword=[''.join(r) for r in G]
open('ico_jump.svg','w').write(svg(jump));open('ico_atk.svg','w').write(svg(sword))
print('\n'.join(sword))
