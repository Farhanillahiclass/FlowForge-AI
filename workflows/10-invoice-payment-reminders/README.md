# 10 — Invoice & Payment Reminders

**Maintainer:** Muhammad Farhan  
**Event type:** `invoice.reminder.dispatch`  
**Status:** Static-checked template; billing email/Sheets execution not yet verified.

## Purpose

Run a daily scan of an invoice register, select overdue unpaid invoices under the reminder cap, email the billing contact, and update the reminder count/state after the send step.

## Required Invoices sheet fields

Create an `Invoices` tab with `invoiceId` (or `id`), `dueDate`, `status`, `reminderCount`, `email` or `billingEmail`, and optionally `invoiceNumber`. The current filter requires `status = unpaid`, a parseable due date in the past, a reminder count below 3, and a valid recipient email.

## Workflow path

`Daily Schedule / parent entry → read invoice register → overdue/cap/recipient filter → Gmail reminder → update invoice reminder count and lastReminderAt`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_INVOICE_SPREADSHEET_ID`. Ensure the update node's match column `invoiceId` exists and is unique.

## Tests to run

Test paid invoice, future due date, overdue unpaid invoice, invalid email, reminder cap reached, missing invoice ID, Gmail failure, and Sheets update failure. Verify the invoice count/date only changes after a successful send step.

## Limits and safeguards

This workflow may send a message that has legal/financial significance. Confirm that the invoice is genuinely overdue, the recipient is correct, reminder caps and local time rules match your policy, and a human has approved the message templates. A send followed by failed logging can cause a repeated email; the Sheet read/update process is not transactional. It does not check whether a payment was received in an external accounting system before sending.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
