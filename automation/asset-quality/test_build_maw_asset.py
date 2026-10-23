import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
BUILDER = ROOT / "abyss-glow/sketches/build_maw_asset.py"
SOURCE = ROOT / "abyss-glow/sketches/maw_front_layers.png"
OWNER = ROOT / "abyss-glow/sketches/maw_front_owner.png"
CANONICAL = ROOT / "abyss-glow/assets/maw_front_v1"
PALETTE = {
    (0, 0, 0),
    (0x3E, 0x15, 0),
    (0x70, 0x27, 0),
    (0xAD, 0x42, 1),
    (0xE5, 0x78, 7),
    (0xF9, 0xBD, 0x2B),
    (0xFD, 0xE7, 0x66),
}


class MawAssetBuildTest(unittest.TestCase):
    def test_front_maw_package_is_reproducible_and_manifested(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            subprocess.run(
                ["python3", str(BUILDER), "--source", str(SOURCE), "--owner", str(OWNER), "--output", str(out)],
                check=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            for name in ("maw_front_atlas.png", "maw_front_preview.png", "maw_front_evidence.png", "manifest.json"):
                self.assertEqual((out / name).read_bytes(), (CANONICAL / name).read_bytes())

            manifest = json.loads((out / "manifest.json").read_text())
            self.assertEqual(manifest["source"]["sha256"], hashlib.sha256(SOURCE.read_bytes()).hexdigest())
            self.assertEqual(manifest["source"]["kind"], "owner_sketch_derived_layers")
            self.assertEqual(manifest["license"]["status"], "UNKNOWN")
            self.assertEqual([p["id"] for p in manifest["parts"]], ["upper", "lower"])
            self.assertEqual(manifest["parts"][1]["joint"], "hinge")
            self.assertEqual(manifest["parts"][0]["pivot"], manifest["parts"][1]["pivot"])

            atlas = Image.open(out / "maw_front_atlas.png").convert("RGBA")
            self.assertLessEqual(max(atlas.size), 2048)
            for part in manifest["parts"]:
                for layer, rect in part["rects"].items():
                    x, y, w, h = rect
                    tile = atlas.crop((x, y, x + w, y + h))
                    alpha = tile.getchannel("A")
                    bbox = alpha.getbbox()
                    if layer != "emissive" or part["id"] == "upper":
                        self.assertIsNotNone(bbox, (part["id"], layer, "empty"))
                    if layer in ("body", "normal"):
                        left, top, right, bottom = bbox
                        self.assertGreaterEqual(min(left, top, w - right, h - bottom), 2,
                                                (part["id"], layer, "crop"))
                    if layer == "body":
                        opaque = [px for px in tile.getdata() if px[3] == 255]
                        self.assertTrue(opaque)
                        self.assertEqual({px[:3] for px in opaque}, {(0, 0, 0)})
                    if layer == "detail":
                        used = {px[:3] for px in tile.getdata() if px[3] == 255}
                        self.assertTrue(used)
                        self.assertTrue(used <= PALETTE, used - PALETTE)

    def test_source_layers_are_not_modified_by_build(self):
        before = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(
                ["python3", str(BUILDER), "--source", str(SOURCE), "--owner", str(OWNER), "--output", tmp],
                check=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
        self.assertEqual(hashlib.sha256(SOURCE.read_bytes()).hexdigest(), before)


if __name__ == "__main__":
    unittest.main()
