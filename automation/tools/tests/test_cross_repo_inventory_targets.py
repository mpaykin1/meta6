import importlib.util
import pathlib
import unittest
from unittest.mock import patch

P = pathlib.Path(__file__).resolve().parents[1] / "cross_repo_inventory.py"
spec = importlib.util.spec_from_file_location("targeted_inventory", P)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TargetedInventoryTests(unittest.TestCase):
    def test_selected_repositories_only(self):
        names = ["mpaykin1/meta6", "mpaykin1/World_server", "mpaykin1/world-server-tech-lab"]
        def fake_fetch(path):
            name = path.removeprefix("/repos/")
            return {"full_name": name, "default_branch": "main"}
        def fake_pages(path, maximum):
            self.assertTrue(path.startswith("/repos/"), path)
            yield {"name": "main", "commit": {"sha": "a" * 40}}
        with patch.object(mod, "fetch", side_effect=fake_fetch), patch.object(mod, "pages", side_effect=fake_pages):
            result = mod.scan("mpaykin1", 3, 75, {}, names)
        self.assertEqual(set(result["repositories"]), set(names))
        self.assertEqual(result["repository_count"], 3)
        self.assertEqual(result["coverage"], "PARTIAL")

    def test_reject_other_owner(self):
        with self.assertRaises(ValueError):
            mod.scan("mpaykin1", 3, 75, {}, ["someone/other"])

if __name__ == "__main__":
    unittest.main()
