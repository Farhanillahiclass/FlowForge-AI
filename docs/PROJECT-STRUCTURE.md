# Repository Structure & Contribution Guide

## Canonical source of truth

Every business automation is stored in one directory under `workflows/<number>-<slug>/`:

- `README.md` — goal, required integrations, setup, test cases and limitations.
- `workflow.json` — canonical n8n export.
- `Code.gs` — optional Google Apps Script adapter for workflows that use it.

The duplicate root-level numbered workflow JSON exports and mirrored `apps-script/` / `workflow-guides/` directories have been removed. The duplicate system demo child workflows have also been removed: Request Processor now calls the canonical 20 business folders directly. Do not recreate secondary copies.

## System layer

- `system/00-main-ingress.json`: Header Auth Webhook, envelope validation and request/response orchestration.
- `system/01-request-processor.json`: 20 event types and 20 Execute Sub-workflow nodes.
- `system/90-central-error-handler.json`: sanitized failure log and operator notification.
- `docs/ARCHITECTURE.md`: layers, event contract and reliability limits.

Workflow IDs are specific to each n8n instance and must be selected after import. No live workflow IDs or provider credentials belong in GitHub.

## Pull request checklist

1. Change canonical workflow files; don't make a second JSON mirror.
2. Update the workflow README if inputs, outputs, triggers, credentials or limitations change.
3. Keep shared system routes aligned with canonical workflow names and event types.
4. Never commit tokens, private customer records, or production identifiers.
5. Run `python scripts/validate_workflows.py`.
6. Review GitHub Actions.
7. State explicitly whether validation is static-only or includes execution evidence in a test n8n runtime.
8. Keep workflow exports inactive until live tests have been reviewed.

## Validation boundaries

Automated validation checks canonical structure, required files, JSON parsing, node IDs/names, connection targets, webhook auth settings, no-op placeholders, duplicate mirrors, and route count. It does not validate every provider node parameter, credentials, API permissions, or production behavior.
