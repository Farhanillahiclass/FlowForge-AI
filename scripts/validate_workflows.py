#!/usr/bin/env python3
"""Static checks for the canonical FlowForge-AI n8n exports.

Run from repository root: python scripts/validate_workflows.py
Reads repository files only. This does not import or execute workflows in n8n.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / "workflows"
SYSTEM = ROOT / "system"

EXPECTED_WORKFLOWS = [
    "01-lead-capture-crm", "02-lead-scoring-routing",
    "03-email-follow-up-sequence", "04-inbox-triage-assistant",
    "05-customer-support-desk", "06-faq-human-handoff",
    "07-meeting-booking-system", "08-meeting-reminders",
    "09-client-onboarding", "10-invoice-payment-reminders",
    "11-content-creation-approval", "12-instagram-publishing-pipeline",
    "13-youtube-publishing-assistant", "14-content-repurposing",
    "15-newsletter-campaign-builder", "16-weekly-business-report",
    "17-feedback-routing", "18-workflow-error-monitor",
    "19-api-health-monitor", "20-telegram-business-assistant",
]
EVENT_ROUTES = {
    "lead.created": "01-lead-capture-crm",
    "lead.score_requested": "02-lead-scoring-routing",
    "email.followup.dispatch": "03-email-follow-up-sequence",
    "inbox.message.received": "04-inbox-triage-assistant",
    "support.ticket.created": "05-customer-support-desk",
    "support.faq.question": "06-faq-human-handoff",
    "meeting.booking.requested": "07-meeting-booking-system",
    "meeting.reminder.dispatch": "08-meeting-reminders",
    "client.onboarding.start": "09-client-onboarding",
    "invoice.reminder.dispatch": "10-invoice-payment-reminders",
    "content.draft.requested": "11-content-creation-approval",
    "instagram.publish.requested": "12-instagram-publishing-pipeline",
    "youtube.upload.requested": "13-youtube-publishing-assistant",
    "content.repurpose.requested": "14-content-repurposing",
    "newsletter.campaign.requested": "15-newsletter-campaign-builder",
    "business.report.generate": "16-weekly-business-report",
    "feedback.received": "17-feedback-routing",
    "workflow.error.received": "18-workflow-error-monitor",
    "api.health.check": "19-api-health-monitor",
    "telegram.command.received": "20-telegram-business-assistant",
}
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
        return ["root must be a JSON object"], warnings
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
        name, node_id, node_type = node.get("name"), node.get("id"), node.get("type")
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

        if node_type == "n8n-nodes-base.code":
            js_code = node.get("parameters", {}).get("jsCode", "")
            if isinstance(js_code, str) and re.search(r"\\\\[sdw.]", js_code):
                errors.append(f"{name or index}: Code node may contain an over-escaped regex token (for example, \\\\s instead of \\s)")
        if node_type == "n8n-nodes-base.webhook":
            authentication = node.get("parameters", {}).get("authentication")
            if authentication != "headerAuth":
                errors.append(f"{name or index}: Webhook must use Header Auth")
        if node_type == "n8n-nodes-base.executeWorkflow":
            workflow_id = node.get("parameters", {}).get("workflowId", {})
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
            errors.append(f"connection source {source!r} does not match a node")
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


def inspect_canonical_folders(fail):
    folders = {p.name for p in WORKFLOWS.iterdir() if p.is_dir()} if WORKFLOWS.exists() else set()
    if folders != set(EXPECTED_WORKFLOWS):
        fail("canonical workflow folders", f"missing={sorted(set(EXPECTED_WORKFLOWS) - folders)}; extra={sorted(folders - set(EXPECTED_WORKFLOWS))}")
    for mirror in LEGACY_MIRRORS:
        if (ROOT / mirror).exists():
            fail("duplicate mirror directory", mirror)
    duplicate_exports = sorted(WORKFLOWS.glob("[0-9][0-9]-*.json")) if WORKFLOWS.exists() else []
    if duplicate_exports:
        fail("root-level duplicate workflow JSON exports", ", ".join(str(p.relative_to(ROOT)) for p in duplicate_exports))


def inspect_request_processor(path: Path, workflow_data: dict, fail):
    nodes = workflow_data.get("nodes", [])
    by_name = {n.get("name"): n for n in nodes if isinstance(n, dict)}
    by_id = {n.get("id"): n for n in nodes if isinstance(n, dict)}
    execute_nodes = [n for n in nodes if n.get("type") == "n8n-nodes-base.executeWorkflow"]
    if len(execute_nodes) != len(EVENT_ROUTES):
        fail(path.name, f"expected {len(EVENT_ROUTES)} child workflow nodes, got {len(execute_nodes)}")

    expected_names = {}
    for slug in EXPECTED_WORKFLOWS:
        child_path = WORKFLOWS / slug / "workflow.json"
        try:
            child = json.loads(child_path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(path.name, f"cannot read canonical child {slug}: {exc}")
            continue
        expected_names[slug] = child.get("name")

    route_node = by_id.get("routecode")
    js = route_node.get("parameters", {}).get("jsCode", "") if route_node else ""
    match = re.search(r"const routes=(\{[^;]+\});", js)
    if not match:
        fail(path.name, "cannot find event route map in Validate and Route Event Code node")
        route_map = {}
    else:
        try:
            route_map = json.loads(match.group(1))
        except json.JSONDecodeError as exc:
            fail(path.name, f"event route map is not parseable JSON: {exc}")
            route_map = {}
    expected_route_map = {
        event_type: canonical_folder.split("-", 1)[1]
        for event_type, canonical_folder in EVENT_ROUTES.items()
    }
    if route_map != expected_route_map:
        missing = sorted(set(expected_route_map.items()) - set(route_map.items()))
        extra = sorted(set(route_map.items()) - set(expected_route_map.items()))
        fail(path.name, f"event map mismatch; missing={missing}; extra={extra}")

    switch = by_id.get("route-switch")
    values = (switch or {}).get("parameters", {}).get("rules", {}).get("values", [])
    output_names = []
    for rule in values:
        conditions = rule.get("conditions", {}).get("conditions", [])
        output_names.append(rule.get("outputKey") or (conditions[0].get("rightValue") if conditions else None))
    expected_outputs = list(expected_route_map.values())
    if output_names[:len(expected_outputs)] != expected_outputs:
        fail(path.name, "Route Event Type output order does not match the canonical event route map")
    if len(values) != len(EVENT_ROUTES):
        fail(path.name, f"expected {len(EVENT_ROUTES)} explicit switch rules, got {len(values)}")

    connections = workflow_data.get("connections", {})
    main_outputs = connections.get("Route Event Type", {}).get("main", [])
    if len(main_outputs) < len(EVENT_ROUTES) + 1:
        fail(path.name, "Route Event Type is missing one or more event outputs or fallback output")
    canonical_folders = list(EVENT_ROUTES.values())
    for index, short_slug in enumerate(expected_outputs):
        canonical_folder = canonical_folders[index]
        expected_name = expected_names.get(canonical_folder)
        if index >= len(main_outputs) or not main_outputs[index]:
            fail(path.name, f"route {short_slug} has no connected child")
            continue
        edge = main_outputs[index][0]
        target = by_name.get(edge.get("node"))
        configured_name = (target or {}).get("parameters", {}).get("workflowId", {}).get("cachedResultName")
        if not target or target.get("type") != "n8n-nodes-base.executeWorkflow":
            fail(path.name, f"route {short_slug} does not connect to an Execute Sub-workflow node")
        elif configured_name != expected_name:
            fail(path.name, f"route {short_slug} targets {configured_name!r}, expected {expected_name!r}")

    if len(main_outputs) > len(EVENT_ROUTES):
        fallback = main_outputs[len(EVENT_ROUTES)]
        if not fallback or fallback[0].get("node") not in by_name:
            fail(path.name, "unsupported-event fallback is not connected")
        else:
            target = by_name[fallback[0]["node"]]
            if target.get("name") != "Return Unsupported Event":
                fail(path.name, "switch fallback must connect to Return Unsupported Event")

    ingress = None
    try:
        ingress = json.loads((SYSTEM / "00-main-ingress.json").read_text(encoding="utf-8"))
    except Exception as exc:
        fail(path.name, f"cannot read main ingress: {exc}")
    if ingress:
        call = next((n for n in ingress.get("nodes", []) if n.get("type") == "n8n-nodes-base.executeWorkflow"), None)
        cached = (call or {}).get("parameters", {}).get("workflowId", {}).get("cachedResultName")
        if cached != "01 - Request Processor":
            fail(path.name, f"main ingress must call '01 - Request Processor', got {cached!r}")


def main():
    failures, checked, warning_count = 0, 0, 0

    def fail(label, message):
        nonlocal failures
        failures += 1
        print(f"FAIL {label}: {message}")

    inspect_canonical_folders(fail)

    workflow_names = {}
    for slug in EXPECTED_WORKFLOWS:
        folder = WORKFLOWS / slug
        for required in REQUIRED_WORKFLOW_FILES:
            if not (folder / required).is_file():
                fail(f"{slug}/{required}", "required file is missing")
        # The README is the operator handoff: require setup and test guidance.
        readme_path = folder / "README.md"
        if readme_path.is_file():
            readme_text = readme_path.read_text(encoding="utf-8").lower()
            # Accept equivalent headings used by older guides, while still
            # requiring meaningful setup and test content rather than exact wording.
            section_groups = {
                "setup/configuration": ("integration", "configuration", "configure", "setup", "credentials"),
                "testing": ("acceptance tests", "testing", "test cases", "validation"),
                "limitations": ("known limitations", "limitations", "caveats", "production notes"),
            }
            for label, alternatives in section_groups.items():
                if not any(phrase in readme_text for phrase in alternatives):
                    if label == "limitations":
                        warning_count += 1
                        print(f"WARN {slug}/README.md: add a dedicated limitations/production-notes section")
                    else:
                        fail(f"{slug}/README.md", f"missing operator documentation topic: {label}")
        # Apps Script is an adapter and must not be mistaken for a deployed integration.
        code_path = folder / "Code.gs"
        if code_path.is_file():
            code_text = code_path.read_text(encoding="utf-8")
            if "function doPost" not in code_text:
                fail(f"{slug}/Code.gs", "missing doPost(e) web-app entry point")
            if "function setupSheet" not in code_text:
                warning_count += 1
                print(f"WARN {slug}/Code.gs: no setupSheet() helper; verify sheet setup manually")
            if "FLOWFORGE_TOKEN" not in code_text:
                warning_count += 1
                print(f"WARN {slug}/Code.gs: no FLOWFORGE_TOKEN marker; review endpoint authentication manually")
        path = folder / "workflow.json"
        if not path.is_file():
            continue
        checked += 1
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            workflow_names[slug] = data.get("name")
        except Exception:
            workflow_names[slug] = None
        errors, warnings = inspect_workflow(path)
        if data and not any(n.get("id") == "subflow-trigger" and n.get("type") == "n8n-nodes-base.executeWorkflowTrigger" for n in data.get("nodes", []) if isinstance(n, dict)):
            errors.append("canonical workflow must expose the shared parent-call entry point")
        # Publishing must fail closed until human approval is read from a trusted source.
        if slug == "12-instagram-publishing-pipeline" and data:
            approval_node = next((n for n in data.get("nodes", []) if isinstance(n, dict) and n.get("name") == "Validate Caption and Public Media URL"), None)
            approval_code = (approval_node or {}).get("parameters", {}).get("jsCode", "")
            if "const approved=false;" not in approval_code:
                errors.append("Instagram approval must fail closed; do not trust caller-supplied approved flags")
            appscript = (folder / "Code.gs").read_text(encoding="utf-8") if (folder / "Code.gs").is_file() else ""
            if 'const approval="pending",status="queued";' not in appscript:
                errors.append("Instagram Apps Script queue must enforce server-controlled pending/queued status")
        if errors:
            fail(path.relative_to(ROOT), "; ".join(errors))
        else:
            print(f"PASS {path.relative_to(ROOT)}")
        for warning in warnings:
            warning_count += 1
            print(f"WARN {path.relative_to(ROOT)}: {warning}")

    system_files = sorted(SYSTEM.glob("*.json")) if SYSTEM.exists() else []
    actual_system_names = {p.name for p in system_files}
    if actual_system_names != EXPECTED_SYSTEM_FILES:
        fail("system JSON set", f"expected={sorted(EXPECTED_SYSTEM_FILES)}; actual={sorted(actual_system_names)}")

    for path in system_files:
        checked += 1
        errors, warnings = inspect_workflow(path)
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            data = {}
        if path.name == "01-request-processor.json":
            inspect_request_processor(path, data, fail)
        if path.name == "90-central-error-handler.json":
            if not any(n.get("type") == "n8n-nodes-base.errorTrigger" for n in data.get("nodes", []) if isinstance(n, dict)):
                errors.append("central error workflow must start with an Error Trigger")
        if path.name == "00-main-ingress.json":
            if not any(n.get("type") == "n8n-nodes-base.webhook" and n.get("parameters", {}).get("authentication") == "headerAuth" for n in data.get("nodes", []) if isinstance(n, dict)):
                errors.append("main ingress must use a Header Auth Webhook")
        if errors:
            fail(path.relative_to(ROOT), "; ".join(errors))
        else:
            print(f"PASS {path.relative_to(ROOT)}")
        for warning in warnings:
            warning_count += 1
            print(f"WARN {path.relative_to(ROOT)}: {warning}")

    print(f"\nResult: {checked} JSON exports checked; {failures} failures; {warning_count} configuration warnings.")
    print("Static checks do not prove n8n import compatibility, credentials, provider permissions, or live execution.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
