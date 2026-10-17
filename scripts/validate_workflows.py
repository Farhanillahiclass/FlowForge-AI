#!/usr/bin/env python3
"""Static repository checks for FlowForge-AI workflow templates.

Run from repository root: python scripts/validate_workflows.py
This does not import workflows into n8n or call provider APIs.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / "workflows"
REQUIRED_FOLDER_FILES = ("README.md", "workflow.json", "Code.gs")


def validate_json(path: Path):
    """Validate basic n8n workflow graph consistency."""
    errors = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"invalid JSON: {exc}"]

    nodes = data.get("nodes")
    connections = data.get("connections")
    if not isinstance(nodes, list) or not nodes:
        errors.append("missing or empty nodes list")
        nodes = []
    if not isinstance(connections, dict):
        errors.append("connections must be an object")
        connections = {}

    names = [node.get("name") for node in nodes if isinstance(node, dict)]
    if len(names) != len(set(names)):
        errors.append("duplicate node names")
    name_set = set(names)

    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"node index {index} is not an object")
            continue
        if not node.get("name"):
            errors.append(f"node index {index} has no name")
        if not node.get("type"):
            errors.append(f"node {node.get('name', index)!r} has no type")

    for source, output_types in connections.items():
        if source not in name_set:
            errors.append(f"connection source {source!r} does not match a node")
        if not isinstance(output_types, dict):
            errors.append(f"connections for {source!r} must be an object")
            continue
        for output_name, groups in output_types.items():
            if not isinstance(groups, list):
                errors.append(f"{source!r}.{output_name} must be a list")
                continue
            for group in groups:
                if group is None:
                    continue
                if not isinstance(group, list):
                    errors.append(f"{source!r}.{output_name} output group is not a list")
                    continue
                for edge in group:
                    target = edge.get("node") if isinstance(edge, dict) else None
                    if target not in name_set:
                        errors.append(f"{source!r} points to missing node {target!r}")
    return errors


def main():
    legacy_paths = sorted(WORKFLOWS.glob("[0-9][0-9]-*.json"))
    folder_paths = sorted(
        path for path in WORKFLOWS.glob("[0-9][0-9]-*")
        if path.is_dir()
    )
    failures = 0
    checks = 0

    if len(legacy_paths) != 20:
        failures += 1
        print(f"FAIL expected 20 legacy JSON exports; found {len(legacy_paths)}")
    if len(folder_paths) != 20:
        failures += 1
        print(f"FAIL expected 20 self-contained workflow folders; found {len(folder_paths)}")

    for folder in folder_paths:
        missing = [name for name in REQUIRED_FOLDER_FILES if not (folder / name).is_file()]
        if missing:
            failures += 1
            print(f"FAIL {folder.relative_to(ROOT)} missing: {', '.join(missing)}")
        else:
            print(f"PASS {folder.relative_to(ROOT)} required files present")

    # Validate both canonical folder exports and retained compatibility exports.
    json_paths = sorted(set(legacy_paths + [folder / "workflow.json" for folder in folder_paths
                                           if (folder / "workflow.json").is_file()]))
    for path in json_paths:
        checks += 1
        errors = validate_json(path)
        if errors:
            failures += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path.relative_to(ROOT)} (static graph checks)")

    passed = checks - sum(
        bool(validate_json(path)) for path in json_paths
    )
    print(f"\nResult: {passed}/{checks} JSON exports passed static graph checks.")
    print(f"Workflow folders checked: {len(folder_paths)}; failures: {failures}.")
    print("Static checks do not prove n8n import compatibility or live integration behavior.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
