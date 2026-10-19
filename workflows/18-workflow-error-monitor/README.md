# 18 — Workflow Error Monitor

**Maintainer:** Muhammad Farhan  
**Event:** `workflow.error.received`  
**Status:** Source and documentation hardening only; live provider execution has not been verified.

## Purpose

Capture workflow/execution error context, persist a record and notify operations.

## Node-by-node path

`n8n Error Trigger / parent event → normalize error fields → append WorkflowErrors → Gmail operations alert.`

## Integration setup

Configure Gmail OAuth and operations email. Assign this workflow in each relevant n8n workflow's Settings → Error Workflow, or explicitly connect a central error handler. The workflow will not monitor all flows merely by being imported.

1. Import `workflow.json` into a non-production n8n workspace.
2. Set credentials through n8n's credential manager; never commit tokens or API keys.
3. Replace all `REPLACE_WITH_...` values and verify every node's field mapping against the actual sheet/API schema.
4. Keep the workflow inactive until acceptance tests pass.

## Apps Script adapter

`Code.gs` is a separate authenticated logging/queue endpoint, not an automatic bridge to the n8n execution path. Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`, run `setupSheet()`, and deploy only after reviewing Web App access settings. The adapter validates a request ID, checks exact sheet headers, prevents duplicate IDs under a script lock and protects spreadsheet cells from formula injection. It logs records only; it does not perform the provider side effects described by the workflow.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "test-001",
  "data": {
    "sourceId": "source-001",
    "status": "pending"
  }
}
```

Replace the example fields with the columns used by this workflow. Never put the real token in a repository or screenshot.

## Acceptance tests

Trigger controlled error; missing execution metadata; email outage; sheet outage; duplicate event; confirm Error Workflow assignment and alert receipt.

Additionally, verify duplicate request IDs do not create duplicate registry rows, wrong tokens are rejected, malformed JSON is rejected, missing Script Properties produce a configuration error, and mismatched headers are detected. Verify the provider-side effect separately in the relevant service.

## Known limitations

Apps Script is an independent authenticated logging endpoint. It is not automatically called by n8n. Avoid storing secrets or excessive personal data in error messages.

Do not describe the workflow as production-ready until provider credentials, external side effects, retry behavior and failure recovery are tested in a disposable environment.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
