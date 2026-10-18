# 17 — Customer Feedback & Escalation

**Maintainer:** Muhammad Farhan  
**Event type:** `feedback.received`  
**Status:** Static-checked template; live Sheets/Gmail execution not yet verified.

## Purpose

Validate a feedback item, log it in Google Sheets, and notify support when the rating is 1 or 2 out of 5. Other valid ratings are recorded without the urgent alert path.

## Input contract

Required: stable `requestId`, feedback text, and numeric `rating` from 1 through 5. Optional: `name` and `email`.

## Workflow path

`Header Auth Webhook / parent entry → validate rating/feedback → valid? → Low Rating? → append Feedback row → Gmail support alert for 1–2 rating → structured result`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_FEEDBACK_SPREADSHEET_ID` and `REPLACE_WITH_SUPPORT_EMAIL`. Create a `Feedback` tab with columns for request ID, name, email, rating, feedback, route and received time.

## Tests to run

Test ratings 1, 2, 3 and 5, missing feedback, invalid rating, duplicate request ID, sheet failure, and support alert failure. Verify that the correct route runs and that the log row exists.

## Limits

Low-rating alerts are attempts, not proof that a human has read or resolved the case. This workflow does not yet deduplicate feedback by `requestId`, assign case owners or track resolution SLAs. Add a unique event key and case status transitions if it becomes a production customer-experience system.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
