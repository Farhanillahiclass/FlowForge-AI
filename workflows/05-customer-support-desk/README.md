# 05 — Customer Support Desk

**Maintainer:** Muhammad Farhan  
**Event type:** `support.ticket.created`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Validate a support request, assign a ticket identifier, classify priority/category, check for an existing ticket, store new tickets in Google Sheets and notify the support inbox.

## Input contract

Required: stable `requestId`, valid `email`, and a non-empty `message` or `description`. Optional: `name`. Priority keyword rules currently raise priority for terms such as urgent, blocked, cannot access, security or outage. Category rules detect billing and technical keywords.

## Workflow path

`Header Auth Webhook / parent entry → validate/classify → read SupportTickets → duplicate check → append new ticket → Gmail alert → structured result`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_SUPPORT_SPREADSHEET_ID` and `REPLACE_WITH_SUPPORT_EMAIL`. Create a `SupportTickets` sheet with columns for `requestId`, `ticketId`, customer fields, message, priority, category, status and timestamps.

## Tests to run

Test a valid ticket, invalid email, missing request ID, blank message, hot-priority ticket, repeated request ID, Sheets error and Gmail failure. Confirm that duplicates skip the normal create/notify path.

## Limits

Duplicate detection is a Google Sheets read-before-append check; concurrent requests can race. If the previous execution saved a row but the send outcome is unknown, reconcile before retrying. A ticketing platform with a unique request key is preferable for high-volume service operations.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
