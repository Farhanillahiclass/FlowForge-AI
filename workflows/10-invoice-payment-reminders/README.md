# 10 — Invoice & Payment Reminders

**Maintainer:** Muhammad Farhan

## Business goal
Schedule → invoices → unpaid/overdue check → suppression → reminder → log attempts.

## Required credentials and configuration
Invoice source, Gmail/email service, writable reminder-count/status fields.

- Import [`workflow.json`](./workflow.json) into a **test** n8n instance and confirm node compatibility with your installed version.
- Configure OAuth/API credentials inside n8n Credentials. Never commit tokens or passwords.
- Replace sample IDs, recipients, calendars, URLs, time zones and business rules.
- Replace every `Configure`, `Connect`, or `No Operation` placeholder with a real action before expecting external side effects.
- Keep the workflow inactive while testing with synthetic data and accounts you control.

## Implementation checklist
1. Confirm the trigger and required input schema.
2. Validate required fields and return clear errors for bad input.
3. Apply business rules, consent, SLA, and approval requirements.
4. Persist output and a stable business-event ID.
5. Connect actual external actions and verify destination-side results.
6. Add bounded retries/backoff for transient errors and sanitized alerts.
7. Add durable idempotency so retries do not duplicate side effects.

## Test checklist
Test paid-invoice suppression, overdue thresholds, reminder caps and failed-send behavior using synthetic invoices.

- [ ] Valid input produces the expected output.
- [ ] Missing/malformed input is rejected safely.
- [ ] Duplicate event is checked within one run and across separate runs.
- [ ] Provider timeout/permission errors are visible; there is no false success.
- [ ] Logs and alerts contain no secrets or unnecessary customer data.

## Files in this folder
- [`workflow.json`](./workflow.json) — n8n workflow export.
- [`Code.gs`](./Code.gs) — optional Google Sheets Apps Script adapter; use only when the workflow needs it.

For Apps Script use, create a separate test spreadsheet/project, set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`, run `setupSheet()`, deploy with an approved access policy, and test success, invalid token, malformed JSON, missing/duplicate request ID, and permission failure.

## Status and limitations
This file is a workflow template, not proof of a live end-to-end test. JSON/static checks do not prove n8n import compatibility, valid provider parameters, credentials, or successful API calls. Import and test the workflow, record the n8n version and execution evidence, and only then call it production-ready.

See [shared credentials guidance](../CREDENTIALS-GUIDE.md) and [testing report](../../TESTING-AND-VALIDATION.md).
