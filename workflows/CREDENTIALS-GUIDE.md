# FlowForge-AI — Setup, Credentials, and End-to-End Testing Guide

**Maintainer:** Muhammad Farhan  
**Repository:** https://github.com/Farhanillahiclass/FlowForge-AI

> **Honest status:** These JSON files are starter workflow templates at different levels of completeness. This guide does not claim every workflow is production-ready or live-tested. Import each file into your own n8n version and verify its nodes, connections, credentials, and outputs before use. Workflows that only transform input or fetch an API do not automatically save records, send messages, or publish content.

## 1. Before importing

1. Use a current supported n8n release and back up your instance.
2. Download one workflow JSON from the `workflows/` folder.
3. In n8n, choose **Import from File**.
4. Open every node and check for warnings, missing node types, and invalid parameters.
5. Configure credentials through **Credentials**. Never put secrets in Code nodes or commit them to GitHub.
6. Replace placeholders (spreadsheet IDs, sheet names, recipients, channel/chat IDs, URLs).
7. Execute with synthetic test data. Inspect each node output and the execution log.
8. Do not activate until all branches and failure paths have been tested.

## 2. Workflow-by-workflow requirements and completeness

| # | Workflow file | Current function | External credentials | What is still required for a business-ready deployment |
|---:|---|---|---|---|
| 01 | `01-hello-world.json` | Manual health-check output | None | Add a Schedule Trigger or monitoring destination only if you need recurring alerts. |
| 02 | `02-current-time.json` | UTC date/time formatting | None | Set and test the business timezone if local time is required. |
| 03 | `03-text-cleaner.json` | Normalizes supplied text | None | Connect a real source and destination node if it must process or store live messages. |
| 04 | `04-lead-score.json` | Webhook lead scoring | None for current rule-based scoring | Add a CRM/Sheets write node, duplicate check, notification, and protected webhook before using for live leads. Tune scoring rules to your sales process. |
| 05 | `05-expense-summary.json` | Summarizes incoming expense items | None for supplied input | Add a real expense source and report destination; confirm currency and accounting rules. |
| 06 | `06-record-normalizer.json` | Normalizes contact records | None | Add source/destination nodes and duplicate handling for live CRM data. |
| 07 | `07-support-ticket-triage.json` | Webhook support-ticket classification | None for current classification | Add ticket storage/helpdesk, Slack or Telegram alert, and optional Gmail acknowledgement. Verify node branches and customer-data permissions. |
| 08 | `08-faq-matcher.json` | Keyword-based FAQ suggestion | None | Connect an approved knowledge base/helpdesk and human handoff. Treat unmatched questions as needing review. |
| 09 | `09-url-validator.json` | Checks URL syntax/protocol | None | Add a source and destination if processing real submissions; syntax validation does not prove a URL is safe. |
| 10 | `10-low-stock-alert.json` | Flags low stock in supplied items | None | Connect inventory source, persistent log, and a notification node (Gmail/Slack/Telegram). |
| 11 | `11-daily-quote.json` | Returns a team message manually | None | Add Schedule Trigger plus a selected channel node (Slack/Telegram/email) for automatic delivery. |
| 12 | `12-deadline-checker.json` | Classifies supplied deadlines | None | Connect a task source (e.g., Google Calendar or Sheets), Schedule Trigger, and alert destination. Define timezone/SLA rules. |
| 13 | `13-data-quality-check.json` | Validates supplied records | None | Connect input source and quarantine/report destination; define required fields for your data. |
| 14 | `14-weather-lahore.json` | Calls Open-Meteo | Normally none | Add schedule, threshold/IF decision, and notification if you need alerts. Public API availability can change. |
| 15 | `15-github-repo-info.json` | Fetches repository metadata | Public repo normally needs none | Add threshold checks and a report/notification node if you want monitoring. Authenticated API calls may need GitHub credentials. |
| 16 | `16-sample-posts.json` | Fetches example posts | None for public demo API | JSONPlaceholder is demo data, not a production source. Replace with an approved source and destination. |
| 17 | `17-random-joke.json` | Fetches a public API response | Normally none | Add schedule and a delivery node only if that is the intended use. Verify provider availability and content suitability. |
| 18 | `18-pokemon-info.json` | Fetches a public PokéAPI entity | Normally none | Educational/API demo; replace with the intended source and add destination nodes for real business use. |
| 19 | `19-currency-rates.json` | Fetches reference exchange rates | Normally none | Rates are informational, not a guaranteed transaction quote. Add scheduling, validation, storage, and report delivery if needed. |
| 20 | `20-webhook-lead-capture.json` | Webhook validation with Sheets/Gmail action nodes | Google Sheets OAuth and Gmail credentials | Configure spreadsheet ID/tab and column headers, select credentials, verify field mapping after the Sheets node, secure the webhook, and test both success and failure paths. |

## 3. Credential setup

### Google Sheets

1. In n8n, create/select a Google Sheets OAuth credential using n8n's credential UI.
2. Sign in with the Google account that has edit access to the spreadsheet.
3. Create a sheet tab (example: `Leads`) and add headers matching the fields to store, such as `name`, `email`, `company`, `source`, `message`, `status`, `receivedAt`.
4. Replace `YOUR_GOOGLE_SHEET_ID` with the ID from your spreadsheet URL.
5. Select the correct credential and execute with a test row.
6. Confirm the row was appended correctly. Avoid storing sensitive data that is not needed.

### Gmail

1. Create/select a Gmail credential in n8n and complete its supported authorization flow.
2. Check that the connected account is permitted to send the message.
3. Configure recipient, subject, and message. Use the incoming validated email field, not an unrelated node's output.
4. Test delivery to an address you control. Check spam and the n8n execution log.

### Slack

1. Create/select a Slack credential using the supported n8n authentication method.
2. Grant only the required scopes and add the app/bot to the target channel if required.
3. Select the channel explicitly and send a harmless test notification.
4. Do not expose bot tokens or private channel details in committed files.

### Telegram

1. Create a bot using the official BotFather flow and keep the token private.
2. Store the token in n8n Credentials; do not paste it into workflow JSON.
3. Obtain the intended chat ID and configure the Telegram node.
4. Test in a private test chat before using a customer-facing group.

### Google Calendar

1. Create/select the Google Calendar OAuth credential.
2. Grant access only to the calendar the workflow needs.
3. Choose the correct calendar, timezone, and event fields.
4. Test create/update/search behavior on a test calendar before using a real schedule.

### Instagram and YouTube

1. Confirm the account is eligible for the relevant official API and app permissions.
2. Configure the official Meta/Google API credentials in n8n and follow provider review/permission requirements.
3. Add the actual publish/upload node, map media and captions, and handle upload status/errors.
4. Do not assume an API-fetch workflow can publish content; publishing requires explicit action nodes and appropriate permissions. Test with non-public or draft/private settings where available.

## 4. Recommended production structure

For business lead and support automations, aim for:

`Trigger → Validate → Normalize → Deduplicate → Route (IF/Switch) → Persist → Notify → Respond → Error handling`

- **Trigger:** Webhook, Schedule Trigger, or a supported app event.
- **Validate:** reject missing/invalid required fields.
- **Normalize:** consistent names, email casing, timestamps, and status values.
- **Deduplicate:** use a stable lead/ticket ID or unique key before creating a record.
- **Route:** hot/warm/cold lead or urgent/normal ticket branches.
- **Persist:** save the original request and processing status to the approved CRM/Google Sheets/helpdesk.
- **Notify:** send only the appropriate notification to Gmail, Slack, or Telegram.
- **Respond:** return a clear webhook response or user acknowledgement.
- **Error handling:** use n8n error workflow/Error Trigger where appropriate, log execution IDs, and alert an owner without leaking secrets or full customer records.

## 5. Webhook test examples

Use n8n's **Test URL** while testing. Do not publish or share the Production URL until access controls are configured.

Valid sample body:
```json
{
  "name": "Test Customer",
  "email": "test@example.com",
  "company": "Example Ltd",
  "source": "website",
  "message": "I would like to learn about your services."
}
```

Invalid sample body:
```json
{
  "name": "Test Customer",
  "email": "not-an-email",
  "message": "This should fail validation."
}
```

Check the HTTP response, node outputs, spreadsheet row, email delivery, and execution history. Use only test information.

## 6. Release checklist

- [ ] Workflow imports without missing-node or parameter warnings.
- [ ] Every required credential is selected in the node.
- [ ] Every placeholder has been replaced.
- [ ] All nodes are connected to the intended branch.
- [ ] Valid, invalid, empty, duplicate, and unexpected inputs are tested.
- [ ] API timeout/rate-limit and node-failure paths are handled.
- [ ] Notifications are sent only once and to the intended destination.
- [ ] Webhooks are protected; least-privilege credentials are used.
- [ ] No secrets, private webhook URLs, or real customer records are committed.
- [ ] README describes the workflow's actual behavior, not planned features.
- [ ] End-to-end execution has been verified in the target n8n version.

## 7. Security reminder

Never commit passwords, API keys, OAuth tokens, bot tokens, private webhook URLs, or customer records to this public repository. Store credentials inside n8n and rotate any secret that is accidentally exposed.

**Maintainer:** Muhammad Farhan
