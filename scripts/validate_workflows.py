#!/usr/bin/env python3
"""Static checks for FlowForge-AI n8n workflow JSON files.

Run from repository root: python scripts/validate_workflows.py
This does not connect to n8n or validate credentials/provider API behavior.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / "workflows"


def validate(path: Path):
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
    names = [n.get("name") for n in nodes if isinstance(n, dict)]
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
    paths = sorted(WORKFLOWS.glob("[0-9][0-9]-*.json"))
    if len(paths) != 20:
        print(f"WARNING: expected 20 numbered workflows, found {len(paths)}")
    failures = 0
    for path in paths:
        errors = validate(path)
        if errors:
            failures += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {path.relative_to(ROOT)} (static structure only)")
    print(f"\nResult: {len(paths) - failures}/{len(paths)} workflow JSON files passed static checks.")
    print("This is not an n8n import or live integration test.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
