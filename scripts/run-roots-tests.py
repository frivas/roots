#!/usr/bin/env python3
"""
Run Roots automated tests via ElevenLabs Agent Testing.

Usage:
    python3 scripts/run-roots-tests.py                   # run all 43 tests
    python3 scripts/run-roots-tests.py 1.1 1.2           # run specific tests
    python3 scripts/run-roots-tests.py --section 3       # run all Chess tests
    python3 scripts/run-roots-tests.py --agent math      # run all Math tests
    python3 scripts/run-roots-tests.py --agent wellness  # run all Wellness tests

Sections map to agents:
    1 = Math Tutoring        4 = Storytelling
    2 = Language Tutoring    5 = Parent Wellness
    3 = Chess Coaching       6 = Progress Interpretation

Agent keys:
    math  language  chess  story  wellness  progress

Reads IDs from:  docs/agents/roots-test-ids.json
Writes back to:  docs/agents/roots-voice-agent-test-plan.md

Set ELEVENLABS_API_KEY in your environment before running:
    export ELEVENLABS_API_KEY=sk_...
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from collections import defaultdict
from datetime import datetime, timezone

API_KEY    = os.environ.get("ELEVENLABS_API_KEY", "sk_REPLACE_WITH_YOUR_KEY")
IDS_PATH   = os.path.join(os.path.dirname(__file__), "../docs/agents/roots-test-ids.json")
PLAN_PATH  = os.path.join(os.path.dirname(__file__), "../docs/agents/roots-voice-agent-test-plan.md")
PLAN_START = "<!-- LAST-RUN-START -->"
PLAN_END   = "<!-- LAST-RUN-END -->"

POLL_INTERVAL_SECS = 4
TIMEOUT_SECS       = 300   # 5 minutes max per agent batch


# ──────────────────────────────────────────────────────────────────────────────
# API helpers
# ──────────────────────────────────────────────────────────────────────────────

def api_get(path: str) -> dict:
    req = urllib.request.Request(
        f"https://api.elevenlabs.io{path}",
        headers={"xi-api-key": API_KEY},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def api_post(path: str, body: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io{path}",
        data=data,
        headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()}


# ──────────────────────────────────────────────────────────────────────────────
# Test loading
# ──────────────────────────────────────────────────────────────────────────────

def load_tests(
    filter_keys: set | None = None,
    filter_section: str | None = None,
    filter_agent: str | None = None,
) -> list[dict]:
    with open(IDS_PATH) as f:
        registry = json.load(f)

    tests = []
    for key, val in registry.items():
        if "test_id" not in val:
            continue
        if filter_keys and key not in filter_keys:
            continue
        if filter_section and not key.startswith(f"{filter_section}."):
            continue
        if filter_agent and val.get("agent") != filter_agent:
            continue
        tests.append({
            "key":      key,
            "test_id":  val["test_id"],
            "name":     val["name"],
            "agent":    val.get("agent", "unknown"),
            "agent_id": val.get("agent_id", ""),
        })

    def sort_key(t):
        parts = t["key"].split(".")
        return (int(parts[0]), float(parts[1]) if len(parts) > 1 else 0)

    return sorted(tests, key=sort_key)


# ──────────────────────────────────────────────────────────────────────────────
# Run + poll
# ──────────────────────────────────────────────────────────────────────────────

def run_agent_batch(agent_id: str, tests: list) -> str:
    """Submit a test batch for one agent. Returns the invocation ID."""
    payload = {"tests": [{"test_id": t["test_id"]} for t in tests]}
    resp = api_post(f"/v1/convai/agents/{agent_id}/run-tests", payload)
    if "error" in resp:
        print(f"  ERROR submitting batch for {agent_id}: {resp['error']}")
        sys.exit(1)
    return resp.get("id") or resp.get("invocation_id") or resp.get("test_invocation_id") or str(resp)


def poll_invocation(invocation_id: str, label: str) -> dict:
    deadline = time.time() + TIMEOUT_SECS
    print(f"  Polling [{label}] ({invocation_id})...")
    while time.time() < deadline:
        try:
            data = api_get(f"/v1/convai/test-invocations/{invocation_id}")
        except Exception as e:
            print(f"    Poll error: {e} — retrying...")
            time.sleep(POLL_INTERVAL_SECS)
            continue
        runs  = data.get("test_runs", [])
        done  = [r for r in runs if r.get("status") not in ("pending", "running", None)]
        total = len(runs)
        print(f"    {len(done)}/{total} complete...", end="\r", flush=True)
        if len(done) == total and total > 0:
            print()
            return data
        time.sleep(POLL_INTERVAL_SECS)
    print("\n  Timeout waiting for results.")
    return {}


# ──────────────────────────────────────────────────────────────────────────────
# Reporting
# ──────────────────────────────────────────────────────────────────────────────

def _sort_run_key(run, id_to_meta):
    tid  = run.get("test_id", "")
    meta = id_to_meta.get(tid, {})
    parts = meta.get("key", "99.99").split(".")
    return (int(parts[0]), float(parts[1]) if len(parts) > 1 else 0)


def _extract_verdict_reason(run: dict) -> tuple[str, str]:
    """Extract verdict and reason from the ElevenLabs response structure."""
    cond   = run.get("condition_result", {})
    result = cond.get("result", run.get("status", "unknown"))   # "success" / "failure"
    reason = cond.get("rationale", {}).get("summary", "")
    return result, reason


def print_results(all_runs: list, all_tests: list) -> tuple[int, int, int]:
    id_to_meta = {t["test_id"]: t for t in all_tests}
    passed = failed = errors = 0

    print("\n" + "=" * 80)
    print(f"  ROOTS TEST RUN RESULTS — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print("=" * 80)

    for run in sorted(all_runs, key=lambda r: _sort_run_key(r, id_to_meta)):
        tid           = run.get("test_id", "")
        meta          = id_to_meta.get(tid, {})
        verdict, reason = _extract_verdict_reason(run)

        if verdict in ("success", "pass", "passed", True):
            icon, passed = "PASS", passed + 1
        elif verdict in ("failure", "fail", "failed", False):
            icon, failed = "FAIL", failed + 1
        else:
            icon, errors = "ERR ", errors + 1

        print(f"\n[{meta.get('key', '?')}] {meta.get('name', tid)}")
        print(f"  Agent: {meta.get('agent', '?')}  |  Status: {icon}  |  verdict={verdict}")
        if reason:
            words = reason.split()
            line  = "  "
            for w in words:
                if len(line) + len(w) + 1 > 78:
                    print(line)
                    line = "  " + w
                else:
                    line = line + " " + w if line.strip() else "  " + w
            if line.strip():
                print(line)

    print("\n" + "=" * 80)
    print(f"  TOTAL: {passed} PASS  |  {failed} FAIL  |  {errors} ERROR")
    print("=" * 80 + "\n")
    return passed, failed, errors


def write_results_to_plan(
    all_runs: list,
    all_tests: list,
    passed: int,
    failed: int,
    errors: int,
    scope: str,
) -> None:
    id_to_meta   = {t["test_id"]: t for t in all_tests}
    now          = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    total        = passed + failed + errors
    verdict_line = "ALL PASS" if failed == 0 and errors == 0 else f"{failed} FAIL  {errors} ERROR"

    lines = [
        f"**{now}** — scope: {scope} — {total} tests — {verdict_line}",
        "",
        "| # | Test | Result | Evaluator note |",
        "|---|------|--------|----------------|",
    ]

    flags = []

    for run in sorted(all_runs, key=lambda r: _sort_run_key(r, id_to_meta)):
        tid             = run.get("test_id", "")
        meta            = id_to_meta.get(tid, {})
        verdict, reason = _extract_verdict_reason(run)
        key             = meta.get("key", "?")
        name            = meta.get("name", tid)

        if verdict in ("pass", "passed", True):
            icon = "PASS"
        elif verdict in ("fail", "failed", False):
            icon = "**FAIL**"
            flags.append((key, name, reason))
        else:
            icon = "ERR"
            flags.append((key, name, reason or "no result returned"))

        short = (reason[:90] + "…") if len(reason) > 90 else reason
        lines.append(f"| {key} | {name} | {icon} | {short} |")

    if flags:
        lines += ["", "**Needs attention:**", ""]
        for key, name, reason in flags:
            lines.append(f"- **[{key}] {name}**")
            if reason:
                lines.append(f"  - {reason}")

    block = PLAN_START + "\n" + "\n".join(lines) + "\n" + PLAN_END

    with open(PLAN_PATH) as f:
        content = f.read()

    start_idx = content.find(PLAN_START)
    end_idx   = content.find(PLAN_END)

    if start_idx == -1 or end_idx == -1:
        print("Warning: could not find LAST-RUN markers in test plan — results not written.")
        return

    content = content[:start_idx] + block + content[end_idx + len(PLAN_END):]

    with open(PLAN_PATH, "w") as f:
        f.write(content)

    print(f"Results written to {PLAN_PATH}")


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    if API_KEY == "sk_REPLACE_WITH_YOUR_KEY":
        print("ERROR: set ELEVENLABS_API_KEY in your environment first.")
        sys.exit(1)

    args = sys.argv[1:]
    if "--section" in args:
        idx     = args.index("--section")
        section = args[idx + 1]
        tests   = load_tests(filter_section=section)
        scope   = f"section {section}"
    elif "--agent" in args:
        idx   = args.index("--agent")
        agent = args[idx + 1]
        tests = load_tests(filter_agent=agent)
        scope = f"agent:{agent}"
    elif args:
        tests = load_tests(filter_keys=set(args))
        scope = ", ".join(args)
    else:
        tests = load_tests()
        scope = "full suite"

    if not tests:
        print("No tests found. Run create-roots-tests.py first, or check your filter.")
        sys.exit(1)

    print(f"Running {len(tests)} tests ({scope})...")
    for t in tests:
        print(f"  [{t['key']}] {t['name']}")

    # Group by agent_id — each agent needs its own run-tests call
    by_agent: dict[str, list] = defaultdict(list)
    for t in tests:
        by_agent[t["agent_id"]].append(t)

    # Submit batches
    invocations: dict[str, dict] = {}
    for agent_id, agent_tests in by_agent.items():
        label = agent_tests[0]["agent"]
        print(f"\n  Submitting {len(agent_tests)} tests for [{label}]...")
        inv_id = run_agent_batch(agent_id, agent_tests)
        print(f"  Invocation ID: {inv_id}")
        invocations[agent_id] = {"inv_id": inv_id, "label": label, "tests": agent_tests}
        time.sleep(0.5)

    # Poll all invocations
    all_runs: list = []
    for agent_id, info in invocations.items():
        data = poll_invocation(info["inv_id"], info["label"])
        all_runs.extend(data.get("test_runs", []))

    if not all_runs:
        print("No results returned.")
        sys.exit(1)

    passed, failed, errors = print_results(all_runs, tests)
    write_results_to_plan(all_runs, tests, passed, failed, errors, scope)
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
