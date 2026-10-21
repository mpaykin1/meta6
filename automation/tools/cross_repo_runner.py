#!/usr/bin/env python3
"""Bounded local orchestration for existing five automation slots; no scheduler creation."""
import argparse
import json
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLS = ROOT / "automation/tools"
DEFAULT_REPOS = ("mpaykin1/meta6", "mpaykin1/World_server", "mpaykin1/world-server-tech-lab")

def plan(repos, topic, skip_network):
    commands = []
    if not skip_network:
        commands.append([sys.executable, str(TOOLS/"cross_repo_inventory.py"), "--max-repos", "2", "--max-branches", "40"])
        commands.append([sys.executable, str(TOOLS/"cross_repo_pr_evidence.py"),
                         *[arg for repo in repos for arg in ("--repo", repo)], "--limit", "10"])
    commands.append([sys.executable, str(TOOLS/"cross_repo_recall.py")])
    commands.append([sys.executable, str(TOOLS/"memory_preflight.py"), "--topic", topic])
    return commands

def run(commands, executor=subprocess.run):
    results = []
    for command in commands:
        outcome = executor(command, cwd=ROOT, capture_output=True, text=True, timeout=120)
        results.append({"step": pathlib.Path(command[1]).name, "returncode": outcome.returncode,
                        "stdout": outcome.stdout[-3000:], "stderr": outcome.stderr[-1000:]})
        if outcome.returncode:
            break
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", required=True)
    parser.add_argument("--repo", action="append")
    parser.add_argument("--offline", action="store_true", help="Use existing verified local ledger, skip GitHub network")
    parser.add_argument("--plan", action="store_true", help="Print exact bounded commands, do not execute")
    args = parser.parse_args()
    if not args.topic.strip():
        parser.error("--topic cannot be empty")
    repos = args.repo or list(DEFAULT_REPOS)
    if any(len(repo.split("/")) != 2 for repo in repos):
        parser.error("Repositories must be owner/repo")
    commands = plan(repos, args.topic, args.offline)
    if args.plan:
        print(json.dumps({"commands": commands, "coverage": "PARTIAL"}, indent=2))
        return
    results = run(commands)
    print(json.dumps({"status": "PASS" if all(r["returncode"] == 0 for r in results) else "INCOMPLETE",
                      "coverage": "PARTIAL", "results": results}, ensure_ascii=False, indent=2))
    if any(r["returncode"] for r in results):
        raise SystemExit(2)
if __name__ == "__main__":
    main()
