<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:EA4B71&height=190&section=header&text=FlowForge-AI&fontSize=44&fontColor=FFFFFF&animation=fadeIn&desc=20%20Practical%20n8n%20Workflow%20Templates&descAlignY=65&descSize=16" alt="FlowForge-AI — practical n8n workflow templates" />

![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Templates](https://img.shields.io/badge/Templates-20-4F46E5?style=for-the-badge)
![JSON](https://img.shields.io/badge/Format-Importable%20JSON-0F766E?style=for-the-badge)

**A beginner-friendly collection of 20 practical n8n workflow templates.**

</div>

## About

FlowForge-AI is a hands-on learning collection for [n8n](https://n8n.io/) automation. Each workflow is an individual JSON file you can import, inspect, and adapt.

## Import a workflow

1. Open your n8n instance.
2. Create a workflow and open the workflow menu.
3. Choose **Import from File** and select a JSON file from `workflows/`.
4. Inspect nodes, expressions, and endpoints before running.
5. Click **Execute Workflow** to test manual workflows.
6. Configure credentials and safeguards before connecting real accounts or activating production automations.

## Workflow catalog

| # | Workflow | Trigger | Purpose |
|---:|---|---|---|
| 01 | [Hello World](workflows/01-hello-world.json) | Manual | Returns a greeting and timestamp |
| 02 | [Current Timestamp](workflows/02-current-time.json) | Manual | Formats date, time, and Unix timestamp |
| 03 | [Text Cleaner](workflows/03-text-cleaner.json) | Manual | Normalizes whitespace and counts words |
| 04 | [Sample Lead Scoring](workflows/04-lead-score.json) | Manual | Scores sample leads using simple rules |
| 05 | [Expense Summary](workflows/05-expense-summary.json) | Manual | Totals sample expenses by category in PKR |
| 06 | [Record Normalizer](workflows/06-record-normalizer.json) | Manual | Normalizes names/emails and checks email format |
| 07 | [Support Ticket Triage](workflows/07-support-ticket-triage.json) | Manual | Labels sample tickets by priority |
| 08 | [FAQ Keyword Matcher](workflows/08-faq-matcher.json) | Manual | Matches a question to a local FAQ |
| 09 | [URL List Validator](workflows/09-url-validator.json) | Manual | Validates HTTP/HTTPS URL strings |
| 10 | [Low Stock Inventory](workflows/10-low-stock-alert.json) | Manual | Flags items at or below a stock threshold |
| 11 | [Daily Quote](workflows/11-daily-quote.json) | Manual | Returns a locally stored quote |
| 12 | [Deadline Checker](workflows/12-deadline-checker.json) | Manual | Labels sample tasks by deadline status |
| 13 | [Data Quality Checker](workflows/13-data-quality-check.json) | Manual | Checks sample records for common data issues |
| 14 | [Current Weather — Lahore](workflows/14-weather-lahore.json) | Manual + HTTP | Fetches current weather from Open-Meteo |
| 15 | [GitHub Repository Info](workflows/15-github-repo-info.json) | Manual + HTTP | Fetches public n8n repository metadata |
| 16 | [Fetch Sample Posts](workflows/16-sample-posts.json) | Manual + HTTP | Fetches sample posts from JSONPlaceholder |
| 17 | [Random Joke](workflows/17-random-joke.json) | Manual + HTTP | Fetches a sample joke from a public API |
| 18 | [Pokémon Info](workflows/18-pokemon-info.json) | Manual + HTTP | Fetches Pikachu data from PokéAPI |
| 19 | [Currency Rates — USD](workflows/19-currency-rates.json) | Manual + HTTP | Fetches reference rates from Frankfurter |
| 20 | [Webhook Lead Capture](workflows/20-webhook-lead-capture.json) | POST Webhook | Normalizes incoming lead fields |

## Notes before production

- Workflows 01–13 use built-in manual and Code nodes and do not require third-party API credentials.
- Workflows 14–19 require internet access. Public API services can change, rate-limit, or become unavailable.
- Workflow 20 must be activated to use its production webhook URL. Test with sample data first.
- The lead scoring, expense, support, and deadline examples use illustrative data and rules.
- Never commit API keys, passwords, OAuth tokens, personal data, or private webhook URLs to GitHub.
- Add authentication and access controls before exposing webhooks to real users.
- These are starter templates: import, inspect, and test them in your n8n version before production use.

## Author

Built as a practical automation learning project by [Farhanillahiclass](https://github.com/Farhanillahiclass).

<div align="center">

*Build small. Test carefully. Automate responsibly.*

</div>
