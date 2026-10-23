#!/usr/bin/env python3
"""Deterministic ABYSS Gothic parallax asset generator, stdlib only.

Builds original vector geometry as standalone transparent SVG layers.
Does not modify original game or copy reference images.
"""
from pathlib import Path
import argparse
import json
import hashlib

W, H = 390, 844
ORANGE = '#ff7918'
DARK = '#06131b'


def svg(content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{content}</svg>\n'


def arch(x, y, w, h, color, glow=False):
    d = f'M{x} {y+h} V{y+w*.45} Q{x+w*.5} {y-w*.5} {x+w} {y+w*.45} V{y+h} Z'
    return f'<path d="{d}" fill="{color}"/>' + (f'<path d="{d}" fill="none" stroke="{ORANGE}" stroke-width="1.5" opacity=".6"/>' if glow else '')


def cathedral():
    parts = ['<g fill="#071018" stroke="#102936" stroke-width="1">']
    for i, x in enumerate([18, 93, 186, 266, 337]):
        h = [205, 310, 420, 280, 240][i]
        y = H-h-105
        parts.append(f'<path d="M{x-24} {H} V{y+64} L{x-16} {y+64} V{y+27} L{x} {y-48} L{x+16} {y+27} V{y+64} H{x+24} V{H}Z"/>')
        for j in range(3):
            yy = y+92+j*48
            parts.append(f'<path d="M{x-7} {yy+24} V{yy+8} Q{x} {yy-7} {x+7} {yy+8} V{yy+24}Z" fill="{ORANGE}" opacity="{.38+j*.14}"/>')
    parts.append('</g>')
    return svg(''.join(parts))


def viaduct():
    parts = ['<g fill="#030b12">']
    for y, step in [(420,120),(630,90)]:
        parts.append(f'<rect x="-20" y="{y}" width="440" height="20"/>')
        for x in range(-40,450,step):
            parts.append(arch(x,y+12,step-8,205,DARK,True))
    parts.append('</g>')
    return svg(''.join(parts))


def shipwreck():
    parts = ['<g fill="#02080d" stroke="#f66b15" stroke-width="1.6" stroke-opacity=".55">',
             '<path d="M32 694 Q195 784 369 687 L332 754 Q192 826 61 747 Z"/>',
             '<path d="M186 705 L186 423 M186 480 L304 675 M186 535 L80 672"/>',
             '<path d="M180 493 L298 654 L190 630 Z" fill="#091b22" stroke-opacity=".28"/>',
             '<path d="M179 560 L79 670 L171 645 Z" fill="#091b22" stroke-opacity=".28"/>',
             '</g>']
    return svg(''.join(parts))


def jaw():
    teeth = []
    for upper in (True,False):
        for i in range(9):
            x = 75+i*29
            base = 225 if upper else 560
            tip = base+(75+(i%3)*13)*(1 if upper else -1)
            teeth.append(f'<path d="M{x-8} {base} Q{x} {base+(14 if upper else -14)} {x} {tip} Q{x+4} {base+(12 if upper else -12)} {x+9} {base}Z" fill="#0a0909" stroke="{ORANGE}" stroke-width="3"/>')
    top = '<path d="M42 230 Q190 65 355 230" fill="none" stroke="#ff8019" stroke-width="8"/>'
    bottom = '<path d="M42 560 Q190 680 355 560" fill="none" stroke="#ff8019" stroke-width="8"/>'
    eye = '<circle cx="304" cy="155" r="8" fill="#ffb23c"/>'
    return svg('<g>'+top+bottom+''.join(teeth)+eye+'</g>')


def fish():
    return svg('<g transform="translate(160 390)" fill="#070e11" stroke="#ff8119" stroke-width="4">'
               '<path d="M-40 0 L-82 -25 L-73 0 L-82 25 Z"/>'
               '<path d="M-48 0 Q-13 -42 35 -24 Q70 0 35 24 Q-13 42 -48 0Z"/>'
               '<path d="M-8 -28 L4 -48 L20 -26 M-9 29 L4 49 L19 26" fill="none"/>'
               '<circle cx="34" cy="-6" r="4" fill="#ffbc57" stroke="none"/></g>')


LAYERS = {
    'gothic_far_cathedral.svg': (cathedral, 0.12),
    'gothic_mid_viaduct.svg': (viaduct, 0.42),
    'gothic_near_shipwreck.svg': (shipwreck, 0.78),
    'jaw_threat.svg': (jaw, 1.0),
    'hero_fish.svg': (fish, 1.0),
}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--out', type=Path, default=Path('abyss-glow/generated/gothic'))
    args=ap.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    manifest={'status':'generated_preview_not_integrated','viewport':[W,H],'assets':[]}
    for name,(builder,parallax) in LAYERS.items():
        data=builder().encode('utf-8')
        assert data.startswith(b'<svg') and data.count(b'</svg>')==1
        (args.out/name).write_bytes(data)
        manifest['assets'].append({'name':name,'sha256':hashlib.sha256(data).hexdigest(),'parallax':parallax})
    (args.out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))


if __name__=='__main__':
    main()
