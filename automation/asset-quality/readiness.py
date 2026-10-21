#!/usr/bin/env python3
"""Evidence-based readiness. Missing evidence cannot be scored as completed."""
import argparse,json
from pathlib import Path
GATES={"manifest_and_palette":15,"atlas":10,"layers":10,"animation_metadata":15,"visual_reference":15,"runtime_2d_25d_3d":15,"mobile_fps":10,"owner_acceptance":10}
def score(evidence):
    if not isinstance(evidence,dict):raise ValueError("Evidence must be an object")
    points=0;results={}
    for name,weight in GATES.items():
        record=evidence.get(name,{})
        if not isinstance(record,dict):record={}
        passed=record.get("status")=="PASS" and isinstance(record.get("artifact"),str) and bool(record["artifact"].strip())
        results[name]={"weight":weight,"verified":passed,"status":"PASS" if passed else "UNKNOWN"}
        if passed:points+=weight
    return {"verified_score":points,"possible_score":100,"status":"INCOMPLETE" if points<100 else "EVIDENCE_RECORDED_OWNER_VERIFY","gates":results,
            "note":"Artifact references are supplied claims; independently inspect evidence and CI before accepting."}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--evidence",required=True);p.add_argument("--output");a=p.parse_args()
    report=score(json.loads(Path(a.evidence).read_text(encoding="utf8")))
    result=json.dumps(report,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(result,encoding="utf8")
    print(result)
