import json,tempfile,unittest
from pathlib import Path
from PIL import Image
from compare_reference_batch import audit

class BatchReferenceTests(unittest.TestCase):
    def test_missing_references_unknown(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(audit(Path(tmp)/"assets",Path(tmp)/"refs")["status"],"UNKNOWN")
    def test_matching_reference(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            Image.new("RGBA",(3,3),(0,0,0,255)).save(assets/"a.png")
            Image.new("RGBA",(3,3),(0,0,0,255)).save(refs/"a.png")
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"PIXEL_PASS_ART_REVIEW_UNKNOWN")
    def test_traversal_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"x","candidate":"../escape.png","reference":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
if __name__=="__main__":unittest.main()
