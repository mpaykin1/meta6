import json
import tempfile
import unittest
from pathlib import Path
from validate_abyss_handoff import SLOTS,validate

A="a"*40
B="b"*40

class HandoffTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.root=Path(self.tmp.name)
        self.cycle=self.root/"20261023T22"
        self.cycle.mkdir()
        for i,slot in enumerate(SLOTS):
            obj={"cycle":self.cycle.name,"slot":slot,"status":"OK","head_sha":A,"actor_id":"agent-"+slot}
            if i:obj["previous_sha"]=A
            if slot=="40-qa":obj.update(reviewed_sha=A,reviewer_role="QA",approved=True)
            if slot=="50-director":obj.update(merged=False)
            (self.cycle/f"{slot}.json").write_text(json.dumps(obj))
    def tearDown(self):self.tmp.cleanup()
    def change(self,slot,**updates):
        p=self.cycle/f"{slot}.json"
        d=json.loads(p.read_text());d.update(updates);p.write_text(json.dumps(d))
    def test_complete_cycle(self):self.assertEqual(validate(self.root),[])
    def test_missing_slot(self):
        (self.cycle/"30-test.json").unlink()
        self.assertTrue(any("MISSING_HANDOFF" in e for e in validate(self.root)))
    def test_wrong_previous_sha(self):
        self.change("30-test",previous_sha=B)
        self.assertTrue(any("previous_sha mismatch" in e for e in validate(self.root)))
    def test_qa_not_approved(self):
        self.change("40-qa",approved=False)
        self.assertTrue(any("QA approval" in e for e in validate(self.root)))
    def test_qa_wrong_sha(self):
        self.change("40-qa",reviewed_sha=B)
        self.assertTrue(any("exact SHA" in e for e in validate(self.root)))
    def test_build_cannot_approve_own_work(self):
        self.change("40-qa",actor_id="agent-15-build")
        self.assertTrue(any("QA actor must differ" in e for e in validate(self.root)))
    def test_missing_entire_cycle_fails_when_required(self):
        self.assertTrue(any("MISSING_HANDOFF" in e for e in validate(self.root/"absent",require_cycle=True)))
    def test_merge_without_ci(self):
        self.change("50-director",merged=True,merge_sha=A,ci_conclusion="failure")
        self.assertTrue(any("green CI" in e for e in validate(self.root)))
    def test_blocked_dependency(self):
        self.change("15-build",status="BLOCKED")
        self.assertTrue(any("dependency was not OK" in e for e in validate(self.root)))

if __name__=="__main__":unittest.main()
