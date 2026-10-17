<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:EA4B71&height=190&section=header&text=FlowForge-AI&fontSize=44&fontColor=FFFFFF&animation=fadeIn&desc=Business%20Automation%20with%20n8n&descAlignY=65&descSize=16" alt="FlowForge-AI — business automation with n8n" />

![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Workflows](https://img.shields.io/badge/Workflow%20Templates-20-4F46E5?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-0F766E?style=for-the-badge)

**Practical n8n workflows for business leads, customer support, reporting, and connected apps.**

Built and maintained by **Muhammad Farhan**.

</div>

## About

**FlowForge-AI** is a collection of n8n workflow templates designed to help automate repetitive business tasks. The project focuses on lead capture, customer support, notifications, data processing, reports, and API integrations.

> **Please note:** a workflow JSON file is not automatically production-ready. Review node compatibility, configure credentials, set your own IDs and destinations, and test with sample data before activation.

## Quick start

1. Install or open your n8n instance.
2. Download a workflow JSON from the [workflows folder](./workflows/).
3. In n8n, choose **Import from File** and select the JSON file.
4. Open every integration node and configure the correct credential from **Credentials**.
5. Replace placeholders such as `YOUR_GOOGLE_SHEET_ID`, `YOUR_SLACK_CHANNEL_ID`, and `YOUR_TELEGRAM_CHAT_ID`.
6. Use the webhook **Test URL** first, where applicable.
7. Execute a test with non-sensitive sample data. Check every node's output and any error messages.
8. Activate the workflow only after the full path has been tested.

## Workflow catalog

| # | Workflow | Trigger / purpose | Credential guidance |
|---:|---|---|---|
| 01 | [Hello World](workflows/01-hello-world.json) | Manual test / greeting | No external credentials for the basic demo |
| 02 | [Current Timestamp](workflows/02-current-time.json) | Manual / date-time formatting | No external credentials for the basic demo |
| 03 | [Text Cleaner](workflows/03-text-cleaner.json) | Manual / normalize text | No external credentials for the basic demo |
| 04 | [Lead Scoring](workflows/04-lead-score.json) | Manual / rule-based sample scoring | No external credentials for the basic demo |
| 05 | [Expense Summary](workflows/05-expense-summary.json) | Manual / sample expense totals | No external credentials for the basic demo |
| 06 | [Record Normalizer](workflows/06-record-normalizer.json) | Manual / normalize records | No external credentials for the basic demo |
| 07 | [Support Ticket Triage](workflows/07-support-ticket-triage.json) | Webhook / classify and log support tickets | Google Sheets, Slack and Gmail credentials; set sheet ID, tab, and Slack destination |
| 08 | [FAQ Matcher](workflows/08-faq-matcher.json) | Manual / local FAQ matching | No external credentials for the basic demo |
| 09 | [URL Validator](workflows/09-url-validator.json) | Manual / validate URL strings | No external credentials for the basic demo |
| 10 | [Low Stock Alert](workflows/10-low-stock-alert.json) | Manual / flag low stock | No external credentials for the basic demo |
| 11 | [Daily Quote](workflows/11-daily-quote.json) | Manual / local quote | No external credentials for the basic demo |
| 12 | [Deadline Checker](workflows/12-deadline-checker.json) | Manual / deadline status | No external credentials for the basic demo |
| 13 | [Data Quality Check](workflows/13-data-quality-check.json) | Manual / validate sample records | No external credentials for the basic demo |
| 14 | [Weather — Lahore](workflows/14-weather-lahore.json) | Manual + HTTP / weather API | No API key is normally required for Open-Meteo; internet access required |
| 15 | [GitHub Repository Info](workflows/15-github-repo-info.json) | Manual + HTTP / public repository data | Public data may work without a token; add a GitHub credential only if you need authenticated/rate-limit-sensitive access |
| 16 | [Sample Posts](workflows/16-sample-posts.json) | Manual + HTTP / JSONPlaceholder | No credential normally required; internet access required |
| 17 | [Random Joke](workflows/17-random-joke.json) | Manual + HTTP / public joke API | No credential normally required; internet access required |
| 18 | [Pokémon Info](workflows/18-pokemon-info.json) | Manual + HTTP / PokéAPI | No credential normally required; internet access required |
| 19 | [Currency Rates](workflows/19-currency-rates.json) | Manual + HTTP / Frankfurter | No credential normally required for public reference rates; internet access required |
| 20 | [Website Lead Capture](workflows/20-webhook-lead-capture.json) | POST webhook / validate, log, acknowledge | Google Sheets and Gmail credentials; set spreadsheet ID and tab; configure the webhook URL and access protection |

**Important:** the catalog above describes each workflow's intended purpose and credential needs. Always open the actual JSON in n8n to confirm its current nodes and configuration before using it.

## Credential setup guide

See **[Workflow-by-workflow credential guidance](workflows/CREDENTIALS-GUIDE.md)** for setup instructions, required access, placeholders, and testing steps for every workflow.

### Common integrations

- **Google Sheets:** create/select a spreadsheet, prepare a header row matching the output fields, connect Google Sheets OAuth credentials in n8n, and set the spreadsheet ID and tab name.
- **Gmail:** connect the intended Gmail/Google account using n8n's supported credential flow. Confirm the sender account and recipient before testing.
- **Slack:** create/select the destination workspace and channel, connect a Slack credential, and use the channel ID expected by the node.
- **Telegram:** create a bot through BotFather, store the bot token in n8n Credentials, and use the correct chat ID. Never publish the token.
- **Google Calendar:** connect Google Calendar OAuth credentials, select the intended calendar, and test with a non-critical event. Add availability/conflict checks before relying on automatic booking.
- **Instagram:** automated publishing generally requires an eligible professional account, Meta app setup, permissions, and supported API access. A content-approval workflow is not the same as a publishing workflow.
- **YouTube:** upload automation requires an authorized Google/YouTube account and supported YouTube API/OAuth configuration. A metadata checklist does not upload a video by itself.
- **HTTP APIs / webhooks:** check the provider's current documentation, rate limits, authentication requirements, and payload format.

## Security checklist

- Never commit passwords, API keys, OAuth tokens, bot tokens, customer data, or live/private webhook URLs.
- Keep secrets in n8n's **Credentials** feature, not in Code nodes, workflow names, or GitHub files.
- Protect public webhooks with authentication or another appropriate verification method.
- Use least-privilege permissions for Google, Slack, Telegram, Meta, and YouTube connections.
- Test failure paths, invalid input, duplicate submissions, and API outages.
- For business use, consider retry rules, an error workflow, logging, consent, and retention policies.

## Testing and production readiness

These files are templates and learning assets. Some original examples use sample data or simple rule-based processing. Importing successfully does not prove that a workflow works end-to-end in your account. Verify every node in your own n8n instance and do not activate a business-critical workflow until it passes realistic tests.

## License

This repository is released under the **MIT License**. See [LICENSE](LICENSE) for the full terms. The license applies to this repository's project files; third-party services, logos, APIs, and platform terms remain governed by their respective owners.

## Author

**Muhammad Farhan**  
GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)  
LinkedIn: [muhammadfarhanmrs](https://www.linkedin.com/in/muhammadfarhanmrs/)  
YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)  
Project: [FlowForge-AI](https://github.com/Farhanillahiclass/FlowForge-AI)

---

<div align="center">

*Build carefully. Test every node. Automate responsibly.*

</div>
