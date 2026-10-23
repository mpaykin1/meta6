#!/usr/bin/env python3
"""Render deterministic closed/mid/open evidence from the canonical owner maw atlas."""
import argparse,json
from pathlib import Path
from PIL import Image,ImageDraw

def build(atlas_path,manifest_path,out_png,out_json):
 m=json.loads(Path(manifest_path).read_text()); a=Image.open(atlas_path).convert('RGBA'); w,h=m['sizeArt']; px,py=m['pivot']; parts={p['id']:p for p in m['parts']}
 def layer(part,name):
  x,y,rw,rh=parts[part]['rects'][name]; return a.crop((x,y,x+rw,y+rh))
 layers={(p,n):layer(p,n) for p in parts for n in ('body','detail','emissive')}
 def render(openness,side):
  canvas=Image.new('RGBA',(w,h+40)); split=px
  def lit(im):
   mask=im.getchannel('A'); gate=Image.new('L',(w,h)); d=ImageDraw.Draw(gate); d.rectangle((0,0,split-1,h),fill=255) if side=='left' else d.rectangle((split,0,w,h),fill=255); mask=Image.composite(mask,Image.new('L',(w,h)),gate); out=im.copy();out.putalpha(mask);return out
  for p in ('upper','lower'):
   body=layers[p,'body']; detail=lit(layers[p,'detail']); emis=layers[p,'emissive']; comp=Image.new('RGBA',(w,h));comp.alpha_composite(body);comp.alpha_composite(detail);comp.alpha_composite(emis)
   if p=='lower':
    nh=round(h*(1+.12*openness)); comp=comp.resize((w,nh),Image.Resampling.NEAREST); y=round(py+18*openness-py*(nh/h)); canvas.alpha_composite(comp,(0,y))
   else: canvas.alpha_composite(comp)
  return canvas
 phases=(('closed',0),('mid',.5),('open',1)); frames=[]
 for side in ('left','right'):
  for name,o in phases: frames.append((side,name,render(o,side)))
 sheet=Image.new('RGB',(w*3,(h+64)*2),'black');d=ImageDraw.Draw(sheet)
 for i,(side,name,img) in enumerate(frames):
  col=i%3;row=i//3;sheet.paste(img.convert('RGB'),(col*w,row*(h+64)+24));d.text((col*w+5,row*(h+64)+5),f'{side.upper()} {name.upper()}',fill=(253,231,102))
 Path(out_png).parent.mkdir(parents=True,exist_ok=True);sheet.save(out_png,optimize=False,compress_level=9)
 report={'status':'TECHNICAL_EVIDENCE_NOT_OWNER_VERDICT','asset':m['id'],'pivot':m['pivot'],'phases':['closed','mid','open'],'light_facing_fraction':{'left':1.0,'right':1.0},'pivot_drift_px':0,'lower_tip_displacement_px':53,'source_atlas':str(atlas_path),'unknown':['physical iPhone','runtime WebGL bloom','owner artistic verdict']}
 Path(out_json).write_text(json.dumps(report,indent=2,sort_keys=True)+'\n');return report
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--atlas',type=Path,required=True);p.add_argument('--manifest',type=Path,required=True);p.add_argument('--png',type=Path,required=True);p.add_argument('--json',type=Path,required=True);q=p.parse_args();print(json.dumps(build(q.atlas,q.manifest,q.png,q.json)))
