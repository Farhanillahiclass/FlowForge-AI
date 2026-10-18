# 04 — Inbox Triage Assistant

**Maintainer:** Muhammad Farhan  
**Event type:** `inbox.message.received`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Classify an incoming message with rule-based priority and category labels, log normal messages into an inbox queue, and log plus alert support for urgent messages.

## Input contract

The Header Auth Webhook expects fields such as `requestId` or `messageId`, `from`, `subject`, and `text` (or `snippet`). The current priority keywords include urgent/asap/blocked/outage/security/payment failed. Categories include billing, technical, scheduling and general.

## Workflow path

`Header Auth Webhook / parent entry → classify → High Priority? →`

- High priority: append the item to `InboxQueue`, then notify the configured support inbox with Gmail.
- Normal priority: append the item to `InboxQueue`.

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_INBOX_SPREADSHEET_ID` and `REPLACE_WITH_SUPPORT_EMAIL`. Create an `InboxQueue` tab with columns for request ID, sender, subject, text, priority, category, status and received time.

## Tests to run

Test urgent and normal messages, each category, empty inputs, duplicate message IDs, sheet permission failures, and alert-email failure. Verify the priority outcome and actual queue row.

## Limits

Classification is keyword-based, not an LLM classifier, and can miss context or produce false positives. This workflow does not connect to Gmail as an inbox trigger; it accepts a webhook message event. Add a real mailbox trigger and a durable unique constraint on `requestId` before relying on it as a production inbox system.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
