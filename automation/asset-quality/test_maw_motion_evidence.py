import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BUILDER = ROOT / "automation/asset-quality/build_maw_motion_evidence.py"
ATLAS = ROOT / "abyss-glow/assets/maw_front_v1/maw_front_atlas.png"
MANIFEST = ROOT / "abyss-glow/assets/maw_front_v1/manifest.json"
CANONICAL_LIGHT = ROOT / "abyss-glow/assets/maw_front_v1/maw_front_light8.png"
PALETTE = {(0, 0, 0), (0x3E, 0x15, 0), (0x70, 0x27, 0),
           (0xAD, 0x42, 1), (0xE5, 0x78, 7), (0xF9, 0xBD, 0x2B),
           (0xFD, 0xE7, 0x66)}


class MawMotionEvidenceTest(unittest.TestCase):
    def build(self, root):
        png, report, light = root / "sheet.png", root / "report.json", root / "light8.png"
        subprocess.run([
            "python3", str(BUILDER), "--atlas", str(ATLAS),
            "--manifest", str(MANIFEST), "--png", str(png),
            "--json", str(report), "--light-atlas", str(light),
        ], check=True, capture_output=True, text=True)
        return png, report, light

    def test_owner_maw_has_normal_derived_light_and_hinge_phases(self):
        with tempfile.TemporaryDirectory() as temp:
            png, report_path, light = self.build(Path(temp))
            report = json.loads(report_path.read_text())
            self.assertEqual(report["pivot"], [108, 168])
            self.assertEqual(report["pivot_drift_px"], 0)
            self.assertGreater(report["lower_tip_displacement_px"], 1)
            self.assertAlmostEqual(report["lower_tip_displacement_px"], 36.3, places=4)
            self.assertEqual([sample["name"] for sample in report["motion_samples"]],
                             ["closed", "mid", "open"])
            self.assertEqual(len(report["light_vectors"]), 8)
            self.assertRegex(report["normal_tiles_sha256"], r"^[0-9a-f]{64}$")
            self.assertGreaterEqual(min(report["light_facing_fraction"].values()), 0.75)
            self.assertLessEqual(report["pivot_seam_max_run_px"], 4)
            self.assertFalse(report["runtime_per_pixel_cpu_lighting"])
            self.assertEqual(report["status"], "TECHNICAL_EVIDENCE_NOT_OWNER_VERDICT")
            self.assertEqual(light.read_bytes(), CANONICAL_LIGHT.read_bytes())
            self.assertGreater(Image.open(png).getbbox()[2], 0)

    def test_light_atlas_is_palette_locked_and_deterministic(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            _, _, a = self.build(Path(first))
            _, _, b = self.build(Path(second))
            self.assertEqual(hashlib.sha256(a.read_bytes()).digest(),
                             hashlib.sha256(b.read_bytes()).digest())
            image = Image.open(a).convert("RGBA")
            # Pillow 11.3.0 is pinned in CI; get_flattened_data arrived later.
            used = {pixel[:3] for pixel in image.getdata() if pixel[3]}
            self.assertTrue(used)
            self.assertLessEqual(used, PALETTE)

    def test_isolated_stand_uses_dt_hinge_and_precomputed_light(self):
        html = (ROOT / "abyss-glow/maw-stand/index.html").read_text()
        self.assertIn("requestAnimationFrame", html)
        self.assertIn("const dt=", html)
        self.assertIn("P=[108,168]", html)
        self.assertIn("part('lower'", html)
        self.assertIn("x.scale(1,1+open*.30)", html)
        self.assertNotIn("x.rotate(open*.22)", html)
        self.assertNotIn("P[1]+open*18", html)
        self.assertIn("maw_front_light8.png", html)
        self.assertNotIn("x.rect(clip", html)


if __name__ == "__main__":
    unittest.main()
