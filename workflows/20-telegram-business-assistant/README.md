# 20 — Telegram Business Assistant

**Maintainer:** Muhammad Farhan  
**Event type:** `telegram.command.received`  
**Status:** Static-checked template; live Telegram/Sheets/Gmail execution not yet verified.

## Purpose

Parse incoming Telegram-style update data, route `/start`, `/help`, `/lead`, and `/support` commands, persist new lead/support requests, and respond in the originating chat. Unknown commands receive a help response.

## Supported commands

- `/start` — send a welcome message.
- `/help` — show the command menu.
- `/lead Full Name | email@example.com | Company` — validate and save a lead.
- `/support Describe your issue here` — save a support request, email the support inbox, and acknowledge the user.

The Telegram update should provide `message.text` and `message.chat.id`; a stable `update_id` is used as the request ID when present.

## Workflow path

`Header Auth Webhook / parent entry → parse command → Switch → Telegram response, Google Sheets lead save, or support-ticket log + Gmail handoff`

## Configuration

Select Telegram, Google Sheets and Gmail credentials. Replace `REPLACE_WITH_LEADS_SPREADSHEET_ID`, `REPLACE_WITH_SUPPORT_SPREADSHEET_ID`, and `REPLACE_WITH_SUPPORT_EMAIL`. Create `Leads` and `SupportTickets` tabs. If Telegram calls the Webhook directly, configure Header Auth to match an appropriate secret header that your Telegram delivery setup can send, or route requests through a trusted gateway.

## Tests to run

Test each command, malformed lead format, invalid email, short support text, unknown command, missing chat ID, repeated `update_id`, and each provider permission failure. Use a test bot and test sheets only.

## Limits and security

The workflow uses a Webhook to receive Telegram update-shaped JSON; it is not connected to a native Telegram Trigger node. The `/lead` and `/support` actions currently don't deduplicate by a persistent update ID before writing. Restrict callers at the gateway/webhook, don't expose the webhook publicly without authentication, and add a durable unique key before production.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
