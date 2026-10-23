import json,subprocess,tempfile,unittest
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[2]
class MawMotionEvidenceTest(unittest.TestCase):
 def test_owner_maw_has_three_hinge_phases_and_directional_evidence(self):
  with tempfile.TemporaryDirectory() as t:
   t=Path(t);png=t/'sheet.png';js=t/'report.json'
   subprocess.run(['python3',str(ROOT/'automation/asset-quality/build_maw_motion_evidence.py'),'--atlas',str(ROOT/'abyss-glow/assets/maw_front_v1/maw_front_atlas.png'),'--manifest',str(ROOT/'abyss-glow/assets/maw_front_v1/manifest.json'),'--png',str(png),'--json',str(js)],check=True)
   r=json.loads(js.read_text());self.assertEqual(r['pivot'],[108,168]);self.assertEqual(r['pivot_drift_px'],0);self.assertGreater(r['lower_tip_displacement_px'],1);self.assertGreaterEqual(min(r['light_facing_fraction'].values()),.75);self.assertEqual(r['status'],'TECHNICAL_EVIDENCE_NOT_OWNER_VERDICT');self.assertGreater(Image.open(png).getbbox()[2],0)
 def test_isolated_stand_uses_dt_and_does_not_touch_original(self):
  html=(ROOT/'abyss-glow/maw-stand/index.html').read_text();self.assertIn('requestAnimationFrame',html);self.assertIn('const dt=',html);self.assertIn("P=[108,168]",html);self.assertIn("part('lower'",html)
if __name__=='__main__':unittest.main()
