# Repository Structure & Contribution Guide

## Canonical source of truth

Every business workflow lives in one directory under `workflows/<number>-<slug>/`:

- `README.md` — goal, required integrations, setup, tests, limitations.
- `workflow.json` — canonical n8n import/export.
- `Code.gs` — optional Google Apps Script adapter.

The former root-level numbered JSON exports and parallel `apps-script/` and `workflow-guides/` mirror trees have been removed after their content was consolidated into each workflow's README. Do not recreate these mirrors.

## System layer

- `system/00-main-ingress.json`: Header Auth webhook and envelope validation.
- `system/01-request-processor.json`: event routing and Execute Sub-workflow calls.
- `system/10-lead-capture-subflow.json`, `11-lead-scoring-subflow.json`, `12-support-ticket-subflow.json`: example business children.
- `system/90-central-error-handler.json`: sanitized error log and operator alert.
- `docs/ARCHITECTURE.md`: system layers, reliability boundaries and deployment setup.

Child workflow IDs and credentials live in the target n8n instance and must be selected after import.

## Pull-request checklist

1. Change canonical files only.
2. Update the workflow README when its trigger, inputs, outputs, credentials, or limitations change.
3. Never commit tokens, production identifiers, or private customer records.
4. Run `python scripts/validate_workflows.py`.
5. Review GitHub Actions.
6. Explicitly distinguish static validation from real n8n execution.
7. Include sanitized evidence for any live-test claim.

## Validation boundaries

Automated checks validate repository structure and basic JSON graph consistency. They do not validate every provider node schema, credentials, remote API behavior, or production safety. Those require import and controlled execution in a test n8n environment.
