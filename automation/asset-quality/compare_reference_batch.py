#!/usr/bin/env python3
"""Batch comparison against approved pixel references; missing reference coverage is UNKNOWN."""
import argparse, json
from pathlib import Path
from compare_reference import compare

def audit(root, references):
    root=Path(root).resolve()
    references=Path(references).resolve()
    if not root.is_dir() or not references.is_dir():
        return {"status":"UNKNOWN","checked":0,"reason":"assets_or_references_missing","results":[]}
    manifest=references/"manifest.json"
    if not manifest.is_file():
        return {"status":"UNKNOWN","checked":0,"reason":"reference_manifest_missing","results":[]}
    try:
        records=json.loads(manifest.read_text(encoding="utf8"))["comparisons"]
        if not isinstance(records,list) or not records:
            raise ValueError("empty comparisons")
    except (OSError,ValueError,KeyError,TypeError) as error:
        return {"status":"FAIL","checked":0,"reason":str(error),"results":[]}
    results=[]
    seen=set()
    declared_candidates=set()
    expected_assets=set()
    assets_manifest=root/"manifest.json"
    if assets_manifest.is_file():
        try:
            sprites=json.loads(assets_manifest.read_text(encoding="utf8"))["sprites"]
            expected_assets={str(sprite["file"]) for sprite in sprites}
        except (OSError,ValueError,KeyError,TypeError):
            return {"status":"FAIL","checked":0,"reason":"invalid_asset_manifest","results":[]}
    for record in records:
        try:
            ident=record["id"]
            if not isinstance(ident,str) or not ident.strip() or ident in seen:
                raise ValueError("missing_or_duplicate_id")
            seen.add(ident)
            candidate_name=record["candidate"]
            if candidate_name in declared_candidates: raise ValueError("duplicate_candidate")
            declared_candidates.add(candidate_name)
            candidate=(root/candidate_name).resolve()
            reference=(references/record["reference"]).resolve()
            if not candidate.is_relative_to(root) or not reference.is_relative_to(references):
                raise ValueError("path_escape")
            if not candidate.is_file() or not reference.is_file():
                raise ValueError("missing_reference_or_candidate")
            result=compare(reference,candidate,record.get("max_mismatch",0))
            result["id"]=record.get("id")
        except (OSError,ValueError,KeyError,TypeError) as error:
            result={"status":"FAIL","id":record.get("id") if isinstance(record,dict) else None,"reason":str(error)}
        results.append(result)
    missing=sorted(expected_assets-declared_candidates)
    if missing:
        results.append({"status":"FAIL","reason":"uncovered_asset_manifest_sprites","missing":missing[:100],"missing_count":len(missing)})
    return {"status":"FAIL" if any(x["status"]=="FAIL" for x in results) else "PIXEL_PASS_ART_REVIEW_UNKNOWN",
            "checked":len(results),"results":results,"artistic_approval":"UNKNOWN"}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True)
    p.add_argument("--references",required=True)
    p.add_argument("--output")
    a=p.parse_args()
    result=audit(a.root,a.references)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(text,encoding="utf8")
    print(text)
    raise SystemExit(1 if result["status"]=="FAIL" else 0)
