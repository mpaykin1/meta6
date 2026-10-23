import unittest

from check_runtime_pipeline import analyze_text


class RuntimePipelineTests(unittest.TestCase):
    def test_single_global_raf_callback_is_allowed(self):
        source = "function render(){ draw(); requestAnimationFrame(render) } requestAnimationFrame(render)"
        self.assertEqual(analyze_text(source)["status"], "STATIC_PASS_RUNTIME_UNKNOWN")

    def test_second_global_raf_callback_is_hard_failure(self):
        source = (
            "function render(){ draw(); requestAnimationFrame(render) }"
            "requestAnimationFrame(render);"
            "(function fps(){ count++; requestAnimationFrame(fps) })()"
        )
        report = analyze_text(source)
        self.assertEqual(report["status"], "FAIL")
        self.assertIn(
            {"rule": "multiple_global_raf_callbacks", "callbacks": ["fps", "render"]},
            report["issues"],
        )

    def test_renderer_member_raf_is_not_an_application_loop(self):
        source = (
            "function render(){ requestAnimationFrame(render) }"
            "requestAnimationFrame(render); renderer.requestAnimationFrame(internal)"
        )
        self.assertEqual(analyze_text(source)["callbacks"], ["render"])


if __name__ == "__main__":
    unittest.main()
