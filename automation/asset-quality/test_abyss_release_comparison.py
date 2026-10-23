import unittest
from abyss_release_comparison import evaluate, EXPECTED_SHA


class ReleaseComparisonTests(unittest.TestCase):
    def setUp(self):
        self.original = {"source_sha256": EXPECTED_SHA, "status": "PASS_BROWSER_SMOKE_NOT_DEVICE_ACCEPTANCE", "failures": [],
                         "profiles": [{"name": n, "status": "PASS_BROWSER_SMOKE", "zones": [{}] * 5} for n in ("desktop", "touch")]}
        self.candidate = {"status": "PASS_SOFTWARE_BROWSER_NOT_DEVICE", "failures": [], "results": [
            {"profile": n, "variant": v, "status": "PASS_SWIFTSHADER", "movement": 2, "zones": [{}, {}], "errors": [],
             "raf": {"q0": 30, "D": 20 if v == "original" else 0}}
            for n in ("desktop", "touch") for v in ("original", "optimized")]}

    def test_real_report_schema_passes_but_not_art(self):
        result = evaluate(self.original, self.candidate, EXPECTED_SHA)
        self.assertEqual(result["status"], "PASS_CI_NOT_ARTISTIC_APPROVAL")
        self.assertEqual(result["artistic_approval"], "UNKNOWN")
        self.assertEqual(result["physical_iphone"], "UNKNOWN")

    def test_changed_source_fails(self):
        self.assertIn("original_unchanged", evaluate(self.original, self.candidate, "0" * 64)["failures"])

    def test_forged_report_hash_fails(self):
        self.original["source_sha256"] = "0" * 64
        self.assertIn("original_unchanged", evaluate(self.original, self.candidate, EXPECTED_SHA)["failures"])

    def test_missing_touch_fails(self):
        self.candidate["results"] = self.candidate["results"][:2]
        self.assertIn("touch_original_rendered", evaluate(self.original, self.candidate, EXPECTED_SHA)["failures"])

    def test_missing_secondary_raf_proof_fails(self):
        self.candidate["results"][0]["raf"]["D"] = 0
        self.assertIn("desktop_raf_reduction", evaluate(self.original, self.candidate, EXPECTED_SHA)["failures"])

    def test_failed_original_zone_fails(self):
        self.original["profiles"][0]["zones"] = [{}]
        self.assertIn("original_desktop_touch", evaluate(self.original, self.candidate, EXPECTED_SHA)["failures"])


if __name__ == "__main__":
    unittest.main()
