# 05 — Customer Support Desk

**Maintainer:** Muhammad Farhan  
**Event:** `support.ticket.created`  
**Status:** Static review only; live n8n, Gmail and Sheets execution has not been verified.

## What it does

The n8n workflow accepts a support request, validates request ID/email/message, applies starter keyword rules for category and priority, checks existing rows for duplicates, appends new tickets to Google Sheets, and sends a Gmail alert.

## Parent workflow and standalone paths

- Standalone: `Receive Support Ticket (Header Auth Webhook) → Validate and Classify Ticket → Valid Ticket? → Read Existing Support Tickets → Check Duplicate Request ID → Ticket Already Exists?`
- Invalid input: `Valid Ticket? (false) → Return Validation Error`
- Duplicate: `Ticket Already Exists? (true) → Return Duplicate Ticket Result`
- New ticket: `Ticket Already Exists? (false) → Save Support Ticket to Google Sheets → Notify Support Team via Gmail → Return Ticket Details`
- Parent: `Called by Parent Workflow → Normalize Parent Payload → Validate and Classify Ticket`

The current classification is deterministic keyword matching, not an LLM. Billing terms map to `billing`; error/bug/crash/access terms map to `technical`; other requests map to `general`. Urgent/blocked/access/security/outage terms set priority to `high`.

## Setup

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth on the webhook and select Google Sheets and Gmail OAuth credentials.
3. Replace `REPLACE_WITH_SUPPORT_SPREADSHEET_ID` and `REPLACE_WITH_SUPPORT_EMAIL`.
4. Create a `SupportTickets` tab. Headers must match the fields being mapped by the Google Sheets node.
5. Keep the workflow inactive until all tests pass.

## Apps Script adapter

`Code.gs` is a separate intake/logging endpoint. It does not read Gmail/Outlook and does not send email. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Script Properties, run `setupSheet()`, then deploy as a Web App only after reviewing access settings. Never put the token in source control.

Example body:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "support-test-001",
  "data": {
    "name": "Test Customer",
    "email": "customer@example.com",
    "message": "Urgent: payment failed and I need help"
  }
}
```

The Apps Script adapter should return a ticket ID, category and priority, reject invalid input, and avoid writing duplicate request IDs. Apps Script logging and the n8n workflow are separate execution paths unless an HTTP Request node explicitly connects them.

## Acceptance tests

1. Valid billing request: category `billing`.
2. Bug/crash/access issue: category `technical`.
3. Other request: category `general`.
4. Urgent/blocked/security/outage request: priority `high`.
5. Invalid email, missing request ID, or empty message: rejected without writing.
6. Duplicate request ID: no second ticket and no second notification.
7. Google Sheets permission failure: workflow must fail visibly.
8. Gmail failure after the ticket row is saved: inspect execution history before retrying to avoid duplicate notifications.
9. Parent workflow input and webhook input produce the same normalized contract.

## Known limitations

- Read-before-append duplicate checks can race on concurrent n8n executions.
- Ticket save and Gmail notification are separate side effects; a send failure may leave a saved ticket without a notification.
- No ticketing platform, SLA timer, customer reply, or durable human-review callback is configured by this workflow.
- The current Apps Script and n8n paths are not automatically connected.
- Live provider execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
