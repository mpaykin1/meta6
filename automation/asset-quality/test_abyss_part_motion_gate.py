import unittest
from abyss_part_motion_gate import evaluate


class MotionGateTests(unittest.TestCase):
    def setUp(self):
        self.record = {"parts":["head","body","tail"],"samples":[
            {"time":0,"anchors":{"head":[0,0],"body":[5,0],"tail":[10,0]}},
            {"time":0.1,"anchors":{"head":[1,0],"body":[6,2],"tail":[11,-2]}},
            {"time":0.2,"anchors":{"head":[2,0],"body":[7,-1],"tail":[12,3]}}
        ]}

    def test_two_independent_parts_pass(self):
        self.assertEqual(evaluate(self.record)["status"],"PASS_PART_ANCHOR_MOTION")

    def test_whole_image_translation_fails(self):
        for sample in self.record["samples"]:
            t=sample["time"]*10
            sample["anchors"]={"head":[t,0],"body":[t+5,0],"tail":[t+10,0]}
        self.assertEqual(evaluate(self.record)["status"],"FAIL")

    def test_frozen_image_fails(self):
        a=self.record["samples"][0]["anchors"]
        for sample in self.record["samples"]:sample["anchors"]=a
        self.assertEqual(evaluate(self.record)["status"],"FAIL")

    def test_only_one_part_wiggling_fails(self):
        for sample in self.record["samples"]:
            sample["anchors"]["body"]=[5,0]
            sample["anchors"]["head"]=[0,0]
        self.assertEqual(evaluate(self.record)["status"],"FAIL")

    def test_missing_anchor_fails(self):
        del self.record["samples"][1]["anchors"]["tail"]
        self.assertEqual(evaluate(self.record)["status"],"FAIL")

    def test_boolean_anchor_coordinate_fails(self):\n        self.record["samples"][0]["anchors"]["head"][0] = False\n        self.record["samples"][1]["anchors"]["head"][0] = True\n        self.assertEqual(evaluate(self.record)["status"], "FAIL")\n\nif __name__=="__main__":unittest.main()
