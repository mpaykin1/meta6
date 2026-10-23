#!/usr/bin/env python3
"""Validate five-slot ABYSS handoffs; fail closed on broken cycle provenance.

Records are append-only JSON files under automation/handoff/<cycle>/<slot>.json.
The QA record must independently approve the exact BUILD commit, not its own
commit. This validates recorded evidence; it does not grant merge permission.
"""
import argparse
import json
import re
from pathlib import Path

SLOTS=("05-scout","15-build","30-test","40-qa","50-director")
SHA=re.compile(r"^[0-9a-f]{40}$")
CYCLE=re.compile(r"^\d{8}T\d{2}$")

def validate(root):
    problems=[]
    for directory in sorted(root.iterdir()) if root.exists() else []:
        if not directory.is_dir():
            continue
        if not CYCLE.fullmatch(directory.name):
            problems.append(f"{directory.name}: invalid cycle id")
            continue
        previous=None
        for slot in SLOTS:
            path=directory/f"{slot}.json"
            if not path.exists():
                problems.append(f"{directory.name}/{slot}: MISSING_HANDOFF")
                break
            try:
                record=json.loads(path.read_text())
            except (OSError,ValueError) as e:
                problems.append(f"{path}: invalid JSON {e}")
                break
            if record.get("cycle")!=directory.name or record.get("slot")!=slot:
                problems.append(f"{path}: wrong cycle/slot")
            if record.get("status") not in ("OK","BLOCKED","MISSING_HANDOFF"):
                problems.append(f"{path}: invalid status")
            if not isinstance(record.get("head_sha"),str) or not SHA.fullmatch(record["head_sha"]):
                problems.append(f"{path}: invalid head_sha")
            if previous is not None and record.get("previous_sha")!=previous.get("head_sha"):
                problems.append(f"{path}: previous_sha mismatch")
            if previous is not None and previous.get("status")!="OK" and record.get("status")=="OK":
                problems.append(f"{path}: dependency was not OK")
            if slot=="40-qa" and record.get("status")=="OK":
                if record.get("reviewed_sha")!=record.get("head_sha"):
                    problems.append(f"{path}: QA must approve exact SHA")
                if record.get("reviewer_role")!="QA" or record.get("approved") is not True:
                    problems.append(f"{path}: missing independent QA approval")
            if slot=="50-director" and record.get("merged") is True:
                qa=json.loads((directory/"40-qa.json").read_text())
                if qa.get("status")!="OK" or qa.get("approved") is not True or qa.get("reviewed_sha")!=record.get("merge_sha"):
                    problems.append(f"{path}: merge without exact-head QA")
                if record.get("ci_conclusion")!="success":
                    problems.append(f"{path}: merge without green CI")
            previous=record
    return problems

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path("automation/handoff"))
    args=p.parse_args()
    problems=validate(args.root)
    print(json.dumps({"status":"FAIL" if problems else "PASS_SCHEMA_ONLY","problems":problems,"live_five_slot_cycle":"UNKNOWN"},indent=2))
    if problems:raise SystemExit(1)

if __name__=="__main__":main()
