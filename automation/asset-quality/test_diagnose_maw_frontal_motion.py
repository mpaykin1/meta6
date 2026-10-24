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
    def test_current_fixed_pivot_rotation_is_lateral_not_frontal_opening(self):
        result = MODULE.diagnose()
        self.assertEqual(result["status"], "BLOCKED_FRONTAL_LATERAL_SWING")
        self.assertAlmostEqual(result["lateral_centroid_drift_px"], 6.7774, places=3)
        self.assertAlmostEqual(result["vertical_centroid_motion_px"], -0.6890, places=3)
        self.assertLess(result["vertical_motion_share"], 0.11)

    def test_vertical_candidate_is_a_discriminating_positive_control(self):
        result = MODULE.diagnose(open_angle_rad=0.0, candidate_vertical_drop_px=12.0)
        self.assertEqual(result["status"], "PASS_FRONTAL_OPENING_VECTOR")
        self.assertEqual(result["lateral_centroid_drift_px"], 0.0)
        self.assertEqual(result["vertical_centroid_motion_px"], 12.0)


if __name__ == "__main__":
    unittest.main()
