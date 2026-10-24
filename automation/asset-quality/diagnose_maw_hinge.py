#!/usr/bin/env python3
"""Measure the isolated maw stand's declared hinge from its actual transform.

This is a source-level diagnostic for the current Canvas2D evidence stand.  It
does not claim browser, artistic, or physical-device acceptance.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path


PIVOT_RE = re.compile(r"P=\[(?P<x>[\d.]+),(?P<y>[\d.]+)\]")
SIZE_RE = re.compile(r"W=(?P<w>\d+),H=(?P<h>\d+)")
TRANSFORM_RE = re.compile(
    r"x\.translate\(P\[0\],P\[1\](?:\+open\*(?P<translate>[\d.]+))?\);"
    r"x\.scale\(1,1\+open\*(?P<scale>[\d.]+)\);"
    r"x\.translate\(-P\[0\],-P\[1\]\)"
)
ROTATION_RE = re.compile(
    r"x\.translate\(P\[0\],P\[1\]\);"
    r"x\.rotate\(open\*(?P<angle>[\d.]+)\);"
    r"x\.translate\(-P\[0\],-P\[1\]\)"
)


def diagnose(html_path: Path, claimed_path: Path):
    source = html_path.read_text(encoding="utf-8")
    claimed = json.loads(claimed_path.read_text(encoding="utf-8"))
    pivot_match = PIVOT_RE.search(source)
    size_match = SIZE_RE.search(source)
    transform_match = TRANSFORM_RE.search(source)
    rotation_match = ROTATION_RE.search(source)
    if not (pivot_match and size_match and (transform_match or rotation_match)):
        raise ValueError("unsupported maw lower-jaw transform; browser measurement required")

    pivot = [float(pivot_match["x"]), float(pivot_match["y"])]
    height = float(size_match["h"])
    phases = []
    for name, openness in (("closed", 0.0), ("mid", 0.5), ("open", 1.0)):
        if rotation_match:
            angle = float(rotation_match["angle"]) * openness
            pivot_drift = 0.0
            tip_displacement = 2 * (height - pivot[1]) * abs(math.sin(angle / 2))
        else:
            translation = float(transform_match["translate"] or 0)
            scale = float(transform_match["scale"])
            pivot_drift = translation * openness
            tip_displacement = pivot_drift + (height - pivot[1]) * scale * openness
        phases.append({
            "name": name,
            "openness": openness,
            "pivot_drift_px": round(pivot_drift, 4),
            "lower_tip_displacement_px": round(tip_displacement, 4),
        })

    measured_drift = max(item["pivot_drift_px"] for item in phases)
    measured_tip = max(item["lower_tip_displacement_px"] for item in phases)
    claimed_drift = float(claimed["pivot_drift_px"])
    claimed_tip = float(claimed["lower_tip_displacement_px"])
    mismatch = {
        "pivot_drift_px": round(abs(measured_drift - claimed_drift), 4),
        "lower_tip_displacement_px": round(abs(measured_tip - claimed_tip), 4),
    }
    claim_error = max(mismatch.values())
    return {
        "status": "BLOCKED_FALSE_MOTION_EVIDENCE" if measured_drift > 0.25 or claim_error > 0.25 else "PIVOT_FIXED_NUMERIC_ONLY",
        "artistic_status": "UNKNOWN",
        "runtime_browser_status": "UNKNOWN",
        "hinge": pivot,
        "measurement": "Canvas2D transform evaluated at declared local pivot and lower tip",
        "phases": phases,
        "max_measured_pivot_drift_px": measured_drift,
        "max_measured_lower_tip_displacement_px": measured_tip,
        "claimed_evidence": {
            "pivot_drift_px": claimed_drift,
            "lower_tip_displacement_px": claimed_tip,
        },
        "absolute_claim_mismatch_px": mismatch,
        "source_html_sha256": hashlib.sha256(html_path.read_bytes()).hexdigest(),
        "next_test": "instrument CanvasRenderingContext2D.getTransform in Chromium and sample hinge/tip at closed, mid and open phases",
        "fix_target": "lower jaw deforms around the fixed y=168 hinge line with measured drift <=0.25 px",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--html", type=Path, required=True)
    parser.add_argument("--claimed", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = diagnose(args.html, args.claimed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
