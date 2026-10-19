# 01 — Lead Capture & CRM

**Maintainer:** Muhammad Farhan  
**Event type:** `lead.created`  
**Status:** Source updated on the audit branch; provider execution still requires configuration and testing.

## What this workflow does

Receives a lead, validates its request ID/name/email, checks Google Sheets for an existing request ID or email, writes a new lead, and notifies Sales by Gmail. The workflow returns a structured result. Duplicate lookup in a spreadsheet is useful for low-volume intake but is not a strict exactly-once guarantee under concurrent requests.

## Node-by-node path

### Standalone webhook path
`Receive Lead → Validate and Normalize → Valid Lead? → Read Existing Leads → Check Request ID or Email → Existing Lead?`

- **Duplicate = true:** `Return Duplicate Lead Result`; no new row or notification.
- **Duplicate = false:** `Save Lead to Google Sheets → Notify Sales via Gmail → Return Success`.
- **Invalid input:** `Return Validation Error`.

### Parent-workflow path
`Called by Parent Workflow → Normalize Parent Payload → Validate and Normalize → same validation and business path`

The parent must pass `requestId`, `eventType: "lead.created"`, `source`, `occurredAt`, and a `data` object containing `name` and `email` (plus optional `company`, `source`, and `message`).

## Required n8n configuration

1. Import `workflow.json` into a non-production n8n Cloud workspace.
2. Configure Header Auth on the standalone Webhook.
3. Select a Google Sheets OAuth credential and replace `REPLACE_WITH_SPREADSHEET_ID` in both read and append nodes.
4. Create a `Leads` sheet with headers including `requestId`, `name`, `email`, `company`, `source`, `message`, `status`, and `receivedAt` as used by the workflow mapping. Confirm the actual append mapping after import.
5. Select a Gmail OAuth credential and replace `REPLACE_WITH_SALES_EMAIL`.
6. Keep the workflow inactive until the tests below pass.

## Apps Script adapter (`Code.gs`)

This Apps Script is a separate authenticated intake/logging endpoint; it does not itself send Gmail notifications or create a CRM record. It requires Script Properties:
- `SPREADSHEET_ID`: a test spreadsheet ID.
- `FLOWFORGE_TOKEN`: a long random token, never committed to Git.

Run `setupSheet()` manually once in the Apps Script editor, after setting the properties and confirming the test spreadsheet. It creates/checks the `LeadCapture` sheet and header row.

Example request body (replace the token in your caller; never paste a real token into a repository or screenshot):

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "lead-test-001",
  "data": {
    "name": "Test User",
    "email": "test@example.com",
    "company": "Example Ltd",
    "source": "website",
    "message": "Interested in a demo"
  }
}
```

The endpoint rejects missing/invalid names, emails, request IDs, malformed JSON, wrong tokens, and duplicate request IDs. User-supplied values are guarded against spreadsheet formula injection. Deploy as a Web App only after reviewing access restrictions; use a separate test spreadsheet first.

## Acceptance tests

1. Valid lead with unique request ID: one new row and one Sales notification.
2. Missing name, missing request ID, or invalid email: validation error; no row and no email.
3. Repeat the same request ID: duplicate result; no second row or notification.
4. Repeat the same email with a different request ID: n8n duplicate check should block it.
5. Sheets permission failure: execution fails visibly; do not report accepted.
6. Gmail permission/send failure: confirm execution is marked failed and inspect whether the lead was saved. Add a persistent notification status/retry strategy before using this as a critical production process.
7. Apps Script: test valid token, invalid token, malformed JSON, invalid email, duplicate request ID, missing Script Properties and wrong sheet headers.

## Known limitations

- n8n's read-then-append duplicate check can race if simultaneous requests arrive; use a database uniqueness constraint for strict idempotency.
- The current email notification step does not yet persist a durable notification-delivery state. A failure after the sheet append requires careful manual recovery to avoid missed or duplicated notifications.
- Apps Script's `doPost` is a separate endpoint. It is not automatically called by this n8n workflow unless you add/configure an HTTP Request node.
- Live execution has not been verified by this repository change.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)
