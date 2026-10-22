#!/usr/bin/env python3
"""ABYSS asset production gate. stdlib + Pillow. UNKNOWN is never PASS."""
import argparse, json, pathlib, sys, math
from PIL import Image,ImageChops

PALETTE={(0,0,0),(62,21,0),(112,39,0),(173,66,1),(229,120,7),(249,189,43),(253,231,102)}
def point_in_frame(value,w,h):
    return (isinstance(value,list) and len(value)==2 and
            all(isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) for x in value) and
            0<=value[0]<w and 0<=value[1]<h)

def alpha_component_count(alpha):
    """Count 4-connected non-transparent islands without recursion."""
    w,h=alpha.size
    pixels=alpha.tobytes()
    seen=bytearray(len(pixels))
    components=0
    for start,value in enumerate(pixels):
        if not value or seen[start]: continue
        components+=1
        seen[start]=1
        stack=[start]
        while stack:
            pos=stack.pop()
            x=pos%w
            for neighbor in (pos-w if pos>=w else -1,
                             pos+w if pos+w<len(pixels) else -1,
                             pos-1 if x else -1,
                             pos+1 if x+1<w else -1):
                if neighbor>=0 and pixels[neighbor] and not seen[neighbor]:
                    seen[neighbor]=1
                    stack.append(neighbor)
    return components

def frame_distance(root,left,right):
    """Mean absolute RGBA change; None means incomparable frame geometry."""
    try:
        with Image.open(pathlib.Path(root)/left["file"]) as source:
            a=source.convert("RGBA")
        with Image.open(pathlib.Path(root)/right["file"]) as source:
            b=source.convert("RGBA")
    except (OSError,KeyError):
        return None
    if a.size!=b.size: return None
    histogram=ImageChops.difference(a,b).histogram()
    return sum((index%256)*count for index,count in enumerate(histogram))/(a.width*a.height*4)

def inspect(root, manifest):
    issues=[]; checked=0; sequences={}
    try: data=json.loads(pathlib.Path(manifest).read_text(encoding="utf8"))
    except (OSError,ValueError) as e: return {"status":"FAIL","checked":0,"issues":[{"rule":"manifest","detail":str(e)}]}
    entries=data.get("sprites",[]) if isinstance(data,dict) else data
    if not isinstance(entries,list) or not entries:
        return {"status":"FAIL","checked":0,"issues":[{"rule":"manifest","detail":"empty or invalid sprites array"}]}
    ids=set()
    for entry in entries:
        if not isinstance(entry,dict): issues.append({"rule":"entry_object"}); continue
        name=entry.get("id","?")
        if not isinstance(name,str) or not name.strip():
            issues.append({"rule":"invalid_id"}); name=str(name)
        if name in ids: issues.append({"id":name,"rule":"unique_id"})
        ids.add(name)
        for field in ("id","file","kind","type","stage","anim","frame","frames","fps","loop","sizeArt","pivot","hitbox","sockets","parts","atlas","rect","source"):
            if field not in entry: issues.append({"id":name,"rule":"manifest","detail":"missing "+field})
        file=entry.get("file")
        if not isinstance(file,str) or not file or pathlib.PurePosixPath(file).is_absolute() or ".." in pathlib.PurePosixPath(file).parts:
            issues.append({"id":name,"rule":"file_path"}); continue
        path=pathlib.Path(root)/file
        if not path.resolve().is_relative_to(pathlib.Path(root).resolve()): issues.append({"id":name,"rule":"file_escape"}); continue
        if not path.is_file(): issues.append({"id":name,"rule":"missing_file"}); continue
        try:
            im=Image.open(path).convert("RGBA")
        except Exception as e:
            issues.append({"id":name,"rule":"decode","detail":str(e)}); continue
        checked+=1
        w,h=im.size
        if w>2048 or h>2048: issues.append({"id":name,"rule":"atlas_size"})
        alpha=im.getchannel("A")
        bbox=alpha.getbbox()
        if not bbox: issues.append({"id":name,"rule":"empty_sprite"}); continue
        sockets=entry.get("sockets")
        if not isinstance(sockets,dict) or any(not isinstance(socket,str) or not socket or not point_in_frame(point,w,h) for socket,point in sockets.items()):
            issues.append({"id":name,"rule":"invalid_sockets"})
        hitbox=entry.get("hitbox")
        circle=hitbox.get("circle") if isinstance(hitbox,dict) else None
        if not (isinstance(circle,list) and len(circle)==3 and
                all(isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) for x in circle) and
                point_in_frame(circle[:2],w,h) and circle[2]>0):
            issues.append({"id":name,"rule":"invalid_hitbox"})
        parts=entry.get("parts")
        valid_parts=[]
        if parts is not None and not isinstance(parts,list):
            issues.append({"id":name,"rule":"invalid_parts"})
        elif isinstance(parts,list):
            part_ids=set()
            for index,part in enumerate(parts):
                valid=(isinstance(part,dict) and isinstance(part.get("id"),str) and bool(part["id"]) and
                       part["id"] not in part_ids and point_in_frame(part.get("pivot"),w,h) and
                       (part.get("parent") is None or isinstance(part.get("parent"),str) and bool(part["parent"])) and
                       point_in_frame(part.get("joint"),w,h))
                if not valid:
                    issues.append({"id":name,"rule":"invalid_part","index":index})
                    continue
                part_ids.add(part["id"])
                valid_parts.append(part)
        declared_parts=len(valid_parts)
        component_count=alpha_component_count(alpha)
        if component_count>1+declared_parts:
            issues.append({"id":name,"rule":"undeclared_components","actual":component_count,"allowed":1+declared_parts})
        if bbox[0]<2 or bbox[1]<2 or w-bbox[2]<2 or h-bbox[3]<2:
            issues.append({"id":name,"rule":"padding_2px"})
        pixels=list(im.getdata())
        colored=[p for p in pixels if p[3]]
        if any(p[:3] not in PALETTE for p in colored):
            issues.append({"id":name,"rule":"seven_color_palette"})
        if colored and sum(p[3]==255 for p in colored)/len(colored)<.95:
            issues.append({"id":name,"rule":"opaque_body_95pct"})
        for field, n in (("sizeArt",2),("pivot",2),("rect",4)):
            val=entry.get(field)
            numeric=(lambda x: isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x))
            valid=(isinstance(val,list) and len(val)==n and all(numeric(x) for x in val))
            if field in ("sizeArt","rect") and valid: valid=all(type(x) is int for x in val)
            if not valid:
                issues.append({"id":name,"rule":"invalid_"+field})
        size_art=entry.get("sizeArt")
        if isinstance(size_art,list) and len(size_art)==2 and all(type(x) is int for x in size_art):
            if size_art != [w,h]: issues.append({"id":name,"rule":"sizeArt_matches_file","actual":size_art,"expected":[w,h]})
        pivot=entry.get("pivot")
        if isinstance(pivot,list) and len(pivot)==2 and all(isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) for x in pivot):
            if not (0 <= pivot[0] < w and 0 <= pivot[1] < h):
                issues.append({"id":name,"rule":"pivot_inside_frame","pivot":pivot,"size":[w,h]})
        rect=entry.get("rect")
        if isinstance(rect,list) and len(rect)==4 and all(isinstance(x,int) for x in rect) and (rect[2]<=0 or rect[3]<=0 or any(x<0 for x in rect)):
            issues.append({"id":name,"rule":"rect_geometry"})
        elif isinstance(rect,list) and len(rect)==4 and all(type(x) is int for x in rect) and rect[2:] != [w,h]:
            issues.append({"id":name,"rule":"rect_size_matches_file","actual":rect[2:],"expected":[w,h]})
        if type(entry.get("stage")) is not int or entry["stage"] not in range(5): issues.append({"id":name,"rule":"stage_0_4"})
        if type(entry.get("frames")) is not int or entry.get("frames",0)<1: issues.append({"id":name,"rule":"frames"})
        if type(entry.get("frame")) is not int or type(entry.get("frames")) is not int or not (0 <= entry.get("frame",-1) < entry.get("frames",0)):
            issues.append({"id":name,"rule":"frame_index"})
        if not isinstance(entry.get("fps"),(int,float)) or isinstance(entry.get("fps"),bool) or not math.isfinite(entry.get("fps",0)) or entry.get("fps",0)<=0:
            issues.append({"id":name,"rule":"animation_fps"})
        if type(entry.get("loop")) is not bool: issues.append({"id":name,"rule":"animation_loop"})
        if "rootMotion" in entry and type(entry["rootMotion"]) is not bool:
            issues.append({"id":name,"rule":"root_motion_flag"})
        sequence_key=(entry.get("kind"),entry.get("type"),entry.get("stage"),entry.get("anim"),json.dumps(entry.get("direction"),sort_keys=True),json.dumps(entry.get("view"),sort_keys=True))
        sequences.setdefault(sequence_key,[]).append(entry)
        for layer in ("body","detail","normal","emissive"):
            layers=entry.get("layers")
            layerfile=layers.get(layer) if isinstance(layers,dict) else None
            if not isinstance(layerfile,str) or not layerfile or pathlib.PurePosixPath(layerfile).is_absolute() or ".." in pathlib.PurePosixPath(layerfile).parts or not (pathlib.Path(root)/layerfile).resolve().is_relative_to(pathlib.Path(root).resolve()) or not (pathlib.Path(root)/layerfile).is_file():
                issues.append({"id":name,"rule":"layer_"+layer})
    for sequence, entries_in_sequence in sequences.items():
        totals={entry.get("frames") for entry in entries_in_sequence if type(entry.get("frames")) is int and entry.get("frames",0)>0}
        if len(totals)>1:
            issues.append({"sequence":sequence,"rule":"sequence_frames_consistent"})
            continue
        if not totals: continue
        total=next(iter(totals))
        indices=[entry.get("frame") for entry in entries_in_sequence if type(entry.get("frame")) is int]
        if sorted(indices)!=list(range(total)):
            issues.append({"sequence":sequence,"rule":"sequence_complete","actual":sorted(indices),"expected":list(range(total))})
        for field, rule in (("fps","sequence_fps_consistent"),("loop","sequence_loop_consistent")):
            values={json.dumps(entry.get(field),sort_keys=True) for entry in entries_in_sequence}
            if len(values)>1: issues.append({"sequence":sequence,"rule":rule})
        root_motion=any(entry.get("rootMotion") is True for entry in entries_in_sequence)
        pivots=[entry.get("pivot") for entry in entries_in_sequence]
        valid_pivots=[p for p in pivots if isinstance(p,list) and len(p)==2 and all(isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) for x in p)]
        if not root_motion and len(valid_pivots)==len(entries_in_sequence):
            drift=max(max(p[axis] for p in valid_pivots)-min(p[axis] for p in valid_pivots) for axis in (0,1))
            if drift>1: issues.append({"sequence":sequence,"rule":"pivot_drift_1px","drift":drift})
        if (total>=3 and sorted(indices)==list(range(total)) and
                all(entry.get("loop") is True for entry in entries_in_sequence)):
            ordered=sorted(entries_in_sequence,key=lambda entry:entry["frame"])
            adjacent=[frame_distance(root,ordered[index],ordered[index+1]) for index in range(total-1)]
            seam=frame_distance(root,ordered[-1],ordered[0])
            if seam is not None and all(distance is not None for distance in adjacent) and seam>max(adjacent)+1e-9:
                issues.append({"sequence":sequence,"rule":"loop_seam_continuity","seam":seam,"max_neighbor":max(adjacent)})
    return {"status":"FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN","checked":checked,"issues":issues,
            "runtime_unknown":["animated pivots/loops","dynamic light 8 directions","3D geometry and collisions","touch movement","FPS on device","visual owner approval"]}
def main():
    p=argparse.ArgumentParser();p.add_argument("--root",required=True);p.add_argument("--manifest",required=True);p.add_argument("--output");a=p.parse_args()
    result=inspect(a.root,a.manifest)
    rendered=json.dumps(result,ensure_ascii=False,indent=2)
    if a.output:pathlib.Path(a.output).write_text(rendered,encoding="utf8")
    print(rendered)
    return 1 if result["status"]=="FAIL" else 0
if __name__=="__main__":sys.exit(main())

