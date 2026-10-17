#!/usr/bin/env python3
"""Static repository checks for canonical FlowForge-AI n8n workflow exports.

Run from repository root: python scripts/validate_workflows.py
This does not import or execute workflows in n8n or call provider APIs.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / "workflows"
SYSTEM = ROOT / "system"
EXPECTED = [
    "01-lead-capture-crm",
    "02-lead-scoring-routing",
    "03-email-follow-up-sequence",
    "04-inbox-triage-assistant",
    "05-customer-support-desk",
    "06-faq-human-handoff",
    "07-meeting-booking-system",
    "08-meeting-reminders",
    "09-client-onboarding",
    "10-invoice-payment-reminders",
    "11-content-creation-approval",
    "12-instagram-publishing-pipeline",
    "13-youtube-publishing-assistant",
    "14-content-repurposing",
    "15-newsletter-campaign-builder",
    "16-weekly-business-report",
    "17-feedback-routing",
    "18-workflow-error-monitor",
    "19-api-health-monitor",
    "20-telegram-business-assistant",
]
REQUIRED = ("README.md", "workflow.json", "Code.gs")
LEGACY_MIRRORS = ("apps-script", "workflow-guides")


def validate_json(path: Path):
    errors = []
    warnings = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"invalid JSON: {exc}"], warnings
    if not isinstance(data, dict):
        return ["workflow root must be an object"], warnings
    if data.get("active") is not False:
        errors.append("shareable export must explicitly set active=false")
    nodes = data.get("nodes")
    connections = data.get("connections")
    if not isinstance(nodes, list) or not nodes:
        errors.append("nodes must be a nonempty array")
        nodes = []
    if not isinstance(connections, dict):
        errors.append("connections must be an object")
        connections = {}

    names, ids = [], []
    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"node index {index} is not an object")
            continue
        name, node_id = node.get("name"), node.get("id")
        if not isinstance(name, str) or not name.strip():
            errors.append(f"node index {index} has no name")
        else:
            names.append(name)
        if not isinstance(node_id, str) or not node_id.strip():
            errors.append(f"node {name or index!r} has no id")
        else:
            ids.append(node_id)
        if not isinstance(node.get("type"), str) or not node.get("type"):
            errors.append(f"node {name or index!r} has no type")
        if not isinstance(node.get("parameters"), dict):
            errors.append(f"node {name or index!r} has no parameters object")
        if node.get("type") == "n8n-nodes-base.noOp":
            warnings.append(f"{name or index}: No Operation placeholder requires review")
        if node.get("type") == "n8n-nodes-base.executeWorkflow":
            workflow_id = node.get("parameters", {}).get("workflowId", {})
            if isinstance(workflow_id, dict) and str(workflow_id.get("value", "")).startswith("REPLACE_"):
                warnings.append(f"{name or index}: child workflow ID must be selected in n8n")

    if len(names) != len(set(names)):
        errors.append("duplicate node names")
    if len(ids) != len(set(ids)):
        errors.append("duplicate node IDs")
    name_set = set(names)
    for source, ports in connections.items():
        if source not in name_set:
            errors.append(f"connection source {source!r} does not match a node")
        if not isinstance(ports, dict):
            errors.append(f"connections for {source!r} must be an object")
            continue
        for output_name, groups in ports.items():
            if not isinstance(groups, list):
                errors.append(f"{source!r}.{output_name} must be a list")
                continue
            for group in groups:
                if not isinstance(group, list):
                    errors.append(f"{source!r}.{output_name} output group must be a list")
                    continue
                for edge in group:
                    target = edge.get("node") if isinstance(edge, dict) else None
                    if target not in name_set:
                        errors.append(f"{source!r} points to missing node {target!r}")

    for node in nodes:
        parameters = json.dumps(node.get("parameters", {}), ensure_ascii=False)
        if re.search(r"REPLACE_WITH_[A-Z0-9_]+", parameters):
            warnings.append(f"{node.get('name', 'unnamed node')}: external configuration placeholder remains")
    return errors, list(dict.fromkeys(warnings))


def main():
    failures = 0
    checked = 0
    warning_count = 0
    seen_folders = {p.name for p in WORKFLOWS.iterdir() if p.is_dir()} if WORKFLOWS.exists() else set()

    if set(EXPECTED) != seen_folders:
        failures += 1
        missing = sorted(set(EXPECTED) - seen_folders)
        extra = sorted(seen_folders - set(EXPECTED))
        print(f"FAIL canonical workflow folders; missing={missing}; extra={extra}")

    for mirror in LEGACY_MIRRORS:
        if (ROOT / mirror).exists():
            failures += 1
            print(f"FAIL duplicate mirror directory remains: {mirror}")

    legacy_jsons = sorted(WORKFLOWS.glob("[0-9][0-9]-*.json"))
    if legacy_jsons:
        failures += 1
        print("FAIL root-level duplicate workflow JSONs remain:")
        for path in legacy_jsons:
            print(f"  - {path.relative_to(ROOT)}")

    for slug in EXPECTED:
        folder = WORKFLOWS / slug
        for required in REQUIRED:
            if not (folder / required).is_file():
                failures += 1
                print(f"FAIL {folder.relative_to(ROOT)}/{required} missing")
        path = folder / "workflow.json"
        if path.is_file():
            checked += 1
            errors, warnings = validate_json(path)
            if errors:
                failures += 1
                print(f"FAIL {path.relative_to(ROOT)}")
                for error in errors:
                    print(f"  - {error}")
            else:
                print(f"PASS {path.relative_to(ROOT)} (static structure)")
            for warning in warnings:
                warning_count += 1
                print(f"WARN {path.relative_to(ROOT)}: {warning}")

    system_paths = sorted(SYSTEM.glob("*.json")) if SYSTEM.exists() else []
    if len(system_paths) != 6:
        failures += 1
        print(f"FAIL expected 6 system workflow JSON exports, found {len(system_paths)}")
    for path in system_paths:
        checked += 1
        errors, warnings = validate_json(path)
        if errors:
            failures += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path.relative_to(ROOT)} (static structure)")
        for warning in warnings:
            warning_count += 1
            print(f"WARN {path.relative_to(ROOT)}: {warning}")

    print(f"\nResult: {checked} JSON exports checked; {failures} failures; {warning_count} warnings.")
    print("Static checks do not prove n8n import compatibility, credentials, or live execution.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
