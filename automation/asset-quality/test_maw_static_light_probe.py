import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from maw_static_light_probe import evaluate


class MawStaticLightProbeTest(unittest.TestCase):
    def test_bilateral_static_detail_requires_runtime_directional_capture(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            atlas = Image.new("RGBA", (8, 4))
            for x in (0, 1, 2, 5, 6, 7):
                atlas.putpixel((x, 1), (229, 120, 7, 255))
            atlas.save(root / "atlas.png")
            manifest = {
                "id": "fixture",
                "pivot": [4, 1],
                "parts": [{"rects": {"detail": [0, 0, 8, 4]}}],
            }
            (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")

            result = evaluate(root / "manifest.json", root / "atlas.png")

        self.assertEqual(result["detail_pixels"], {"left": 3, "right": 3, "total": 6})
        self.assertEqual(result["dominant_half_fraction"], 0.5)
        self.assertFalse(result["static_baseline_proves_directional_light"])
        self.assertEqual(result["status"], "UNKNOWN_DIRECTIONAL_RENDER")


if __name__ == "__main__":
    unittest.main()
