import re
import unittest
from pathlib import Path

from build_single_loop import build

SOURCE = (Path(__file__).resolve().parents[2] / 'abyss-glow' / 'stand' / 'index.html').read_bytes()
PNG_RE = rb'"(assets/[^"\s]+\.png)":"data:image/png;base64,([A-Za-z0-9+/=]+)"'


class SingleLoopBuildTests(unittest.TestCase):
    def test_deterministic(self):
        self.assertEqual(build(SOURCE), build(SOURCE))

    def test_preserves_original_textures(self):
        before = re.findall(PNG_RE, SOURCE)
        after = re.findall(PNG_RE, build(SOURCE))
        self.assertEqual(before, after)
        self.assertEqual(len(before), 4)

    def test_one_gameplay_loop(self):
        result = build(SOURCE)
        self.assertEqual(result.count(b'requestAnimationFrame(q0)'), 2)
        self.assertNotIn(b'requestAnimationFrame(D)', result)

    def test_protects_original_source_sha(self):
        with self.assertRaises(ValueError):
            build(SOURCE + b' ')


if __name__ == '__main__':
    unittest.main()
