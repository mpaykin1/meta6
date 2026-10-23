#!/usr/bin/env python3
"""Conservative static guard for the ABYSS single-loop runtime contract."""
import argparse
import json
import pathlib
import re
import sys


GLOBAL_RAF_CALLBACK = re.compile(
    r"(?<![\w.$])requestAnimationFrame\s*\(\s*([A-Za-z_$][\w$]*)\s*\)"
)


def analyze_text(source):
    callbacks = sorted(set(GLOBAL_RAF_CALLBACK.findall(source)))
    issues = []
    if len(callbacks) > 1:
        issues.append({"rule": "multiple_global_raf_callbacks", "callbacks": callbacks})
    return {
        "status": "FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN",
        "callbacks": callbacks,
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
