import tempfile
import unittest
from pathlib import Path
from PIL import Image
from abyss_style_gate import audit

class StyleGateTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        d=Path(self.tmp.name)
        self.frame=d/"frame.png";self.body=d/"body.png";self.light=d/"light.png"
        im=Image.new("RGBA",(20,20),(0,0,0,255))
        bm=Image.new("L",(20,20),0)
        lm=Image.new("L",(20,20),0)
        # 4 illuminated pixels of 400 = 99% darkness.
        for x in range(4):
            im.putpixel((x+8,10),(229,120,7,255))
            lm.putpixel((x+8,10),255)
        for x in range(6,14):
            bm.putpixel((x,11),255)
        im.save(self.frame);bm.save(self.body);lm.save(self.light)
    def tearDown(self):self.tmp.cleanup()
    def test_compliant_art(self):
        r=audit(self.frame,self.body,self.light)
        self.assertTrue(r["ok"],r)
        self.assertIn("independent_part_motion",r["unverified"])
    def test_svg_like_unapproved_color_fails(self):
        im=Image.open(self.frame)
        im.putpixel((8,10),(255,121,24,255))
        im.save(self.frame)
        self.assertFalse(audit(self.frame,self.body,self.light)["checks"]["seven_color_palette"])
    def test_translucent_body_fails(self):
        im=Image.open(self.frame)
        im.putpixel((7,11),(0,0,0,200))
        im.save(self.frame)
        self.assertFalse(audit(self.frame,self.body,self.light)["checks"]["opaque_black_unlit_body"])
    def test_bright_background_fails(self):
        im=Image.new("RGBA",(20,20),(229,120,7,255))
        im.save(self.frame)
        self.assertFalse(audit(self.frame,self.body,self.light)["checks"]["darkness_ge_90_percent"])
    def test_no_light_fails(self):
        Image.new("L",(20,20),0).save(self.light)
        self.assertFalse(audit(self.frame,self.body,self.light)["checks"]["illuminated_half_ge_75_percent"])

if __name__=="__main__":unittest.main()
