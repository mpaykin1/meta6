import json, tempfile, unittest
from pathlib import Path
from PIL import Image
from validate import inspect, PALETTE

class QualityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.root=Path(self.tmp.name)
        im=Image.new("RGBA",(12,12),(0,0,0,0))
        for y in range(2,10):
            for x in range(2,10): im.putpixel((x,y),(0,0,0,255))
        im.save(self.root/"sprite.png")
        for name in ("body","detail","normal","emissive"): im.save(self.root/(name+".png"))
        self.entry={"id":"fish_s0_idle_0","file":"sprite.png","kind":"creature","type":"fish","stage":0,"anim":"idle","frame":0,"frames":1,"fps":8,"loop":True,"sizeArt":[12,12],"pivot":[6,6],"hitbox":{"circle":[6,6,4]},"atlas":"fish","rect":[0,0,12,12],"source":"test","layers":{k:k+".png" for k in ("body","detail","normal","emissive")}}
    def tearDown(self): self.tmp.cleanup()
    def check(self, entry):
        path=self.root/"manifest.json"
        path.write_text(json.dumps({"sprites":[entry]}))
        return inspect(self.root,path)
    def test_valid(self): self.assertEqual(self.check(self.entry)["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
    def test_palette(self):
        im=Image.open(self.root/"sprite.png");im.putpixel((5,5),(12,34,56,255));im.save(self.root/"sprite.png")
        self.assertIn("seven_color_palette",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_transparency(self):
        im=Image.open(self.root/"sprite.png")
        for y in range(2,10):
            for x in range(2,10):im.putpixel((x,y),(0,0,0,120))
        im.save(self.root/"sprite.png")
        self.assertIn("opaque_body_95pct",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_missing_layer(self):
        self.entry["layers"].pop("normal")
        self.assertIn("layer_normal",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_path_traversal(self):
        self.entry["file"]="../secret.png"
        self.assertIn("file_path",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_invalid_frames(self):
        self.entry["frames"]="bad"
        self.assertIn("frames",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_padding(self):
        im=Image.open(self.root/"sprite.png");im.putpixel((0,0),(0,0,0,255));im.save(self.root/"sprite.png")
        self.assertIn("padding_2px",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_boolean_stage_rejected(self):
        self.entry["stage"]=True
        self.assertIn("stage_0_4",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_boolean_frames_rejected(self):
        self.entry["frames"]=True
        self.assertIn("frames",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_empty_sprite_path_rejected(self):
        self.entry["file"]=""
        self.assertIn("file_path",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_size_art_must_match_png(self):
        self.entry["sizeArt"]=[16,12]
        self.assertIn("sizeArt_matches_file",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_pivot_must_be_inside_frame(self):
        self.entry["pivot"]=[12,6]
        self.assertIn("pivot_inside_frame",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_rect_size_must_match_png(self):
        self.entry["rect"]=[0,0,11,12]
        self.assertIn("rect_size_matches_file",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_boolean_pivot_rejected(self):
        self.entry["pivot"]=[True,6]
        self.assertIn("invalid_pivot",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_incomplete_animation_sequence_rejected(self):
        self.entry["frames"]=2
        self.assertIn("sequence_complete",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_pivot_drift_over_one_pixel_rejected(self):
        self.entry["frames"]=2
        second=dict(self.entry,id="fish_s0_idle_1",frame=1,pivot=[8,6])
        path=self.root/"manifest.json"
        path.write_text(json.dumps({"sprites":[self.entry,second]}))
        self.assertIn("pivot_drift_1px",[x["rule"] for x in inspect(self.root,path)["issues"]])
    def test_declared_root_motion_allows_pivot_drift(self):
        self.entry.update(frames=2,rootMotion=True)
        second=dict(self.entry,id="fish_s0_idle_1",frame=1,pivot=[8,6])
        path=self.root/"manifest.json"
        path.write_text(json.dumps({"sprites":[self.entry,second]}))
        self.assertNotIn("pivot_drift_1px",[x["rule"] for x in inspect(self.root,path)["issues"]])
    def test_loop_and_fps_are_typed(self):
        self.entry["loop"]="yes"
        self.entry["fps"]=True
        rules=[x["rule"] for x in self.check(self.entry)["issues"]]
        self.assertIn("animation_loop",rules)
        self.assertIn("animation_fps",rules)
    def disconnected_sprite(self):
        im=Image.new("RGBA",(16,12),(0,0,0,0))
        for y in range(2,10):
            for x in range(2,7): im.putpixel((x,y),(0,0,0,255))
            for x in range(9,14): im.putpixel((x,y),(0,0,0,255))
        im.save(self.root/"sprite.png")
        self.entry["sizeArt"]=[16,12]
        self.entry["rect"]=[0,0,16,12]
    def test_undeclared_neighbor_component_rejected(self):
        self.disconnected_sprite()
        self.assertIn("undeclared_components",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_declared_part_allows_second_component(self):
        self.disconnected_sprite()
        self.entry["parts"]=[{"id":"tail"}]
        self.assertNotIn("undeclared_components",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_parts_must_be_a_list(self):
        self.entry["parts"]={"id":"tail"}
        self.assertIn("invalid_parts",[x["rule"] for x in self.check(self.entry)["issues"]])
if __name__=="__main__":unittest.main()

