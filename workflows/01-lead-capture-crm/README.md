# 01 — Lead Capture & CRM

**Maintainer:** Muhammad Farhan  
**Event type:** `lead.created`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Accept a lead, validate its stable request ID, name and email, check the existing Leads sheet for a matching request ID or email, save a new lead, then notify Sales by Gmail.

## Workflow path

`Header Auth Webhook → Normalize/validate → Read existing Leads → Duplicate check → Google Sheets append → Gmail alert → structured result`

The shared parent entry point `Called by Parent Workflow` accepts the FlowForge request envelope and routes through the same validation/action path.

## Input contract

Send a POST to the `lead-capture-crm` Webhook path with Header Auth:

```json
{
  "requestId": "lead-2026-001",
  "name": "Test User",
  "email": "test@example.com",
  "company": "Example Ltd",
  "source": "website",
  "message": "Interested in a demo"
}
```

When called through Main Ingress, wrap the business fields under `data` and set `eventType: "lead.created"`.

## Configuration

Select Google Sheets and Gmail OAuth credentials in n8n. Replace `REPLACE_WITH_SPREADSHEET_ID` and `REPLACE_WITH_SALES_EMAIL`. The spreadsheet must contain a `Leads` tab with columns matching the node mapping, including `requestId` and `email`.

## Tests to run

Test a valid lead, missing name, invalid email, repeated `requestId`, a different request using the same email, a Sheets permission failure, and a Gmail failure. Confirm both the execution output and the actual sheet/email outcome.

## Limits

The duplicate check reads the sheet before appending; simultaneous requests can race. For higher-volume or critical intake, use a database unique constraint or provider idempotency support. Do not describe this as strict exactly-once delivery.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
