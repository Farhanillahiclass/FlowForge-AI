# Credentials & Integrations Guide

Credentials belong in your own n8n instance. **Never commit API keys, OAuth tokens, webhook secrets, passwords, production spreadsheet IDs with sensitive access, or customer data.**

## Deployment sequence

1. Import a workflow into a **test** n8n project.
2. Open credential-requiring nodes and create/select credentials under **n8n → Credentials**.
3. Replace every `REPLACE_WITH_...` placeholder and sample identifier in the node settings.
4. Grant least-privilege provider permissions and use accounts you control.
5. Test success, invalid input, duplicate event, timeout, and permission-denied cases with synthetic data.
6. Keep message publishing, newsletter sends, payment reminders, and customer-facing actions inactive until reviewed.

## Per-workflow integration matrix

| # | Workflow | Typical credentials and configuration |
|---:|---|---|
| 01 | Lead Capture & CRM | Google Sheets OAuth, Gmail OAuth, spreadsheet ID, `Leads` tab, sales recipient |
| 02 | Lead Scoring & Routing | CRM/Sheets for score logs; sales/nurture notification channel |
| 03 | Email Follow-up Sequence | CRM/Sheets, permitted email provider, opt-out/suppression source, schedule/time zone |
| 04 | Inbox Triage Assistant | Gmail/mailbox trigger, ticket/helpdesk store, Slack or Telegram |
| 05 | Customer Support Desk | Helpdesk or Sheets, Gmail, support alert channel, SLA rules |
| 06 | FAQ & Human Handoff | Approved FAQ source, support/ticket system, human handoff channel |
| 07 | Meeting Booking System | Google Calendar OAuth, calendar ID/time zone, optional Gmail confirmation |
| 08 | Meeting Reminders | Google Calendar, Gmail/Telegram, persistent reminder-send record |
| 09 | Client Onboarding | CRM/Sheets, Gmail, Calendar, onboarding template |
| 10 | Invoice & Payment Reminders | Invoice source, email provider, reminder status/cap fields |
| 11 | Content Creation & Approval | LLM provider, draft storage, approval channel |
| 12 | Instagram Publishing Pipeline | Eligible Instagram professional account, Meta API permissions, HTTPS media URL |
| 13 | YouTube Publishing Assistant | YouTube Data API OAuth and a video file/binary source |
| 14 | Content Repurposing | LLM provider, content storage, approval channel, optional platform APIs |
| 15 | Newsletter Campaign Builder | Consented subscriber source, email provider, unsubscribe/suppression data |
| 16 | Weekly Business Reporting | CRM/Sheets/helpdesk metrics, KPI/date-window definition, Gmail report destination |
| 17 | Feedback & Escalation | Sheets/CRM, private Slack/Telegram alert channel, optional Gmail |
| 18 | Workflow Error Monitor | Operator email/Slack/Telegram and an error-log destination |
| 19 | API Health Monitor | HTTP endpoints, timeout policy, optional state store, alert channel |
| 20 | Telegram Business Assistant | Telegram bot credential; optional CRM/Sheets and support-action credentials |

## Core system-layer setup

The [system folder](../system/README.md) provides main ingress, a dispatcher, child workflow examples for lead capture/lead scoring/support tickets, and a central error handler.

1. Import the three child workflows first: `system/10-lead-capture-subflow.json`, `system/11-lead-scoring-subflow.json`, and `system/12-support-ticket-subflow.json`.
2. Import `system/01-request-processor.json`. In each Execute Sub-workflow node, select the matching imported child workflow from the n8n list.
3. Import `system/00-main-ingress.json`. Select the request processor and configure the Webhook node's Header Auth credential.
4. Import `system/90-central-error-handler.json`. Select the ops-log spreadsheet and alert recipient, then assign this workflow under **Workflow Settings → Error Workflow** for workflows that need it.
5. Configure spreadsheet tabs/headers and recipient addresses; test with data you control before activation.

## Reliability limits to understand

- The sheet-based duplicate check reads existing rows and is suitable only for small volumes. For higher volume or concurrent requests, use a database with a unique constraint or a provider-supported idempotency key.
- A request that fails after a provider side effect may need reconciliation. Do not blindly replay it or claim exactly-once execution.
- Google Sheets/Gmail/Meta/YouTube/Telegram actions cannot run until the target instance has valid credentials and IDs.
- The system dispatcher currently supports three event types; the other 17 business templates are not yet connected to that central dispatcher.
