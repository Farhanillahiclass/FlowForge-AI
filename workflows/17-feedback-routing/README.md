# 17 — Customer Feedback & Escalation

**Maintainer:** Muhammad Farhan  
**Event:** `feedback.received`  
**Status:** Source and documentation hardening only; live provider execution has not been verified.

## Purpose

Validate and log customer feedback; alert support for low ratings.

## Node-by-node path

`Webhook/parent → normalize → validate rating and feedback → valid? → low rating? → append feedback row → Gmail support alert for ratings 1–2 → structured result.`

## Integration setup

Configure feedback spreadsheet, Google Sheets/Gmail OAuth and support address. Restrict sheet and email access because customer details may be personal data.

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

Ratings below 1/above 5/non-integers rejected; missing feedback; rating 1–2 alert; rating 3–5 log only; duplicate request ID; invalid email; Gmail failure.

Additionally, verify duplicate request IDs do not create duplicate registry rows, wrong tokens are rejected, malformed JSON is rejected, missing Script Properties produce a configuration error, and mismatched headers are detected. Verify the provider-side effect separately in the relevant service.

## Known limitations

Alert is not a ticketing SLA or case-management system. Set retention and access policies before production.

Do not describe the workflow as production-ready until provider credentials, external side effects, retry behavior and failure recovery are tested in a disposable environment.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
