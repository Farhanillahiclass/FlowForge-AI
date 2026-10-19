# 09 — Client Onboarding

**Maintainer:** Muhammad Farhan  
**Event:** `client.onboarding.start`  
**Status:** Source-level changes; live Google Sheets/Gmail execution has not been verified.

## Purpose

Validate a client onboarding request, create a standard checklist, save the client record in Google Sheets, and send a welcome email. This is a starter onboarding orchestrator; it is not a full project-management system.

## Node-by-node paths

- Standalone: `Receive New Client (Header Auth Webhook) → Validate Client and Create Checklist → Client Details Valid?`
- Invalid request: `Client Details Valid? (false) → Return Validation Error`
- Valid request: `Client Details Valid? (true) → Save Client Record → Send Client Welcome Email → Return Onboarding Result`
- Parent workflow: `Called by Parent Workflow → Normalize Parent Payload → Validate Client and Create Checklist`

Required input: stable `requestId`, client name (`clientName` or `name`), and valid `email`. Optional: `service` and `owner`. The starter checklist is `send-welcome-email`, `create-client-record`, `schedule-kickoff`, and `collect-requirements`.

## Setup and integrations

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth on the webhook and select Google Sheets and Gmail OAuth credentials.
3. Replace `REPLACE_WITH_CLIENTS_SPREADSHEET_ID`.
4. Create a `Clients` tab with columns for requestId, clientName, email, service, owner, status, createdAt and checklist (match actual node mappings before use).
5. Replace any placeholder email/provider values; test using an internal address.
6. Keep the workflow inactive until the acceptance tests pass.

## Apps Script adapter

`Code.gs` is a separate authenticated intake/logging endpoint. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Apps Script Script Properties, run `setupSheet()`, and deploy as a Web App only after reviewing access settings. Never commit the token.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "client-test-001",
  "data": {
    "clientId": "client-001",
    "name": "Example Client",
    "email": "client@example.com",
    "package": "starter",
    "checklist": ["create-client-record", "schedule-kickoff"],
    "status": "onboarding-pending"
  }
}
```

The adapter validates the name/email/request ID, validates the checklist as a JSON array, checks exact sheet headers, prevents duplicate request IDs under a script lock, and returns `emailSent: false` and `kickoffScheduled: false`. It does not send email or create calendar events. n8n and Apps Script are separate execution paths unless an HTTP Request node connects them.

## Acceptance tests

1. Valid client request writes the expected fields.
2. Missing name, invalid email, or missing request ID is rejected without appending a row.
3. Malformed checklist JSON or a non-array checklist is rejected.
4. Repeated request ID returns `duplicate` and does not append a second row.
5. Wrong token, missing Script Properties, malformed JSON and mismatched sheet headers fail clearly.
6. Gmail failure after a successful Sheets append is visible in n8n execution history; reconcile before retrying.
7. Parent-trigger input and webhook input both produce the expected normalized client fields.

## Known limitations

- The current n8n workflow does not perform a durable request-ID lookup before appending to Sheets; duplicate prevention in the Apps Script adapter does not protect the independent n8n path.
- `schedule-kickoff` is a checklist item, not a real Calendar booking.
- A Gmail failure after the client row is saved can leave onboarding partially complete.
- Live n8n, Gmail, and Google Sheets side effects have not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
