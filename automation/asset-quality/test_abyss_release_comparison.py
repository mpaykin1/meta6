import unittest
from abyss_release_comparison import evaluate


class ReleaseComparisonTests(unittest.TestCase):
    def setUp(self):
        self.original={'status':'PASS_SOFTWARE_BROWSER_NOT_DEVICE'}
        self.preview={'status':'PASS_BROWSER_EMULATION','profiles':[
            {'profile':'desktop','assets':5,'frames_advanced':12,'touch_or_mouse':1},
            {'profile':'portrait-touch','assets':5,'frames_advanced':9,'touch_or_mouse':1}
        ]}

    def test_green_ci_is_not_artistic_approval(self):
        result=evaluate(self.original,self.preview)
        self.assertEqual(result['status'],'PASS_CI_NOT_ARTISTIC_APPROVAL')
        self.assertEqual(result['physical_iphone'],'UNKNOWN')
        self.assertFalse(result['integrated_into_original_game'])

    def test_missing_asset_fails(self):
        self.preview['profiles'][0]['assets']=4
        self.assertIn('desktop_assets_and_motion',evaluate(self.original,self.preview)['failures'])

    def test_frozen_animation_fails(self):
        self.preview['profiles'][1]['frames_advanced']=0
        self.assertIn('portrait_assets_and_motion',evaluate(self.original,self.preview)['failures'])

    def test_touch_failure_fails(self):
        self.preview['profiles'][1]['touch_or_mouse']=0
        self.assertIn('touch_input',evaluate(self.original,self.preview)['failures'])


if __name__=='__main__':
    unittest.main()
