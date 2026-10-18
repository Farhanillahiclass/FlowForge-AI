# 09 — Client Onboarding

**Maintainer:** Muhammad Farhan  
**Event type:** `client.onboarding.start`  
**Status:** Static-checked template; Sheets/Gmail execution not yet verified.

## Purpose

Validate a new client request, create a starter onboarding checklist, append a client record to Google Sheets, and send the client a welcome email.

## Input contract

Required: `requestId`, client name (or `name`), and valid `email`. Optional: `service` and `owner`. The checklist currently includes sending a welcome message, creating a record, scheduling a kickoff, and collecting requirements.

## Workflow path

`Header Auth Webhook / parent entry → validate and build checklist → Google Sheets Clients append → Gmail welcome message → structured result`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_CLIENTS_SPREADSHEET_ID` and create a `Clients` tab with headers matching the output fields.

## Tests to run

Test valid client, missing name/email/request ID, duplicate request, Sheets failure, and Gmail failure. Confirm that the saved record and welcome email contain the expected fields.

## Limits

There is no durable duplicate check in the current onboarding flow, and the kickoff step is currently a checklist item—not a Calendar event. Add request-ID uniqueness, actual task creation, a Calendar availability check, and a reconciliation policy before production onboarding.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
