# 07 — Meeting Booking System

**Maintainer:** Muhammad Farhan  
**Event type:** `meeting.booking.requested`  
**Status:** Static-checked template; Calendar execution not yet verified.

## Purpose

Validate a meeting request and create a Google Calendar event using the supplied future start/end times.

## Input contract

Required: stable `requestId`, `name`, valid `email`, future `start`, and `end` later than `start`. Optional: `topic` and `timezone`. Use ISO-8601 timestamps with an explicit timezone/offset to avoid ambiguity.

## Workflow path

`Header Auth Webhook / parent entry → validate booking fields → valid? → Google Calendar event create → structured result`

## Configuration

Select Google Calendar OAuth credentials and replace `REPLACE_WITH_CALENDAR_ID`. Direct Webhook calls require Header Auth. Check your n8n Google Calendar node version before use.

## Tests to run

Test valid future event, past start, end before start, invalid email, missing request ID, calendar permission error, and a meeting that conflicts with an existing calendar event. Verify the event itself in Calendar.

## Limits

The current workflow **does not query free/busy or detect conflicting bookings before creating an event**, and it does not yet send a separate confirmation email to the requester. Add those steps before using it as a public booking system. Static response output is not proof the event was successfully created.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
