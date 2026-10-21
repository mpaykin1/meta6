import json, tempfile, unittest
from pathlib import Path
from PIL import Image
from build_atlas import build
class AtlasTests(unittest.TestCase):
    def test_deterministic_and_padding(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for name in ("b","a"):Image.new("RGBA",(4,4),(0,0,0,255)).save(root/(name+".png"))
            manifest=root/"manifest.json"
            manifest.write_text(json.dumps({"sprites":[{"id":n,"file":n+".png"} for n in ("b","a")]}))
            self.assertEqual(build(root,manifest,root/"out",max_size=16),(1,2))
            data=json.loads((root/"out"/"atlas-manifest.json").read_text())
            self.assertEqual([x["id"] for x in data["sprites"]],["a","b"])
            self.assertEqual([x["rect"][:2] for x in data["sprites"]],[[2,2],[10,2]])
            with Image.open(root/"out"/"atlas-000.png") as im:self.assertEqual(im.getpixel((0,0))[3],0)
            old=(root/"out"/"atlas-000.png").read_bytes()
            build(root,manifest,root/"out",max_size=16)
            self.assertEqual(old,(root/"out"/"atlas-000.png").read_bytes())
    def test_reject_traversal(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);manifest=root/"manifest.json"
            manifest.write_text(json.dumps({"sprites":[{"id":"x","file":"../outside.png"}]}))
            with self.assertRaises(ValueError):build(root,manifest,root/"out")
if __name__=="__main__":unittest.main()
