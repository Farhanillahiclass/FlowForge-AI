# Credentials & Integrations Guide

Credentials belong in your own n8n instance. **Never commit API keys, OAuth tokens, webhook secrets, passwords, production identifiers with sensitive access, or customer data.**

## Deployment sequence

1. Import the 20 canonical `workflows/<slug>/workflow.json` files into a **test** n8n project.
2. Select or create credentials under **n8n → Credentials** for the required nodes. Direct Webhook triggers use Header Auth in these exports.
3. Import `system/01-request-processor.json`. Select the correct child workflow ID in all 20 Execute Sub-workflow nodes.
4. Import `system/00-main-ingress.json`; select the Request Processor workflow and configure its Webhook Header Auth credential.
5. Import `system/90-central-error-handler.json`; configure the operations log and alert destination and assign it as an Error Workflow in workflow settings.
6. Replace `REPLACE_WITH_...` sample values directly in n8n, using test sheets, email accounts and API accounts that you control.
7. Keep workflows inactive until valid input, invalid input, duplicates, approval gates, provider failures, and destination-side effects have been checked.

## Integration matrix

| # | Workflow | Main configuration required |
|---:|---|---|
| 01 | Lead Capture & CRM | Google Sheets OAuth, Gmail OAuth, Leads spreadsheet ID, sales email, Header Auth |
| 02 | Lead Scoring & Routing | Score log spreadsheet, sales-priority recipient, Gmail OAuth, Header Auth |
| 03 | Email Follow-up Sequence | FollowUps sheet with email/consent/opt-out/due/count fields, Gmail OAuth, reminder-state columns |
| 04 | Inbox Triage Assistant | InboxQueue sheet, support email, Sheets/Gmail OAuth, Header Auth |
| 05 | Customer Support Desk | SupportTickets sheet, support email, Sheets/Gmail OAuth, Header Auth |
| 06 | FAQ & Human Handoff | Support email, Gmail OAuth, Header Auth |
| 07 | Meeting Booking System | Google Calendar OAuth, calendar ID, Header Auth; test availability conflicts/timezone |
| 08 | Meeting Reminders | Google Calendar OAuth, ReminderLog sheet, Gmail OAuth, calendar ID |
| 09 | Client Onboarding | Clients sheet, Gmail OAuth, client spreadsheet ID, Header Auth |
| 10 | Invoice & Payment Reminders | Invoices sheet with dueDate/status/reminderCount/email fields, Gmail OAuth |
| 11 | Content Creation & Approval | Anthropic API Header Auth credential, supported model name, content sheet, editor email, Gmail OAuth, Header Auth |
| 12 | Instagram Publishing Pipeline | Meta Graph API Header Auth credential, API version, Instagram User ID, public media URL, Header Auth on webhook |
| 13 | YouTube Publishing Assistant | YouTube OAuth credential, downloadable HTTPS video URL, video metadata, Header Auth on webhook |
| 14 | Content Repurposing | Anthropic API Header Auth credential, supported model name, content sheet, editor email, Gmail OAuth, Header Auth |
| 15 | Newsletter Campaign Builder | Subscribers sheet (email/consent/unsubscribed/audienceId), CampaignLog sheet, Gmail OAuth, Header Auth |
| 16 | Weekly Business Reporting | Leads and SupportTickets sheets, ReportLog sheet, report recipient, Google Sheets/Gmail OAuth |
| 17 | Feedback & Escalation | Feedback sheet, support email, Sheets/Gmail OAuth, Header Auth |
| 18 | Workflow Error Monitor | Gmail OAuth and operations alert email; assign as workflow Error Workflow |
| 19 | API Health Monitor | Ops alert email and Gmail OAuth; endpoint timeout/error policy |
| 20 | Telegram Business Assistant | Telegram bot credential, Leads and SupportTickets sheets, support email, Header Auth, Sheets/Gmail OAuth |

## Important notes

- Header Auth credentials must be selected on Webhook nodes in n8n; a `headerAuth` setting alone doesn't make the node usable until a credential is assigned.
- The central Request Processor targets each canonical workflow by workflow ID. Those IDs belong to your n8n instance and can't be populated from GitHub statically.
- Instagram publishing, YouTube upload, Anthropic API calls, Telegram responses, Calendar creation and Gmail/Sheets actions require credentials and provider-side tests.
- Newsletter subscribers must have valid consent and not be unsubscribed. Test with internal addresses only before any real mailing.
- The follow-up and reminder logs use read-before-write duplicate checks; concurrency and timeouts around external sends can still require reconciliation.
- These examples use Google Sheets as a compact starter data store. High-volume/financial/mission-critical workflows should use durable databases, uniqueness constraints, monitoring and reviewed retry/dead-letter policies.

See [system deployment steps](../system/README.md), [architecture](../docs/ARCHITECTURE.md), and [Testing & Validation](../TESTING-AND-VALIDATION.md).
