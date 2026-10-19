# 03 — Email Follow-up Sequence

**Maintainer:** Muhammad Farhan  
**Event type:** `email.followup.dispatch`  
**Status:** Consent-aware Apps Script intake contract added; live provider execution not verified.

## Purpose

The n8n workflow scans a `FollowUps` sheet daily, selects due contacts who have consented and have not opted out, sends follow-up emails, then updates the follow-up count and next due time. A parent workflow call triggers the same scan; it does not send only the one contact in the parent payload.

## Node-by-node path

`Schedule Trigger (daily) OR Called by Parent Workflow → Normalize Parent Payload (parent path) → Read Follow-up Contacts → Prepare Safe Follow-up Run → Any Follow-up Due?`

- Due contact → `Send Consent-Aware Follow-up → Update Follow-up State → Return Follow-up Result`.
- No due contacts → `Return Nothing Due`.

Eligibility checks: valid email, consent true, no opt-out/unsubscribe, valid `nextFollowUpAt` at or before now, and `followUpCount < 3`.

## Required n8n setup

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Select Google Sheets OAuth credentials and replace `REPLACE_WITH_FOLLOWUPS_SPREADSHEET_ID` in both read and update nodes.
3. Create a `FollowUps` tab. Required columns include `email`, `consent`, `optedOut` (or `unsubscribed`), `nextFollowUpAt`, `followUpCount`, and any fields used in the email template.
4. Select Gmail OAuth credentials. Test with internal addresses only.
5. Keep the workflow inactive until acceptance tests pass.

## Apps Script intake adapter (`Code.gs`)

This endpoint records a consent-aware contact in the same `FollowUps` sheet schema. It **does not send email**; n8n performs the email action. Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`, then run `setupSheet()` once. Do not commit the token. The endpoint requires a valid request ID, contact ID, email, explicit consent, a valid next due date, and follow-up count from 0 to 2. Opted-out contacts are rejected, duplicate request IDs are not appended again, and a second row for the same email is blocked.

Example body:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "followup-test-001",
  "data": {
    "contactId": "contact-001",
    "email": "test@example.com",
    "consent": true,
    "optedOut": false,
    "nextFollowUpAt": "2026-10-20T12:00:00Z",
    "followUpCount": 0,
    "followUpSubject": "Following up",
    "followUpBody": "Hello, this is a test message."
  }
}
```

## Acceptance tests

1. Consented contact with due date in the past is eligible in n8n.
2. Future due date, missing consent, opted-out contact, invalid email, or count >=3 is skipped.
3. Successful Gmail send updates the follow-up state.
4. Repeated Apps Script request ID creates no second row.
5. Same email under a different request ID is returned as `contact_exists`.
6. Missing Script Properties, bad token, malformed JSON, and mismatched sheet headers return an explicit failure.
7. Test Gmail success followed by Sheets update failure; confirm recovery is manual and does not silently report the state update as complete.

## Known limitations

- Gmail send and Sheets state update are separate actions; if the send succeeds but the state update fails, a later run can resend. Use a durable outbox/idempotency strategy before production.
- The Apps Script endpoint is not called by the n8n workflow unless an HTTP Request node is explicitly added.
- The Apps Script duplicate check prevents duplicate rows, but it does not provide a transaction across Gmail and Google Sheets.
- Live execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)
