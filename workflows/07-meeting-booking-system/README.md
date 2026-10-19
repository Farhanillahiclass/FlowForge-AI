# 07 — Meeting Booking System

**Maintainer:** Muhammad Farhan  
**Event:** `meeting.booking.requested`  
**Status:** Source-level update only; Google Calendar execution and conflict detection are not verified.

## Purpose

Validate a future meeting request and create a Google Calendar event in n8n. The Apps Script adapter only validates and logs a booking request; it does not create an event or check availability.

## n8n node paths

- Standalone: `Receive Booking Request (Header Auth Webhook) → Validate Booking Fields → Request Valid? → Create Calendar Event → Return Booking Accepted`
- Invalid input: `Request Valid? (false) → Return Invalid Booking`
- Parent workflow: `Called by Parent Workflow → Normalize Parent Payload → Validate Booking Fields`

Required fields: stable `requestId`, name, valid email, future `start`, and `end` later than start. Use ISO-8601 timestamps with explicit timezone offsets. `timezone` and `topic` are optional.

## Setup

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth for the webhook.
3. Select Google Calendar OAuth credentials and replace `REPLACE_WITH_CALENDAR_ID`.
4. Use a dedicated test calendar and verify created events directly in Google Calendar.
5. Keep the workflow inactive until tests pass.

## Apps Script adapter

Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Apps Script Script Properties, then run `setupSheet()`. Deploy as a Web App only after reviewing access settings. Do not commit the token.

Example body:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "booking-test-001",
  "data": {
    "name": "Test Customer",
    "email": "customer@example.com",
    "start": "2026-10-20T15:00:00+05:00",
    "end": "2026-10-20T15:30:00+05:00",
    "timezone": "Asia/Karachi",
    "topic": "Discovery call"
  }
}
```

The adapter checks name/email, explicit timestamp offsets, future start, end-after-start, duplicate request ID and sheet schema. It records status `requested` and returns `calendarEventCreated: false` so a logged request is not mistaken for a confirmed calendar booking. n8n and Apps Script are separate execution paths unless explicitly connected.

## Acceptance tests

1. Valid future booking is accepted by validation.
2. Past start, end before/equal to start, invalid email, missing name or request ID are rejected.
3. Timestamps without explicit timezone offsets are rejected by Apps Script.
4. Duplicate request ID does not append another row.
5. Wrong token, missing Script Properties, malformed JSON and mismatched headers fail clearly.
6. Google Calendar permission error is visible in n8n execution history.
7. Verify whether the selected time conflicts with an existing event before calling the workflow production-ready.

## Known limitations

- **No free/busy check:** n8n currently creates the event without first querying Google Calendar availability. Conflicting bookings may be created.
- No separate confirmation email is sent by the current workflow.
- Calendar creation and any later notification are separate side effects; inspect execution history before retrying.
- The Apps Script adapter only logs a booking request and does not create a calendar event.
- Live execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
