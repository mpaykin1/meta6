#!/usr/bin/env python3
"""Measure whether a static maw atlas can prove one-sided ABYSS lighting.

This is a diagnostic, not an artistic gate. A bilaterally lit detail layer does
not fail the asset package: it means directional rim lighting still requires a
runtime render with an explicit light position.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from PIL import Image


LIT_HALF_MIN = 0.75


def evaluate(manifest_path: Path, atlas_path: Path) -> dict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    atlas = Image.open(atlas_path).convert("RGBA")
    pivot_x = manifest["pivot"][0]
    counts = Counter()

    for part in manifest["parts"]:
        x, y, width, height = part["rects"]["detail"]
        tile = atlas.crop((x, y, x + width, y + height))
        pixels = tile.get_flattened_data() if hasattr(tile, "get_flattened_data") else tile.getdata()
        for px_x, (_, _, _, alpha) in enumerate(pixels):
            if not alpha:
                continue
            art_x = px_x % width
            counts["left" if art_x < pivot_x else "right"] += 1

    total = counts["left"] + counts["right"]
    dominant = max(counts["left"], counts["right"]) / total if total else 0.0
    proves_direction = dominant >= LIT_HALF_MIN
    return {
        "schema": 1,
        "asset": manifest.get("id"),
        "probe": "static-detail-half-distribution",
        "detail_pixels": {
            "left": counts["left"],
            "right": counts["right"],
            "total": total,
        },
        "dominant_half_fraction": round(dominant, 6),
        "abyss_md_lit_half_min": LIT_HALF_MIN,
        "static_baseline_proves_directional_light": proves_direction,
        "status": "STATIC_DIRECTION_VISIBLE" if proves_direction else "UNKNOWN_DIRECTIONAL_RENDER",
        "next_capture": {
            "same_scene_seed_camera_resolution": True,
            "light_positions": ["left-of-maw", "right-of-maw"],
            "required": [
                "silhouette alpha unchanged between captures",
                "at least 75% of lit object pixels on the light-facing half",
                "darkness, bright-tone share, frame time p50/p95",
            ],
        },
        "limitations": [
            "Static atlas distribution is not a rendered normal-map or bloom test.",
            "This diagnostic is not owner artistic PASS/FAIL.",
            "Physical iPhone rendering remains UNKNOWN.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--atlas", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = evaluate(args.manifest, args.atlas)
    text = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
