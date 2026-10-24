#!/usr/bin/env python3
"""Build deterministic normal-derived light tiles and maw motion evidence."""
import argparse
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

PALETTE = ((0, 0, 0), (0x3E, 0x15, 0), (0x70, 0x27, 0),
           (0xAD, 0x42, 1), (0xE5, 0x78, 7), (0xF9, 0xBD, 0x2B),
           (0xFD, 0xE7, 0x66))
DIRECTIONS = tuple((round(math.cos(i * math.tau / 8), 6),
                    round(math.sin(i * math.tau / 8), 6)) for i in range(8))
OPEN_ANGLE_RADIANS = 0.22
FRAME_PAD = 40


def crop_layer(atlas, part, name):
    x, y, width, height = part["rects"][name]
    return atlas.crop((x, y, x + width, y + height))


def directional_detail(detail, normal, light, pivot_x):
    """Quantize normal + smooth spatial falloff to the canonical palette."""
    width, height = detail.size
    result = Image.new("RGBA", detail.size)
    src, nrm, dst = detail.load(), normal.load(), result.load()
    lx, ly = light
    lz = 0.38
    length = math.sqrt(lx * lx + ly * ly + lz * lz)
    lx, ly, lz = lx / length, ly / length, lz / length
    span = max(pivot_x, width - pivot_x)
    palette_index = {color: index for index, color in enumerate(PALETTE)}
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = src[x, y]
            if not alpha:
                continue
            source_level = palette_index.get((red, green, blue), 0)
            if not source_level:
                continue
            nr, ng, nb, _ = nrm[x, y]
            nx, ny, nz = nr / 127.5 - 1.0, 1.0 - ng / 127.5, nb / 127.5 - 1.0
            dot = max(0.0, nx * lx + ny * ly + nz * lz)
            side = (x - pivot_x) / span
            facing = max(0.0, min(1.0, 0.5 + 0.5 * side * lx))
            facing = facing * facing * (3.0 - 2.0 * facing)
            intensity = max(0.0, min(1.0, 0.02 + 0.30 * dot + 0.90 * facing))
            level = max(0, min(6, round(source_level * intensity)))
            if level:
                dst[x, y] = (*PALETTE[level], 255)
    return result


def facing_fraction(image, pivot_x, expected_side):
    left = right = 0
    for y in range(image.height):
        for x in range(image.width):
            pixel = image.getpixel((x, y))
            # "Lit" means a visible mid/high rim tone, not merely alpha.
            if pixel[3] and PALETTE.index(pixel[:3]) >= 3:
                if x < pivot_x:
                    left += 1
                else:
                    right += 1
    total = left + right
    return (left if expected_side == "left" else right) / total if total else 0.0


def pivot_seam_run(image, pivot_x):
    """Longest abrupt on/off run across the old binary-mask boundary."""
    longest = current = 0
    for y in range(image.height):
        left = image.getpixel((pivot_x - 1, y))[3]
        right = image.getpixel((pivot_x, y))[3]
        if bool(left) != bool(right):
            current += 1
            longest = max(longest, current)
        else:
            current = 0
    return longest


def rotate_point(point, pivot, angle):
    """Canvas2D positive-angle rotation in screen coordinates (Y down)."""
    x, y = point
    px, py = pivot
    dx, dy = x - px, y - py
    return (px + dx * math.cos(angle) - dy * math.sin(angle),
            py + dx * math.sin(angle) + dy * math.cos(angle))


def motion_samples(width, height, pivot):
    tip = (pivot[0], height)
    samples = []
    for name, openness in (("closed", 0.0), ("mid", 0.5), ("open", 1.0)):
        angle = OPEN_ANGLE_RADIANS * openness
        mapped_pivot = rotate_point(pivot, pivot, angle)
        mapped_tip = rotate_point(tip, pivot, angle)
        samples.append({
            "name": name,
            "openness": openness,
            "angle_radians": round(angle, 4),
            "pivot_drift_px": round(math.dist(pivot, mapped_pivot), 4),
            "lower_tip_displacement_px": round(math.dist(tip, mapped_tip), 4),
        })
    return samples


def build(atlas_path, manifest_path, out_png, out_json, out_light_atlas,
          out_comparison=None):
    manifest = json.loads(Path(manifest_path).read_text())
    atlas = Image.open(atlas_path).convert("RGBA")
    width, height = manifest["sizeArt"]
    pivot_x, pivot_y = manifest["pivot"]
    parts = {part["id"]: part for part in manifest["parts"]}
    layers = {(part, name): crop_layer(atlas, parts[part], name)
              for part in parts for name in ("body", "detail", "normal", "emissive")}
    light_tiles = {(part, index): directional_detail(
                       layers[part, "detail"], layers[part, "normal"], vector, pivot_x)
                   for part in parts for index, vector in enumerate(DIRECTIONS)}

    light_atlas = Image.new("RGBA", (width * 8, height * 2))
    for row, part in enumerate(("upper", "lower")):
        for index in range(8):
            light_atlas.alpha_composite(light_tiles[part, index],
                                        (index * width, row * height))
    Path(out_light_atlas).parent.mkdir(parents=True, exist_ok=True)
    light_atlas.save(out_light_atlas, optimize=False, compress_level=9)

    canvas_size = (width + FRAME_PAD * 2, height + FRAME_PAD * 2)

    def render(openness, direction_index, legacy=False):
        canvas = Image.new("RGBA", canvas_size)
        for part in ("upper", "lower"):
            composite = Image.new("RGBA", (width, height))
            composite.alpha_composite(layers[part, "body"])
            composite.alpha_composite(light_tiles[part, direction_index])
            composite.alpha_composite(layers[part, "emissive"])
            if part == "lower":
                if legacy:
                    new_height = round(height * (1 + 0.12 * openness))
                    composite = composite.resize((width, new_height), Image.Resampling.NEAREST)
                    y = round(pivot_y + 18 * openness - pivot_y * (new_height / height))
                    canvas.alpha_composite(composite, (FRAME_PAD, FRAME_PAD + y))
                else:
                    layer = Image.new("RGBA", canvas_size)
                    layer.alpha_composite(composite, (FRAME_PAD, FRAME_PAD))
                    angle = -math.degrees(OPEN_ANGLE_RADIANS * openness)
                    layer = layer.rotate(angle, Image.Resampling.NEAREST,
                                         center=(FRAME_PAD + pivot_x,
                                                 FRAME_PAD + pivot_y))
                    canvas.alpha_composite(layer)
            else:
                canvas.alpha_composite(composite, (FRAME_PAD, FRAME_PAD))
        return canvas

    phases = (("closed", 0), ("mid", 0.5), ("open", 1))
    captures = (("left", 4), ("right", 0))
    frames = [(side, name, render(openness, direction))
              for side, direction in captures for name, openness in phases]
    frame_width, frame_height = canvas_size
    sheet = Image.new("RGB", (frame_width * 3, (frame_height + 24) * 2), "black")
    draw = ImageDraw.Draw(sheet)
    for index, (side, name, image) in enumerate(frames):
        column, row = index % 3, index // 3
        sheet.paste(image.convert("RGB"), (column * frame_width,
                                           row * (frame_height + 24) + 24))
        draw.text((column * frame_width + 5, row * (frame_height + 24) + 5),
                  f"{side.upper()} {name.upper()}", fill=PALETTE[6])
    Path(out_png).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_png, optimize=False, compress_level=9)

    if out_comparison:
        before = render(1.0, 4, legacy=True).convert("RGB")
        after = render(1.0, 4).convert("RGB")
        comparison = Image.new("RGB", (frame_width * 2, frame_height + 24), "black")
        comparison.paste(before, (0, 24))
        comparison.paste(after, (frame_width, 24))
        labels = ImageDraw.Draw(comparison)
        labels.text((5, 5), "BEFORE: TRANSLATE + STRETCH", fill=PALETTE[6])
        labels.text((frame_width + 5, 5), "AFTER: FIXED-PIVOT ROTATION", fill=PALETTE[6])
        Path(out_comparison).parent.mkdir(parents=True, exist_ok=True)
        comparison.save(out_comparison, optimize=False, compress_level=9)

    normal_hash = hashlib.sha256(b"".join(
        layers[part, "normal"].tobytes() for part in ("upper", "lower"))).hexdigest()
    left_image, right_image = light_tiles["upper", 4], light_tiles["upper", 0]
    samples = motion_samples(width, height, (pivot_x, pivot_y))
    report = {
        "status": "TECHNICAL_EVIDENCE_NOT_OWNER_VERDICT",
        "asset": manifest["id"], "pivot": manifest["pivot"],
        "phases": [name for name, _ in phases],
        "motion_samples": samples,
        "open_angle_radians": OPEN_ANGLE_RADIANS,
        "light_vectors": [list(vector) for vector in DIRECTIONS],
        "normal_tiles_sha256": normal_hash,
        "light_atlas_sha256": hashlib.sha256(Path(out_light_atlas).read_bytes()).hexdigest(),
        "light_facing_fraction": {
            "left": round(facing_fraction(left_image, pivot_x, "left"), 4),
            "right": round(facing_fraction(right_image, pivot_x, "right"), 4),
        },
        "pivot_seam_max_run_px": max(pivot_seam_run(left_image, pivot_x),
                                      pivot_seam_run(right_image, pivot_x)),
        "pivot_drift_px": max(sample["pivot_drift_px"] for sample in samples),
        "lower_tip_displacement_px": max(
            sample["lower_tip_displacement_px"] for sample in samples),
        "source_atlas": str(atlas_path), "runtime_per_pixel_cpu_lighting": False,
        "unknown": ["physical iPhone", "runtime WebGL bloom", "owner artistic verdict"],
    }
    Path(out_json).write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--atlas", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--png", type=Path, required=True)
    parser.add_argument("--json", type=Path, required=True)
    parser.add_argument("--light-atlas", type=Path, required=True)
    parser.add_argument("--comparison", type=Path)
    args = parser.parse_args()
    print(json.dumps(build(args.atlas, args.manifest, args.png, args.json,
                           args.light_atlas, args.comparison)))


if __name__ == "__main__":
    main()
