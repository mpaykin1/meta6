#!/usr/bin/env python3
"""Conservative static guard for the ABYSS single-loop runtime contract."""
import argparse
import json
import pathlib
import re
import sys


GLOBAL_RAF_CALL = re.compile(r"(?<![\w.$])requestAnimationFrame\s*\(")
GLOBAL_RAF_CALLBACK = re.compile(
    r"(?<![\w.$])requestAnimationFrame\s*\(\s*([A-Za-z_$][\w$]*)\s*\)"
)


def analyze_text(source):
    named_occurrences = GLOBAL_RAF_CALLBACK.findall(source)
    callbacks = sorted(set(named_occurrences))
    anonymous_callbacks = max(
        0, len(GLOBAL_RAF_CALL.findall(source)) - len(named_occurrences)
    )
    issues = []
    if len(callbacks) + anonymous_callbacks > 1:
        issue = {"rule": "multiple_global_raf_callbacks", "callbacks": callbacks}
        if anonymous_callbacks:
            issue["anonymous_callbacks"] = anonymous_callbacks
        issues.append(issue)
    return {
        "status": "FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN",
        "callbacks": callbacks,
        "anonymous_callbacks": anonymous_callbacks,
        "issues": issues,
        "unknown": [
            "whether callbacks execute in the browser",
            "renderer/composer instance count",
            "WebGL errors and performance",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--html", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()
    source = pathlib.Path(args.html).read_text(encoding="utf-8")
    report = analyze_text(source)
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        pathlib.Path(args.output).write_text(rendered, encoding="utf-8")
    print(rendered)
    return int(report["status"] == "FAIL")


if __name__ == "__main__":
    sys.exit(main())
