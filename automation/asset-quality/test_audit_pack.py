import hashlib, json, tempfile, unittest
from pathlib import Path
from audit_pack import analyze
class AuditPackTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        (self.root/"sprite.png").write_bytes(b"sprite")
        (self.root/"original.png").write_bytes(b"original")
        self.entry={"id":"fish0","file":"sprite.png","source":"original.png","type":"fish","stage":0,"anim":"idle","frame":0,"frames":8,"fps":8,"pivot":[0,0],"hitbox":[0,0,1,1],"atlas":"a","rect":[0,0,2,2],"layers":{}}
        self.manifest=self.root/"manifest.json"
    def tearDown(self):self.tmp.cleanup()
    def check(self,entries,requirements=None):
        self.manifest.write_text(json.dumps({"sprites":entries}))
        return analyze(self.root,self.manifest,requirements)
    def test_valid_and_provenance(self):
        r=self.check([self.entry])
        self.assertEqual(r["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
        self.assertEqual(len(r["provenance"][0]["sha256"]),64)
    def test_duplicate(self):
        self.assertIn("sprite_id",[x["rule"] for x in self.check([self.entry,self.entry])["issues"]])
    def test_escape(self):
        self.entry["source"]="../private"
        self.assertIn("path_escape",[x["rule"] for x in self.check([self.entry])["issues"]])
    def test_missing_stages(self):
        req=self.root/"req.json";req.write_text(json.dumps({"stages":[0,1,2,3,4],"min_creature_types":1}))
        self.assertIn("missing_stages",[x["rule"] for x in self.check([self.entry],req)["issues"]])
    def test_frame_bounds(self):
        self.entry["frame"]=9
        self.assertIn("frame_bounds",[x["rule"] for x in self.check([self.entry])["issues"]])
    def test_unverified_not_pass(self):
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[{"id":"A","test":"visual","status":"UNKNOWN"}]}))
        r=self.check([self.entry],req)
        self.assertEqual(r["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
        self.assertTrue(r["unknown"])
    def test_required_runtime_gate_cannot_be_omitted(self):
        req=self.root/"req.json";req.write_text(json.dumps({"required_requirement_ids":["COORDINATES","LIGHTING"],"requirements":[{"id":"COORDINATES","test":"live scene","status":"UNKNOWN"}]}))
        r=self.check([self.entry],req)
        self.assertIn({"rule":"missing_requirement","id":"LIGHTING"},r["issues"])
    def test_duplicate_requirement_id_rejected(self):
        item={"id":"LIGHTING","test":"8-way live render","status":"UNKNOWN"}
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[item,item]}))
        self.assertIn("duplicate_requirement",[x["rule"] for x in self.check([self.entry],req)["issues"]])
    def test_verified_status_requires_hashed_evidence(self):
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[{"id":"LIGHTING","test":"live render","status":"STATIC_PASS"}]}))
        self.assertIn({"rule":"requirement_evidence_missing","id":"LIGHTING"},self.check([self.entry],req)["issues"])
    def test_verified_status_accepts_matching_hashed_evidence(self):
        evidence=self.root/"lighting.json";evidence.write_bytes(b"sealed live capture metadata")
        record={"path":"lighting.json","sha256":hashlib.sha256(evidence.read_bytes()).hexdigest()}
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[{"id":"LIGHTING","test":"live render","status":"STATIC_PASS","evidence":[record]}]}))
        self.assertNotIn("requirement_evidence_invalid",[x["rule"] for x in self.check([self.entry],req)["issues"]])
    def test_verified_status_rejects_unsafe_or_modified_evidence(self):
        evidence=self.root/"lighting.json";evidence.write_bytes(b"modified")
        records=[{"path":"../outside.json","sha256":"0"*64},{"path":"lighting.json","sha256":"0"*64}]
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[{"id":"LIGHTING","test":"live render","status":"OWNER_APPROVED","evidence":records}]}))
        issues=self.check([self.entry],req)["issues"]
        self.assertEqual(sum(x["rule"]=="requirement_evidence_invalid" for x in issues),2)
if __name__=="__main__":unittest.main()

