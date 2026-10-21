#!/usr/bin/env python3
"""Static checks for n8n workflow JSON exports; does not execute workflows."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        data: Any = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return [f"{path}: cannot read valid UTF-8 JSON ({exc})"]

    if not isinstance(data, dict):
        return [f"{path}: top-level JSON value must be an object"]

    nodes = data.get("nodes")
    connections = data.get("connections")
    if not isinstance(nodes, list):
        errors.append(f"{path}: missing or invalid 'nodes' array")
        nodes = []
    if not isinstance(connections, dict):
        errors.append(f"{path}: missing or invalid 'connections' object")
        connections = {}

    names: set[str] = set()
    ids: set[str] = set()
    for index, node in enumerate(nodes):
        prefix = f"{path}: nodes[{index}]"
        if not isinstance(node, dict):
            errors.append(f"{prefix} must be an object")
            continue
        name, node_id, node_type = node.get("name"), node.get("id"), node.get("type")
        if not isinstance(name, str) or not name.strip():
            errors.append(f"{prefix} has no non-empty name")
        elif name in names:
            errors.append(f"{prefix} duplicates node name {name!r}")
        else:
            names.add(name)
        if node_id is not None:
            if not isinstance(node_id, str) or not node_id.strip():
                errors.append(f"{prefix} has an invalid id")
            elif node_id in ids:
                errors.append(f"{prefix} duplicates node id {node_id!r}")
            else:
                ids.add(node_id)
        if not isinstance(node_type, str) or not node_type.strip():
            errors.append(f"{prefix} has no non-empty type")

    # n8n connection maps are keyed by source node name. Catch dangling sources
    # and malformed connection structures without assuming every node is wired.
    for source, groups in connections.items():
        if source not in names:
            errors.append(f"{path}: connections reference missing source node {source!r}")
        if not isinstance(groups, dict):
            errors.append(f"{path}: connections for {source!r} must be an object")
            continue
        for output_type, outputs in groups.items():
            if not isinstance(outputs, list):
                errors.append(f"{path}: {source!r}.{output_type} outputs must be an array")
                continue
            for output_index, branches in enumerate(outputs):
                if not isinstance(branches, list):
                    errors.append(f"{path}: {source!r}.{output_type}[{output_index}] must be an array")
                    continue
                for branch in branches:
                    if not isinstance(branch, dict):
                        errors.append(f"{path}: {source!r} has a malformed connection entry")
                        continue
                    target = branch.get("node")
                    if not isinstance(target, str) or target not in names:
                        errors.append(f"{path}: {source!r} connects to missing node {target!r}")
                    if not isinstance(branch.get("type"), str):
                        errors.append(f"{path}: connection from {source!r} has no string type")
                    if not isinstance(branch.get("index"), int):
                        errors.append(f"{path}: connection from {source!r} has no integer index")

    if not nodes:
        errors.append(f"{path}: workflow has no nodes")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", help="JSON files or directories; defaults to workflows/")
    args = parser.parse_args()
    roots = [Path(p) for p in args.paths] if args.paths else [Path("workflows")]
    files: list[Path] = []
    for root in roots:
        if root.is_file() and root.suffix.lower() == ".json":
            files.append(root)
        elif root.is_dir():
            files.extend(p for p in root.rglob("*.json") if p.is_file())
        else:
            print(f"ERROR: path not found or not a JSON file: {root}", file=sys.stderr)
            return 2
    files = sorted(set(files))
    if not files:
        print("ERROR: no JSON files found", file=sys.stderr)
        return 2

    all_errors: list[str] = []
    for file in files:
        all_errors.extend(validate(file))
    if all_errors:
        print("Workflow JSON validation FAILED")
        for error in all_errors:
            print(f"- {error}")
        print(f"\n{len(all_errors)} issue(s) across {len(files)} file(s).")
        return 1
    print(f"Workflow JSON validation passed for {len(files)} file(s).")
    print("Note: static validation does not prove that credentials, APIs, or live executions work.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
