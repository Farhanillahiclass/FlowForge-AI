# 03 — Email Follow-up Sequence

**Maintainer:** Muhammad Farhan  
**Event type:** `email.followup.dispatch`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Run a daily due-contact scan, exclude opted-out or unsubscribed contacts, send follow-up emails, then persist the follow-up count and next due time. The same workflow can be called by the parent dispatcher to run the scan on demand.

## Required FollowUps sheet fields

Use a `FollowUps` tab with at least `email`, `consent`, `optedOut` or `unsubscribed`, `nextFollowUpAt`, and `followUpCount`. Add `name`, `followUpSubject`, `followUpBody`, and `status` where useful. Create matching headers for the state update fields `lastFollowUpAt` and `nextFollowUpAt`.

A row is eligible when the email is valid, consent is true, the contact is not opted out/unsubscribed, `nextFollowUpAt` is due, and `followUpCount` is below 3. After a successful Gmail send, the workflow increments the count and schedules the next follow-up 72 hours later.

## Workflow path

`Schedule (daily) → Read FollowUps → consent/due/count filter → Gmail send → update row`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_FOLLOWUPS_SPREADSHEET_ID`. Test with internal addresses first and ensure the fields/column headers match the node mappings.

## Tests to run

Test an eligible row, future-due contact, invalid email, missing consent, opted-out contact, contact at the reminder limit, repeated schedule run, and provider failure. Verify the sheet state changes only after the send step succeeds.

## Limits

The sent-email operation and sheet update are separate actions. If Gmail sends but the state update fails, the next run could resend; a read-before-write sheet check is not a transaction. Add reconciliation or a durable outbox/idempotency key before production. This starter does not implement an automated unsubscribe mailbox processor.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
