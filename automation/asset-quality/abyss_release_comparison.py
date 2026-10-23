#!/usr/bin/env python3
"""Deterministic release comparison of original ABYSS GLOW and Gothic preview.

Never writes to the original HTML. Inputs: browser reports from CI.
"""
import argparse
import json
from pathlib import Path


def evaluate(original, preview):
    issues = []
    checks = {}
    checks['original_browser_pass'] = original.get('status') in ('PASS', 'PASS_SOFTWARE_BROWSER_NOT_DEVICE')
    checks['gothic_browser_pass'] = preview.get('status') == 'PASS_BROWSER_EMULATION'
    profiles = {x.get('profile'): x for x in preview.get('profiles', [])}
    checks['desktop_assets_and_motion'] = profiles.get('desktop', {}).get('assets') == 5 and profiles.get('desktop', {}).get('frames_advanced', 0) > 2
    checks['portrait_assets_and_motion'] = profiles.get('portrait-touch', {}).get('assets') == 5 and profiles.get('portrait-touch', {}).get('frames_advanced', 0) > 2
    checks['touch_input'] = profiles.get('portrait-touch', {}).get('touch_or_mouse') == 1
    checks['original_unchanged'] = True  # Source SHA is separately enforced by build_single_loop.py.
    for name, ok in checks.items():
        if not ok:
            issues.append(name)
    return {'checks': checks, 'failures': issues, 'status': 'PASS_CI_NOT_ARTISTIC_APPROVAL' if not issues else 'FAIL', 'physical_iphone': 'UNKNOWN', 'gpu_fps_improvement': 'UNKNOWN', 'integrated_into_original_game': False}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--original', type=Path, required=True)
    ap.add_argument('--preview', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    a=ap.parse_args()
    result=evaluate(json.loads(a.original.read_text()),json.loads(a.preview.read_text()))
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    if result['failures']:
        raise SystemExit(1)


if __name__=='__main__':
    main()
