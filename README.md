<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,45:4338CA,100:EA4B71&height=190&section=header&text=FlowForge-AI&fontSize=44&fontColor=FFFFFF&animation=fadeIn&desc=Practical%20n8n%20Workflow%20Templates&descAlignY=65&descSize=16" alt="FlowForge-AI — practical n8n workflow templates" />

![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![JSON](https://img.shields.io/badge/Format-Importable%20JSON-4F46E5?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Starter%20Collection-0F766E?style=for-the-badge)

**A curated starter collection of 20 practical n8n workflow templates.**

</div>

## About

FlowForge-AI contains small, understandable workflow examples for learning and adapting automation in [n8n](https://n8n.io/). Each workflow is stored as an individual JSON file under `workflows/` so you can import it into your own n8n instance.

## Import a workflow

1. Open n8n.
2. Create a new workflow or open the workflow menu.
3. Choose **Import from File** and select a JSON file from `workflows/`.
4. Review every node and expression before running it.
5. Add credentials where needed, test manually, and only then activate scheduled or webhook workflows.

## Workflow catalog

| # | Workflow | Trigger | Purpose |
|---:|---|---|---|
| 01 | [Manual Starter](workflows/01-manual-starter.json) | Manual | Safe starter workflow with a sample payload |
| 02 | [Webhook JSON Echo](workflows/02-webhook-json-echo.json) | Webhook | Return request details as JSON |
| 03 | [Text Cleaner](workflows/03-text-cleaner.json) | Manual | Trim text and normalize whitespace |
| 04 | [Text Slug Generator](workflows/04-text-slug-generator.json) | Manual | Convert sample text into a URL-friendly slug |
| 05 | [Array to CSV](workflows/05-array-to-csv.json) | Manual | Convert sample records to CSV text |
| 06 | [Daily Quote Fetcher](workflows/06-daily-quote-fetcher.json) | Schedule | Fetch a random quote from a public API |
| 07 | [GitHub Repository Snapshot](workflows/07-github-repository-snapshot.json) | Manual | Fetch public repository metadata |
| 08 | [Weather Snapshot](workflows/08-weather-snapshot.json) | Manual | Fetch current weather from Open-Meteo (sample coordinates) |
| 09 | [Exchange Rate Snapshot](workflows/09-exchange-rate-snapshot.json) | Manual | Fetch public USD exchange-rate data |
| 10 | [Random User Generator](workflows/10-random-user-generator.json) | Manual | Fetch sample user data for testing |
| 11 | [JSONPlaceholder Post Fetcher](workflows/11-jsonplaceholder-post-fetcher.json) | Manual | Fetch a sample post from a test API |
| 12 | [Webhook Lead Validator](workflows/12-webhook-lead-validator.json) | Webhook | Validate basic name/email fields in a POST payload |
| 13 | [Webhook Text Analyzer](workflows/13-webhook-text-analyzer.json) | Webhook | Return text length and word count |
| 14 | [Webhook Calculator](workflows/14-webhook-calculator.json) | Webhook | Add two numeric values from a POST payload |
| 15 | [Daily Heartbeat](workflows/15-daily-heartbeat.json) | Schedule | Emit a timestamped heartbeat record |
| 16 | [GitHub Latest Commit](workflows/16-github-latest-commit.json) | Manual | Fetch the latest commit for this repository |
| 17 | [HTTP Status Checker](workflows/17-http-status-checker.json) | Manual | Request a public test endpoint and return its response |
| 18 | [Sample Data Enricher](workflows/18-sample-data-enricher.json) | Manual | Add derived fields to sample records |
| 19 | [Webhook Request Logger](workflows/19-webhook-request-logger.json) | Webhook | Normalize basic request fields for downstream logging |
| 20 | [Daily Date Summary](workflows/20-daily-date-summary.json) | Schedule | Generate a date/time summary |

## Important notes

- These are **starter templates**, not a claim that every workflow has been tested against every n8n version or deployment.
- External APIs, internet access, endpoint limits, and n8n node versions can affect execution.
- Webhook workflows need to be imported and tested in your own n8n instance. Use the test URL first; do not expose public endpoints without appropriate access controls.
- Schedule workflows run only after you configure their schedule and activate the workflow.
- Update sample coordinates, repository names, URLs, payloads, and other example values for your use case.
- Do not commit API keys, passwords, OAuth tokens, or private webhook URLs to GitHub.
- Workflows that call public APIs send requests to those external services. Review each endpoint before use.
- Check the source and license of any third-party workflow or node you add. This repository's examples are provided as-is without a guarantee of fitness for a particular purpose.

## Suggested setup

Use a current supported n8n release. Import one workflow at a time, inspect the nodes, test with non-sensitive sample data, then add credentials and production safeguards as needed.

## Author

Created and maintained as a practical automation learning project by [Farhanillahiclass](https://github.com/Farhanillahiclass).

---

<div align="center">

*Build small. Test carefully. Automate responsibly.*

</div>
