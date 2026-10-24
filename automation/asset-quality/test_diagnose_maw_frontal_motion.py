#!/usr/bin/env python3
import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("diagnose_maw_frontal_motion.py")
SPEC = importlib.util.spec_from_file_location("diagnose_maw_frontal_motion", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class MawFrontalMotionDiagnosticTest(unittest.TestCase):
    def test_centerline_vertical_deformation_passes_frontal_vector_gate(self):
        result = MODULE.diagnose()
        self.assertEqual(result["status"], "PASS_FRONTAL_OPENING_VECTOR")
        self.assertEqual(result["lateral_centroid_drift_px"], 0.0)
        self.assertAlmostEqual(result["vertical_centroid_motion_px"], 9.307978, places=3)
        self.assertEqual(result["vertical_motion_share"], 1.0)

    def test_previous_rotation_remains_a_discriminating_red_control(self):
        result = MODULE.diagnose(motion_model="rotation")
        self.assertEqual(result["status"], "BLOCKED_FRONTAL_LATERAL_SWING")
        self.assertAlmostEqual(result["lateral_centroid_drift_px"], 6.7774, places=3)
        self.assertAlmostEqual(result["vertical_centroid_motion_px"], -0.6890, places=3)


if __name__ == "__main__":
    unittest.main()
