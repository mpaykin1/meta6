import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "automation/asset-quality/diagnose_maw_hinge.py"
SPEC = importlib.util.spec_from_file_location("diagnose_maw_hinge", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class MawHingeDiagnosticTest(unittest.TestCase):
    def test_fixed_rotation_matches_measured_evidence(self):
        report = MODULE.diagnose(
            ROOT / "abyss-glow/maw-stand/index.html",
            ROOT / "docs/autotask-reports/evidence/2026-10-23-maw-motion-light.json",
        )
        self.assertEqual(report["status"], "PIVOT_FIXED_NUMERIC_ONLY")
        self.assertEqual(report["max_measured_pivot_drift_px"], 0.0)
        self.assertEqual(report["absolute_claim_mismatch_px"]["pivot_drift_px"], 0.0)
        self.assertLessEqual(report["absolute_claim_mismatch_px"]["lower_tip_displacement_px"], 0.01)
        self.assertEqual(report["artistic_status"], "UNKNOWN")

    def test_red_control_old_translation_stretch_is_blocked(self):
        source = (ROOT / "abyss-glow/maw-stand/index.html").read_text()
        source = source.replace(
            "x.translate(P[0],P[1]);x.rotate(open*.22);x.translate(-P[0],-P[1])",
            "x.translate(P[0],P[1]+open*18);x.scale(1,1+open*.12);x.translate(-P[0],-P[1])",
        )
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            html = temp / "index.html"
            claimed = temp / "claimed.json"
            html.write_text(source)
            claimed.write_text(json.dumps({
                "pivot_drift_px": 0,
                "lower_tip_displacement_px": 53,
            }))
            report = MODULE.diagnose(html, claimed)
        self.assertEqual(report["status"], "BLOCKED_FALSE_MOTION_EVIDENCE")
        self.assertEqual(report["max_measured_pivot_drift_px"], 18.0)
        self.assertEqual(report["absolute_claim_mismatch_px"]["pivot_drift_px"], 18.0)


if __name__ == "__main__":
    unittest.main()
