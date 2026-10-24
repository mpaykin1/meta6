#!/usr/bin/env python3
"""Measure whether the owner-source frontal maw opens vertically or swings sideways."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "abyss-glow/assets/maw_front_v1/manifest.json"


def _lower_mask_centroid(source: Path) -> tuple[float, float, int]:
    image = Image.open(source).convert("RGBA")
    points: list[tuple[int, int]] = []
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = image.getpixel((x, y))
            if alpha and green > 0 and green > red and green > blue:
                points.append((x, y))
    if not points:
        raise ValueError("owner lower-jaw mask is empty")
    return (
        sum(x for x, _ in points) / len(points),
        sum(y for _, y in points) / len(points),
        len(points),
    )


def _rotate(point: tuple[float, float], pivot: tuple[float, float], angle: float) -> tuple[float, float]:
    x, y = point
    px, py = pivot
    cosine, sine = math.cos(angle), math.sin(angle)
    return (
        px + (x - px) * cosine - (y - py) * sine,
        py + (x - px) * sine + (y - py) * cosine,
    )


def diagnose(
    manifest_path: Path = DEFAULT_MANIFEST,
    *,
    open_angle_rad: float = 0.22,
    candidate_vertical_drop_px: float = 0.0,
    max_lateral_drift_px: float = 2.0,
    min_vertical_open_px: float = 8.0,
) -> dict[str, object]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    source = ROOT / manifest["source"]["path"]
    source_sha = hashlib.sha256(source.read_bytes()).hexdigest()
    if source_sha != manifest["source"]["sha256"]:
        raise ValueError("owner source SHA-256 does not match manifest")

    centroid_x, centroid_y, pixels = _lower_mask_centroid(source)
    pivot = tuple(float(value) for value in manifest["pivot"])
    open_x, open_y = _rotate((centroid_x, centroid_y), pivot, open_angle_rad)
    open_y += candidate_vertical_drop_px
    lateral = abs(open_x - centroid_x)
    vertical = open_y - centroid_y
    total = math.hypot(lateral, vertical)
    vertical_share = abs(vertical) / total if total else 0.0
    status = (
        "PASS_FRONTAL_OPENING_VECTOR"
        if lateral <= max_lateral_drift_px and vertical >= min_vertical_open_px
        else "BLOCKED_FRONTAL_LATERAL_SWING"
    )
    return {
        "status": status,
        "source": str(source.relative_to(ROOT)),
        "source_sha256": source_sha,
        "lower_mask_pixels": pixels,
        "pivot": list(pivot),
        "closed_centroid": [round(centroid_x, 4), round(centroid_y, 4)],
        "open_centroid": [round(open_x, 4), round(open_y, 4)],
        "open_angle_rad": open_angle_rad,
        "candidate_vertical_drop_px": candidate_vertical_drop_px,
        "lateral_centroid_drift_px": round(lateral, 4),
        "vertical_centroid_motion_px": round(vertical, 4),
        "vertical_motion_share": round(vertical_share, 4),
        "thresholds": {
            "max_lateral_drift_px": max_lateral_drift_px,
            "min_vertical_open_px": min_vertical_open_px,
        },
        "interpretation": (
            "Technical fixed-pivot evidence is valid, but this source-derived frontal jaw "
            "moves mostly sideways and does not yet prove a readable frontal opening."
        ),
        "artistic_verdict": "UNKNOWN",
        "physical_iphone": "UNKNOWN",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = diagnose(args.manifest)
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(encoded, encoding="utf-8")
    else:
        print(encoded, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
