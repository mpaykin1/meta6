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

    def test_anonymous_arrow_second_loop_is_hard_failure(self):
        source = (
            "function render(){ requestAnimationFrame(render) }"
            "requestAnimationFrame(render); requestAnimationFrame(() => tick())"
        )
        report = analyze_text(source)
        self.assertEqual(report["status"], "FAIL")
        self.assertIn(
            {
                "rule": "multiple_global_raf_callbacks",
                "callbacks": ["render"],
                "anonymous_callbacks": 1,
            },
            report["issues"],
        )

    def test_single_anonymous_arrow_loop_is_allowed(self):
        report = analyze_text("requestAnimationFrame(() => tick())")
        self.assertEqual(report["status"], "STATIC_PASS_RUNTIME_UNKNOWN")
        self.assertEqual(report["anonymous_callbacks"], 1)

    def test_renderer_member_anonymous_raf_is_ignored(self):
        report = analyze_text("renderer.requestAnimationFrame(() => internal())")
        self.assertEqual(report["anonymous_callbacks"], 0)


if __name__ == "__main__":
    unittest.main()
