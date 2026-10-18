#!/usr/bin/env python3
"""Static repository checks for canonical FlowForge-AI n8n exports.

Run from repository root: python scripts/validate_workflows.py
This reads files only; it does not import or execute anything in n8n.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / "workflows"
SYSTEM = ROOT / "system"

EXPECTED_WORKFLOWS = [
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
REQUIRED_WORKFLOW_FILES = ("README.md", "workflow.json", "Code.gs")
EXPECTED_SYSTEM_FILES = {
    "00-main-ingress.json",
    "01-request-processor.json",
    "90-central-error-handler.json",
}
LEGACY_MIRRORS = ("apps-script", "workflow-guides")


def inspect_workflow(path: Path):
    errors, warnings = [], []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"invalid JSON: {exc}"], warnings

    if not isinstance(data, dict):
        return ["workflow root must be a JSON object"], warnings
    if data.get("active") is not False:
        errors.append("shareable workflow must explicitly set active=false")

    nodes = data.get("nodes")
    connections = data.get("connections")
    if not isinstance(nodes, list) or not nodes:
        errors.append("nodes must be a non-empty array")
        nodes = []
    if not isinstance(connections, dict):
        errors.append("connections must be an object")
        connections = {}

    names, ids = [], []
    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"node index {index} is not an object")
            continue

        name = node.get("name")
        node_id = node.get("id")
        node_type = node.get("type")
        if not isinstance(name, str) or not name.strip():
            errors.append(f"node index {index} has no name")
        else:
            names.append(name)
        if not isinstance(node_id, str) or not node_id.strip():
            errors.append(f"node {name or index!r} has no id")
        else:
            ids.append(node_id)
        if not isinstance(node_type, str) or not node_type:
            errors.append(f"node {name or index!r} has no type")
        if not isinstance(node.get("parameters"), dict):
            errors.append(f"node {name or index!r} has no parameters object")

        if node_type == "n8n-nodes-base.noOp":
            errors.append(f"{name or index}: No Operation placeholder is not accepted")
        if node_type == "n8n-nodes-base.webhook":
            auth = node.get("parameters", {}).get("authentication")
            if auth != "headerAuth":
                errors.append(f"{name or index}: Webhook must use Header Auth")
        if node_type == "n8n-nodes-base.executeWorkflow":
            params = node.get("parameters", {})
            workflow_id = params.get("workflowId", {})
            if isinstance(workflow_id, dict) and str(workflow_id.get("value", "")).startswith("REPLACE_"):
                warnings.append(f"{name or index}: bind the child workflow ID in n8n after import")
        params_text = json.dumps(node.get("parameters", {}), ensure_ascii=False)
        if re.search(r"REPLACE_WITH_[A-Z0-9_]+", params_text):
            warnings.append(f"{name or index}: provider configuration placeholder remains")

    if len(names) != len(set(names)):
        errors.append("duplicate node names")
    if len(ids) != len(set(ids)):
        errors.append("duplicate node IDs")

    valid_names = set(names)
    for source, outputs in connections.items():
        if source not in valid_names:
            errors.append(f"connection source {source!r} does not match any node")
        if not isinstance(outputs, dict):
            errors.append(f"connections for {source!r} must be an object")
            continue
        for output_name, groups in outputs.items():
            if not isinstance(groups, list):
                errors.append(f"{source!r}.{output_name} must be an array")
                continue
            for group in groups:
                if not isinstance(group, list):
                    errors.append(f"{source!r}.{output_name} output group must be an array")
                    continue
                for edge in group:
                    target = edge.get("node") if isinstance(edge, dict) else None
                    if target not in valid_names:
                        errors.append(f"{source!r} points to missing node {target!r}")

    return errors, list(dict.fromkeys(warnings))


def main():
    failures, checked, warning_count = 0, 0, 0

    workflow_folders = {
        p.name for p in WORKFLOWS.iterdir() if p.is_dir()
    } if WORKFLOWS.exists() else set()
    if workflow_folders != set(EXPECTED_WORKFLOWS):
        failures += 1
        missing = sorted(set(EXPECTED_WORKFLOWS) - workflow_folders)
        extra = sorted(workflow_folders - set(EXPECTED_WORKFLOWS))
        print(f"FAIL canonical workflow folders; missing={missing}; extra={extra}")

    for mirror in LEGACY_MIRRORS:
        if (ROOT / mirror).exists():
            failures += 1
            print(f"FAIL duplicate mirror directory remains: {mirror}")

    duplicate_exports = sorted(WORKFLOWS.glob("[0-9][0-9]-*.json"))
    if duplicate_exports:
        failures += 1
        print("FAIL root-level duplicate workflow JSON files remain:")
        for path in duplicate_exports:
            print(f"  - {path.relative_to(ROOT)}")

    for slug in EXPECTED_WORKFLOWS:
        folder = WORKFLOWS / slug
        for required in REQUIRED_WORKFLOW_FILES:
            if not (folder / required).is_file():
                failures += 1
                print(f"FAIL {folder.relative_to(ROOT)}/{required} missing")

        path = folder / "workflow.json"
        if not path.is_file():
            continue
        checked += 1
        errors, warnings = inspect_workflow(path)
        if errors:
            failures += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path.relative_to(ROOT)}")
        for warning in warnings:
            warning_count += 1
            print(f"WARN {path.relative_to(ROOT)}: {warning}")

    system_files = sorted(SYSTEM.glob("*.json")) if SYSTEM.exists() else []
    actual_system_names = {p.name for p in system_files}
    if actual_system_names != EXPECTED_SYSTEM_FILES:
        failures += 1
        print(
            "FAIL system workflow files; "
            f"expected={sorted(EXPECTED_SYSTEM_FILES)}; actual={sorted(actual_system_names)}"
        )

    for path in system_files:
        checked += 1
        errors, warnings = inspect_workflow(path)
        if path.name == "01-request-processor.json":
            execute_nodes = [
                n for n in json.loads(path.read_text(encoding="utf-8")).get("nodes", [])
                if n.get("type") == "n8n-nodes-base.executeWorkflow"
            ]
            if len(execute_nodes) != 20:
                errors.append(f"request processor must have 20 child routes; found {len(execute_nodes)}")
        if errors:
            failures += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path.relative_to(ROOT)}")
        for warning in warnings:
            warning_count += 1
            print(f"WARN {path.relative_to(ROOT)}: {warning}")

    print(f"\nResult: {checked} JSON exports checked; {failures} failures; {warning_count} configuration warnings.")
    print("Static checks do not prove n8n import compatibility, credentials, or live execution.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
