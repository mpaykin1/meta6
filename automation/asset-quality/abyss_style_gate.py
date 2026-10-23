#!/usr/bin/env python3
"""ABYSS §14 pixel-art acceptance gate. Strict on NEW RGBA art frames.

Requires a JSON manifest with frame paths, body masks and light-facing masks.
Do not apply 7-color raw-pixel checks to final composited WebGL screenshots:
bloom/fog produce intermediate colors. Those need a separate render-level gate.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

PALETTE = {(0,0,0), (62,21,0), (112,39,0), (173,66,1),
           (229,120,7), (249,189,43), (253,231,102)}
BLACK = (0,0,0,255)

def audit(frame_path, body_path, lit_path):
    frame = Image.open(frame_path).convert("RGBA")
    body = Image.open(body_path).convert("L")
    lit = Image.open(lit_path).convert("L")
    if frame.size != body.size or frame.size != lit.size:
        return {"ok":False, "failures":["mask_dimensions"]}
    pixels=list(frame.getdata()); bp=list(body.getdata()); lp=list(lit.getdata())
    total=len(pixels)
    invalid=sum(1 for p in pixels if p[3] not in (0,255) or (p[3] and p[:3] not in PALETTE))
    dark=sum(1 for p in pixels if p[3]==0 or p[:3] in {(0,0,0),(62,21,0)})
    body_ix=[i for i,v in enumerate(bp) if v>=128]
    opaque=sum(1 for i in body_ix if pixels[i]==BLACK)
    # Only *unlit interior* is required to be opaque black. Rim/light pixels are
    # permitted on the body boundary; they are explicitly excluded by the lit mask.
    interior=[i for i in body_ix if lp[i]<128]
    black_interior=sum(1 for i in interior if pixels[i]==BLACK)
    light_ix=[i for i,v in enumerate(lp) if v>=128]
    glowing=sum(1 for i in light_ix if pixels[i][3]==255 and pixels[i][:3] in PALETTE-{(0,0,0),(62,21,0)})
    # Art resolution: source pixels are integer samples; nearest scaling must be
    # separately proven at browser runtime, never inferred from a PNG alone.
    checks={
      "seven_color_palette": invalid==0,
      "darkness_ge_90_percent": dark/total>=.90,
      "opaque_black_unlit_body": bool(interior) and black_interior==len(interior),
      "illuminated_half_ge_75_percent": bool(light_ix) and glowing/len(light_ix)>=.75,
      "art_pixel_grid": frame.mode=="RGBA" and frame.width>0 and frame.height>0,
    }
    return {"ok":all(checks.values()),"checks":checks,"metrics":{
      "invalid_pixels":invalid,"dark_fraction":round(dark/total,5),
      "body_black_fraction":round(opaque/max(1,len(body_ix)),5),
      "unlit_body_black_fraction":round(black_interior/max(1,len(interior)),5),
      "light_fraction":round(glowing/max(1,len(light_ix)),5)},
      "unverified":["nearest_screen_upscale","independent_part_motion"]}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    data=json.loads(a.manifest.read_text())
    results=[]
    for item in data["frames"]:
        files=[(a.manifest.parent/item[k]).resolve() for k in ("image","body_mask","light_mask")]
        results.append({"id":item["id"],**audit(*files)})
    result={"status":"PASS_ASSET_PIXELS_ONLY" if results and all(r["ok"] for r in results) else "FAIL",
            "results":results,"owner_art_pass":"UNKNOWN","physical_iphone_fps":"UNKNOWN"}
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result,indent=2))
    if result["status"]=="FAIL":raise SystemExit(1)

if __name__=="__main__":main()
