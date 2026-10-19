# 10 — Invoice & Payment Reminders

**Maintainer:** Muhammad Farhan  
**Event type:** `invoice.reminder.dispatch`  
**Status:** Source-level update only; Gmail/Sheets execution and payment-system verification are not verified.

## Purpose

Run a daily scan of an invoice register, select unpaid overdue invoices below the configured reminder cap, email the billing contact, then update the reminder count and last-reminder timestamp.

## n8n node path

`Daily Invoice Review → Read Invoice Register → Filter Unpaid Overdue Invoices → Send Overdue Invoice Reminder → Update Invoice Reminder Count`

Parent entry: `Called by Parent Workflow → Normalize Parent Payload → Read Invoice Register`. The parent entry currently performs the same scheduled register scan; it does not filter a single supplied invoice from the parent payload.

## Required Invoices sheet fields

Create an `Invoices` tab with unique `invoiceId` (or `id`), `dueDate`, `status`, `reminderCount`, and `email` or `billingEmail`; `invoiceNumber` is optional. The current filter requires `status = unpaid`, a parseable due date in the past, reminder count below 3, and a valid email address.

## Configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Select Google Sheets and Gmail OAuth credentials.
3. Replace `REPLACE_WITH_INVOICE_SPREADSHEET_ID` in both Sheets nodes.
4. Confirm the update node matches a unique `invoiceId`; test with a copied sheet and internal recipient.
5. Keep the workflow inactive until the acceptance tests pass.

## Apps Script adapter

`Code.gs` is a separate authenticated logging endpoint. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Script Properties, run `setupSheet()`, and deploy as a Web App only after reviewing access settings. Never commit the token.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "invoice-reminder-test-001",
  "data": {
    "invoiceId": "INV-100",
    "clientEmail": "client@example.com",
    "amount": "125.00",
    "currency": "USD",
    "dueAt": "2026-10-01T00:00:00Z",
    "status": "unpaid",
    "lastReminderAt": ""
  }
}
```

The adapter validates invoice ID, email, non-negative amount, currency code, due date and status; checks the exact sheet headers; prevents duplicate request IDs and duplicate invoice/email request rows under a script lock; and returns `emailSent: false`. It records the request only—it does not send email or verify the balance with accounting software. n8n and Apps Script are separate paths unless an HTTP Request node connects them.

## Acceptance tests

1. Paid/void/cancelled invoice is not eligible in Apps Script.
2. Invalid email, amount, currency, date, status, or missing request ID/invoice ID is rejected.
3. Wrong token, malformed JSON, missing Script Properties and mismatched sheet headers fail clearly.
4. Duplicate request ID or invoice/email request does not append another row.
5. In n8n, future-due, paid, invalid-email, and reminder-count-at-cap rows are filtered out.
6. Gmail failure must not increment reminder count; Sheets update failure after Gmail success requires manual reconciliation before retry.
7. Confirm the actual accounting/payment source says the invoice is still unpaid before production use.

## Limits and safeguards

- The n8n workflow trusts the spreadsheet status; it does not check an external accounting system for recent payment.
- A successful email followed by failed sheet update can cause another email on the next run. The operation is not transactional or exactly-once.
- The reminder cap and daily schedule are starter policy values; review local time zone, legal requirements and approved wording before production.
- Live provider execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
