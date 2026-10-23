#!/usr/bin/env python3
"""Strict gate over real original and single-loop browser reports.

This is technical evidence only, never artistic or physical-device approval.
"""
import argparse
import hashlib
import json
from pathlib import Path

EXPECTED_SHA = "d968e47997dbd1cf843fdc73fed94e682217e6d5c833a0c8d602ec5b064f94e5"


def evaluate(original, candidate, actual_sha):
    checks = {}
    checks["original_unchanged"] = actual_sha == EXPECTED_SHA and original.get("source_sha256") == EXPECTED_SHA
    checks["original_browser_pass"] = original.get("status") == "PASS_BROWSER_SMOKE_NOT_DEVICE_ACCEPTANCE" and not original.get("failures")
    op = {p.get("name"): p for p in original.get("profiles", [])}
    checks["original_desktop_touch"] = all(op.get(n, {}).get("status") == "PASS_BROWSER_SMOKE" and len(op[n].get("zones", [])) == 5 for n in ("desktop", "touch"))
    checks["candidate_browser_pass"] = candidate.get("status") == "PASS_SOFTWARE_BROWSER_NOT_DEVICE" and not candidate.get("failures")
    cp = {(r.get("profile"), r.get("variant")): r for r in candidate.get("results", [])}
    for profile in ("desktop", "touch"):
        for variant in ("original", "optimized"):
            r = cp.get((profile, variant), {})
            checks[f"{profile}_{variant}_rendered"] = r.get("status") == "PASS_SWIFTSHADER" and r.get("movement", 0) > 1 and len(r.get("zones", [])) == 2 and not r.get("errors")
        a = cp.get((profile, "original"), {})
        b = cp.get((profile, "optimized"), {})
        checks[f"{profile}_raf_reduction"] = (a.get("raf", {}).get("D", 0) > 0 and b.get("raf", {}).get("D", 0) == 0 and b.get("raf", {}).get("q0", 0) > 0)
    failures = [k for k, passed in checks.items() if not passed]
    return {"checks": checks, "failures": failures, "status": "PASS_CI_NOT_ARTISTIC_APPROVAL" if not failures else "FAIL",
            "physical_iphone": "UNKNOWN", "artistic_approval": "UNKNOWN", "gpu_fps_improvement": "UNKNOWN",
            "integrated_into_original_game": False}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--original", type=Path, required=True)
    ap.add_argument("--candidate", type=Path, required=True)
    ap.add_argument("--source", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args()
    sha = hashlib.sha256(args.source.read_bytes()).hexdigest()
    result = evaluate(json.loads(args.original.read_text()), json.loads(args.candidate.read_text()), sha)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    if result["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
