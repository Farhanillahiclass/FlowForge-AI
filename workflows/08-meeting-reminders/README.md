# 08 — Meeting Reminders

**Maintainer:** Muhammad Farhan  
**Event:** `meeting.reminder.dispatch`  
**Status:** Source-level update only; Calendar/Gmail/Sheets execution has not been verified.

## Purpose

Every 15 minutes, inspect Google Calendar events and email the first attendee with an email address when an event starts within the next 60 minutes. The `ReminderLog` sheet is used to reduce duplicate sends across ordinary runs.

## Node-by-node path

- Scheduled path: `Check Reminder Window → Get Upcoming Events (Google Calendar) → Filter Events Requiring Reminder → Read Sent Reminder Log → Exclude Already Sent Reminders → Send Meeting Reminder via Gmail → Record Reminder Sent → Return Reminder Send Result`
- Parent path: `Called by Parent Workflow → Normalize Parent Payload → Get Upcoming Events`

The reminder key is based on event ID/iCal UID plus the 60-minute window. The workflow currently chooses the first attendee with an email address.

## Configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Select Google Calendar, Google Sheets and Gmail OAuth credentials.
3. Replace `REPLACE_WITH_CALENDAR_ID` and `REPLACE_WITH_REMINDER_LOG_SPREADSHEET_ID`.
4. Create a `ReminderLog` tab with `reminderKey`, `eventId`, `recipient`, `summary`, and `sentAt` columns.
5. Keep the workflow inactive until tests pass.

## Apps Script adapter

`Code.gs` accepts a reminder request and stores it in `MeetingReminders`; it does not query Calendar or send mail. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Script Properties, run `setupSheet()`, and deploy only after reviewing web-app access settings. Never commit the token.

Example body:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "reminder-test-001",
  "data": {
    "eventId": "calendar-event-001",
    "email": "customer@example.com",
    "remindAt": "2026-10-20T14:00:00Z",
    "channel": "email"
  }
}
```

The adapter validates request ID, event ID, email, reminder date and email channel, checks sheet headers, and prevents duplicate request IDs or duplicate event/email pairs. It returns `deliveryPerformed: false` to avoid suggesting that an email has been sent. Apps Script and n8n are separate execution paths unless explicitly connected.

## Acceptance tests

1. Event more than 60 minutes away is not selected by the n8n filter.
2. Event starting within 0–60 minutes with an attendee email is selected.
3. Event with no attendee email is excluded.
4. Existing `reminderKey` is excluded from the pending list.
5. Invalid email/date, missing event ID/request ID, wrong token, malformed JSON and sheet schema mismatch fail clearly in Apps Script.
6. Repeated request ID or same event/email pair does not append a second queue row.
7. Gmail success followed by Sheets log failure: inspect execution history and reconcile before retrying.

## Known limitations

- Read-before-send/read-before-append can race when runs overlap.
- If Gmail succeeds but log append fails, a later run may resend. A durable outbox/idempotency store is needed for stronger delivery guarantees.
- Only the first attendee with an email address receives the reminder.
- Apps Script does not send reminders; n8n performs Gmail delivery.
- Live execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
