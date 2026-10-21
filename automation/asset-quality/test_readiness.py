import unittest
from readiness import score
class ReadinessTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(score({})["verified_score"],0)
    def test_claim_without_artifact(self):
        self.assertEqual(score({"atlas":{"status":"PASS"}})["verified_score"],0)
    def test_claim_with_artifact(self):
        self.assertEqual(score({"atlas":{"status":"PASS","artifact":"ci/run/123"}})["verified_score"],10)
    def test_unknown(self):
        self.assertEqual(score({"atlas":{"status":"UNKNOWN","artifact":"ci/run/123"}})["verified_score"],0)
if __name__=="__main__":unittest.main()
