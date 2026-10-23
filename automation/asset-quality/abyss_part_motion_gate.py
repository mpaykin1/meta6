#!/usr/bin/env python3
"""Fail-closed proof that independently animated parts move relative to each other.

Manifest must provide at least 3 timestamps and >=2 named part anchors at each.
A common rigid translation, a frozen image, or a single-part wiggle is not
accepted as independent creature animation.
"""
import argparse
import json
import math
from pathlib import Path


def evaluate(record):
    samples = record.get("samples", [])
    parts = record.get("parts", [])
    checks = {
        "three_distinct_times": len(samples) >= 3 and len({s.get("time") for s in samples}) == len(samples),
        "two_or_more_parts": len(parts) >= 2 and len(set(parts)) == len(parts),
        "all_anchors_present": all(
            isinstance(s.get("anchors"), dict)
            and all(isinstance(s["anchors"].get(p), list)
                    and len(s["anchors"][p]) == 2
                    and all(isinstance(v, (int, float)) and math.isfinite(v) for v in s["anchors"][p])
                    for p in parts)
            for s in samples
        ),
    }
    if all(checks.values()):
        root = parts[0]
        # Remove root translation; require changes in the relative pose of
        # two or more independently animated components (not a whole-image shift).
        moved = 0
        for part in parts[1:]:
            rel = [(s["anchors"][part][0] - s["anchors"][root][0],
                    s["anchors"][part][1] - s["anchors"][root][1]) for s in samples]
            if max(math.dist(rel[0], r) for r in rel[1:]) > 0.5:
                moved += 1
        checks["independent_parts_move"] = moved >= 2
    else:
        checks["independent_parts_move"] = False
    return {"status": "PASS_PART_ANCHOR_MOTION" if all(checks.values()) else "FAIL",
            "checks": checks, "independent_part_count": moved if all(list(checks.values())[:3]) else 0,
            "limitations": ["Anchor proof does not replace rendered-frame pixel motion comparison",
                            "Owner artistic PASS and physical iPhone FPS remain UNKNOWN"]}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    result = evaluate(json.loads(args.input.read_text()))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    if result["status"] == "FAIL":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
