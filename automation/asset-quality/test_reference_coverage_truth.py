import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from compare_reference_batch import audit

class ReferenceCoverageTruthTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        base=Path(self.tmp.name)
        self.assets=base/"assets"
        self.references=base/"refs"
        self.assets.mkdir()
        self.references.mkdir()
        Image.new("RGBA",(2,2),(0,0,0,0)).save(self.assets/"a.png")
        Image.new("RGBA",(2,2),(255,0,0,255)).save(self.references/"a.png")
        (self.references/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
    def manifest(self,sprites):
        (self.assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":x} for x in sprites]}))
    def test_failing_pixel_match_does_not_count_as_verified(self):
        self.manifest(["a.png"])
        report=audit(self.assets,self.references)
        self.assertEqual(report["status"],"FAIL")
        self.assertEqual(report["coverage"]["declared"],1)
        self.assertEqual(report["coverage"]["verified"],0)
        self.assertEqual(report["coverage"]["ratio"],0)
    def test_passing_pixel_match_counts_as_verified(self):
        self.manifest(["a.png"])
        Image.new("RGBA",(2,2),(0,0,0,0)).save(self.references/"a.png")
        report=audit(self.assets,self.references)
        self.assertEqual(report["coverage"]["verified"],1)
        self.assertEqual(report["coverage"]["ratio"],1)
    def test_duplicate_manifest_files_fail(self):
        self.manifest(["a.png","a.png"])
        report=audit(self.assets,self.references)
        self.assertEqual(report["status"],"FAIL")
        self.assertEqual(report["reason"],"invalid_asset_manifest")
    def test_non_string_manifest_file_fails(self):
        (self.assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":False}]}))
        report=audit(self.assets,self.references)
        self.assertEqual(report["status"],"FAIL")
        self.assertEqual(report["reason"],"invalid_asset_manifest")

if __name__=="__main__":
    unittest.main()
