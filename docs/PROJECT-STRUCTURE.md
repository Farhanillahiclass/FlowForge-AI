# Project Structure & Contribution Guide

## Canonical workflow layout

The preferred entry point for each automation is `workflows/<number>-<slug>/`:

- `README.md` — purpose, trigger, prerequisites, configuration, test cases, limitations.
- `workflow.json` — n8n workflow export.
- `Code.gs` — optional Google Apps Script adapter when that integration is useful.

Use `workflows/README.md` as the index and `workflows/CREDENTIALS-GUIDE.md` for provider setup. Keep documentation close to the implementation it describes.

## Compatibility copies

The root-level `workflows/NN-*.json` files and top-level `apps-script/` and `workflow-guides/` directories are retained as legacy/reference copies for existing links. The self-contained workflow folders are the recommended starting point. When editing a workflow, ensure its canonical folder export and any compatibility copy remain consistent until a dedicated migration removes the old paths.

## Change checklist

Before opening a pull request:

1. Keep changes limited to the intended workflow or shared tooling.
2. Update the workflow README when trigger, inputs, outputs, credentials, or limitations change.
3. Never commit credentials, tokens, real customer records, or production identifiers.
4. Run `python scripts/validate_workflows.py`.
5. Review GitHub Actions results.
6. State explicitly whether validation is static-only or includes a real n8n execution.
7. Include sanitized evidence for any claimed live test; never claim live success from JSON parsing alone.

## Validation boundaries

Automated checks validate repository structure and basic JSON graph consistency. They do not validate node-specific parameter schemas, credential access, remote service behavior, or production safety. Those require import and controlled execution in a test n8n instance.

## Suggested future improvements

- Remove compatibility copies after confirming no links or consumers depend on them.
- Add workflow-specific fixture-based tests for important transformations.
- Add an execution evidence template and versioned n8n compatibility matrix.
- Add reviewed export checks for credentials and accidental personal data.
