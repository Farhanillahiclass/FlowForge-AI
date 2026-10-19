# 16 — Weekly Business Reporting

**Maintainer:** Muhammad Farhan  
**Event:** `business.report.generate`  
**Status:** Source and documentation hardening only; live provider execution has not been verified.

## Purpose

Read lead and support records, aggregate a starter weekly summary, email it and log the run.

## Node-by-node path

`Weekly schedule/parent → read Leads and SupportTickets in parallel → tag source → merge → aggregate → Gmail report → report-log append.`

## Integration setup

Configure lead/ticket/report-log spreadsheet IDs, Gmail OAuth, recipient, date fields and time zone. Verify the current aggregation against sample records before relying on totals.

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

Empty inputs; date boundary; missing/invalid numeric fields; duplicate request; email failure; log failure; timezone boundary.

Additionally, verify duplicate request IDs do not create duplicate registry rows, wrong tokens are rejected, malformed JSON is rejected, missing Script Properties produce a configuration error, and mismatched headers are detected. Verify the provider-side effect separately in the relevant service.

## Known limitations

Report accuracy depends on source columns and aggregation logic. Revenue is not guaranteed to exist in source data; this is not an accounting system.

Do not describe the workflow as production-ready until provider credentials, external side effects, retry behavior and failure recovery are tested in a disposable environment.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
