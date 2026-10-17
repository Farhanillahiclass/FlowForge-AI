<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:EA4B71&height=190&section=header&text=FlowForge-AI&fontSize=44&fontColor=FFFFFF&animation=fadeIn&desc=Professional%20n8n%20Workflow%20Templates&descAlignY=65&descSize=16" alt="FlowForge-AI" />

![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Workflows](https://img.shields.io/badge/Workflow%20Templates-20-4F46E5?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-0F766E?style=for-the-badge)

**Practical workflow templates for data processing, business operations, and API integrations.**

Maintained by **Muhammad Farhan**

</div>

## About

FlowForge-AI is a collection of importable n8n workflow JSON templates. The project demonstrates structured input processing, validation, API requests, lead qualification, support triage, and business-oriented workflow patterns.

**Important:** These are workflow templates, not a claim that all 20 are production-ready or live-tested. Some process data supplied to them; others call public APIs. External integrations require credentials and node configuration, and business-critical workflows must be tested in your own n8n instance.

## Quick start

1. Open your n8n instance.
2. Download a JSON file from the [workflows folder](./workflows/).
3. Select **Import from File** in n8n.
4. Review node settings, expressions, and connections.
5. Configure required credentials in n8n's **Credentials** section.
6. Replace example IDs, sheet names, chat IDs, and destinations.
7. Execute with safe test data and inspect each node's output.
8. Activate only after end-to-end testing.

## Workflow catalog

| # | Workflow | Trigger | Purpose / setup |
|---:|---|---|---|
| 01 | [Workflow Health Check](workflows/01-hello-world.json) | Manual | Confirms workflow execution and returns status metadata |
| 02 | [Business Date and Time](workflows/02-current-time.json) | Manual | Formats UTC date/time and timestamp |
| 03 | [Text Intake Cleaner](workflows/03-text-cleaner.json) | Manual | Normalizes text and reports length/word count |
| 04 | [Lead Qualification](workflows/04-lead-score.json) | Webhook | Applies configurable rule-based lead scoring |
| 05 | [Expense Summary](workflows/05-expense-summary.json) | Manual | Validates amounts and summarizes totals by category |
| 06 | [CRM Contact Normalizer](workflows/06-record-normalizer.json) | Manual | Normalizes names, email, and phone fields |
| 07 | [Support Ticket Triage](workflows/07-support-ticket-triage.json) | Webhook | Classifies support ticket priority |
| 08 | [FAQ Intent Matcher](workflows/08-faq-matcher.json) | Manual | Matches common question keywords to suggested responses |
| 09 | [URL Validator](workflows/09-url-validator.json) | Manual | Checks HTTP/HTTPS URL format |
| 10 | [Inventory Reorder Monitor](workflows/10-low-stock-alert.json) | Manual | Flags stock at or below a reorder point |
| 11 | [Daily Team Message](workflows/11-daily-quote.json) | Manual | Returns a rotating internal team message |
| 12 | [Deadline and SLA Monitor](workflows/12-deadline-checker.json) | Manual | Classifies overdue and upcoming deadlines |
| 13 | [Data Quality Gate](workflows/13-data-quality-check.json) | Manual | Flags missing or malformed fields |
| 14 | [Lahore Weather API](workflows/14-weather-lahore.json) | Manual + HTTP | Fetches public weather data from Open-Meteo |
| 15 | [Repository Health Snapshot](workflows/15-github-repo-info.json) | Manual + HTTP | Fetches FlowForge-AI repository metadata |
| 16 | [Public API Example](workflows/16-sample-posts.json) | Manual + HTTP | Fetches example posts from JSONPlaceholder |
| 17 | [Public API Response Example](workflows/17-random-joke.json) | Manual + HTTP | Fetches a response from a public joke API |
| 18 | [Pokémon API Lookup](workflows/18-pokemon-info.json) | Manual + HTTP | Fetches public PokéAPI data |
| 19 | [USD Reference Rates](workflows/19-currency-rates.json) | Manual + HTTP | Fetches reference exchange rates from Frankfurter |
| 20 | [Website Lead Capture](workflows/20-webhook-lead-capture.json) | POST Webhook | Validates and normalizes a website lead; configure the Sheets/Gmail steps and credentials as needed |

## Credential setup

See **[Credential Setup Guide](workflows/CREDENTIALS-GUIDE.md)** for workflow-by-workflow notes and testing checklists.

Common rules:
- Local/manual examples generally do not require external credentials.
- Public API workflows require internet access; public endpoints may change or apply rate limits.
- Google Sheets, Gmail, Slack, Telegram, Google Calendar, Instagram/Meta, and YouTube integrations require the relevant nodes, account permissions, and credential setup. Do not assume a workflow publishes content or sends a notification unless those action nodes are present and configured.
- Store secrets in n8n Credentials. Never commit tokens, passwords, customer data, or live webhook URLs to GitHub.
- Protect production webhooks and use least-privilege account permissions.

## Testing checklist

- [ ] JSON imports into your installed n8n version.
- [ ] All node versions and parameters are accepted.
- [ ] Credentials and destination IDs are configured.
- [ ] Test data covers valid, invalid, and unexpected inputs.
- [ ] API failures, timeouts, and duplicate submissions have been considered.
- [ ] No secrets or real customer data are stored in the public repository.
- [ ] Workflow is activated only after a complete end-to-end test.

## License

Released under the [MIT License](LICENSE). Third-party platforms and APIs remain subject to their own terms.

## Author

**Muhammad Farhan**  
GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)  
LinkedIn: [Muhammad Farhan](https://www.linkedin.com/in/muhammadfarhanmrs/)  
YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)  
Project: [FlowForge-AI](https://github.com/Farhanillahiclass/FlowForge-AI)

<div align="center">

*Build carefully. Test every node. Automate responsibly.*

</div>
