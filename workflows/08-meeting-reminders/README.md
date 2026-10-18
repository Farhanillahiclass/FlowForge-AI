# 08 — Meeting Reminders

**Maintainer:** Muhammad Farhan  
**Event type:** `meeting.reminder.dispatch`  
**Status:** Static-checked template; calendar/email execution not yet verified.

## Purpose

Every 15 minutes, inspect Google Calendar events and send an email to the first attendee with an email address when the event begins within the next 60 minutes. A `ReminderLog` sheet stores reminder keys to reduce duplicate sends across normal runs.

## Workflow path

`15-minute Schedule / parent entry → read upcoming Calendar events → select 0–60 minute window → read ReminderLog → exclude logged keys → Gmail reminder → append log row`

## Configuration

Select Google Calendar, Google Sheets and Gmail credentials. Replace `REPLACE_WITH_CALENDAR_ID` and `REPLACE_WITH_REMINDER_LOG_SPREADSHEET_ID`. Create a `ReminderLog` tab with `reminderKey`, `eventId`, `recipient`, `summary` and `sentAt` columns.

## Tests to run

Test an event more than 60 minutes away, an event in the reminder window, cancelled/malformed events, no attendee email, an already logged reminder key, Gmail failure, and Sheet logging failure. Confirm the event's timezone and start field shape in your calendar export.

## Limits

The log uses a read-before-send/read-before-append pattern; overlapping runs can race. A successful email followed by a failed log can lead to a repeat on a later run. It currently sends only to the first attendee with an email, not all attendees, and it does not yet issue recovery/change alerts.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
