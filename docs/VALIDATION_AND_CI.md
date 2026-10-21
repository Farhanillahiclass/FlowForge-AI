# Workflow Validation and CI

FlowForge-AI uses static checks to catch common problems in exported n8n workflow JSON before changes are merged.

## Run validation locally

From the repository root, run:

```bash
python scripts/validate_workflow_exports_strict.py workflows/
```

You can also pass one or more JSON files or other directories:

```bash
python scripts/validate_workflow_exports_strict.py workflows/example/workflow.json
```

The validator checks that each file is valid UTF-8 JSON, has a top-level object, contains `nodes` and `connections` with expected basic types, has named and typed nodes, avoids duplicate node names and IDs, and does not reference missing connection source or target nodes.

## GitHub Actions

The `Validate n8n Workflows` workflow runs on pushes to `main` and pull requests when workflow JSON files or the validator change. It can also be started manually from the Actions tab with **Run workflow**.

A failed check prints the affected file and the issue detected. Fix the source JSON or its connection references, then run the check again.

## Important limits

A passing static check is not proof that a workflow executes correctly. It does not authenticate to external services, check API permissions, confirm community nodes are installed, or test real n8n runtime behavior. Those checks require an isolated n8n instance, test credentials, and safe sample data. Do not add real secrets or customer data to repository files or test fixtures.

## Troubleshooting

- **No JSON files found:** check that exported workflow files are under `workflows/`, or pass their actual paths explicitly.
- **Missing connection target:** check spelling and capitalization against the node's `name`.
- **Duplicate node name:** give each node a unique name before exporting.
- **Credential or API error during a live test:** configure credentials in n8n's credential manager; never hard-code them in JSON.
