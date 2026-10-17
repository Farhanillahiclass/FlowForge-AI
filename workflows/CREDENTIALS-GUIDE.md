# Workflow-by-Workflow Credential Guide

**Project:** FlowForge-AI  
**Maintainer:** Muhammad Farhan

This guide explains the credentials and account setup to check for each workflow. Credential requirements can vary with the nodes actually present in the JSON and your n8n version. Open the imported workflow and confirm each node's credential selector before running.

## Before you begin

1. Import one workflow into n8n.
2. Open **Credentials** and create the required credential type.
3. Authenticate using n8n's credential UI. Do not paste secrets into workflow Code nodes or GitHub.
4. Replace example IDs, recipients, channel IDs, and other placeholders.
5. Test with dummy data and verify every node output before activating.

## Workflow-by-workflow

| # | File | Credentials / setup | Test checklist |
|---:|---|---|---|
| 01 | `01-hello-world.json` | No external credentials for the basic local demo. | Import, execute manually, inspect output. |
| 02 | `02-current-time.json` | No external credentials for the basic local demo. | Execute and check timezone expectations. |
| 03 | `03-text-cleaner.json` | No external credentials for the basic local demo. | Test blank strings, extra spaces, and Unicode text. |
| 04 | `04-lead-score.json` | No external credentials for the basic sample. If connecting to a CRM, add that provider's credential. | Test high-, medium-, and low-score cases. |
| 05 | `05-expense-summary.json` | No external credentials for sample data. For live expense rows, configure the source app credential. | Check totals and currency handling. |
| 06 | `06-record-normalizer.json` | No external credentials for local input. | Test missing names, uppercase emails, and invalid emails. |
| 07 | `07-support-ticket-triage.json` | Google Sheets OAuth credential, Slack credential, and Gmail credential. Replace `YOUR_GOOGLE_SHEET_ID` and `YOUR_SLACK_CHANNEL_ID`; prepare the expected sheet tab. | Submit a normal and urgent ticket; verify logging, Slack alert path, and customer email. |
| 08 | `08-faq-matcher.json` | No external credentials for local FAQ data. For a live helpdesk/knowledge base, configure that source's credential. | Test known and unknown questions. |
| 09 | `09-url-validator.json` | No external credentials for local validation. | Test valid HTTPS, malformed URLs, and blank input. |
| 10 | `10-low-stock-alert.json` | No external credentials for sample inventory. Live alerts need the source credential plus the notification service credential. | Test stock above, at, and below threshold. |
| 11 | `11-daily-quote.json` | No external credentials for local quote data. A scheduled version needs a Schedule Trigger configuration. | Confirm quote output and intended schedule/timezone. |
| 12 | `12-deadline-checker.json` | No external credentials for sample tasks. Live tasks require the relevant source credential. | Test overdue, due-today, and future dates. |
| 13 | `13-data-quality-check.json` | No external credentials for sample records. Live records require a source credential. | Test missing required fields and malformed values. |
| 14 | `14-weather-lahore.json` | HTTP Request to Open-Meteo; public endpoint normally needs no API credential. Internet access required. | Run the request and check HTTP status and response fields. |
| 15 | `15-github-repo-info.json` | Public GitHub repository requests may work without credentials. For authenticated access, configure GitHub credentials/token in n8n. | Test the repository URL, response status, and rate-limit behavior. |
| 16 | `16-sample-posts.json` | JSONPlaceholder public API normally requires no credential. Internet access required. | Check HTTP status and returned sample records. |
| 17 | `17-random-joke.json` | The configured public joke API normally requires no credential. Internet access required. | Check HTTP status and handle unavailable responses. |
| 18 | `18-pokemon-info.json` | PokéAPI public endpoint normally requires no credential. Internet access required. | Check the requested Pokémon name and response fields. |
| 19 | `19-currency-rates.json` | Frankfurter public reference-rate endpoint normally requires no credential. Internet access required. | Confirm base currency, date, and returned rate fields. |
| 20 | `20-webhook-lead-capture.json` | Google Sheets OAuth and Gmail credentials. Replace `YOUR_GOOGLE_SHEET_ID`; ensure the sheet tab/header fields are correct. Configure the webhook endpoint and protect it before production. | Test valid email, invalid email, Sheets append, acknowledgement email, and webhook response. |

## Credential setup notes

### Google Sheets
- In n8n, create the Google Sheets credential using the supported Google OAuth flow.
- Ensure the connected Google account can edit the target spreadsheet.
- Set the correct spreadsheet ID and tab name. Add header columns that match the fields being written.
- Never place OAuth client secrets or access tokens in a workflow JSON committed to GitHub.

### Gmail
- Create a Gmail credential through n8n's supported authentication flow.
- Verify that the connected account is permitted to send email.
- Test with your own email address first; confirm recipients and message text before using customer addresses.

### Slack
- Create a Slack credential and grant only the permissions needed by the workflow.
- Select the correct workspace/channel and verify the channel ID.
- Test alerts in a private test channel before routing real customer issues.

### Telegram
- Create a bot through Telegram's BotFather and keep its token private.
- Add the bot to the intended chat/group and find the correct chat ID.
- Store the token only in n8n Credentials. Never commit it to GitHub.

### Google Calendar
- Connect Google Calendar through n8n's credential flow and select the correct calendar.
- Test using a temporary event. Confirm timezone and event start/end formats.
- A basic create-event node does not guarantee availability checks or prevent double-booking.

### Instagram and YouTube
- Instagram publishing depends on Meta account eligibility, app configuration, permissions, and API support.
- YouTube upload requires appropriate Google/YouTube OAuth and API configuration.
- Content approval/checklist automation should not be described as automatic publishing unless a publish node and authorized credentials are actually configured.

## Safe production checklist

- [ ] No secrets or customer information committed to GitHub.
- [ ] Every credential is selected in n8n and connection tested.
- [ ] All example IDs and recipient addresses replaced.
- [ ] Valid, invalid, and unexpected input tested.
- [ ] Error path and retry behavior reviewed.
- [ ] Webhook authentication and access controls configured.
- [ ] Customer consent, privacy, and data retention considered.
- [ ] Workflow only activated after end-to-end verification.

**Reminder:** this document provides setup guidance; it does not mean every listed integration is already connected or that every workflow has been live-tested.
