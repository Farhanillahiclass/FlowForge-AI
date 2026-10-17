# Testing and Validation Report — Muhammad Farhan

## Scope and honest status

This report separates repository-level static checks from live integration tests. Valid JSON does not prove a workflow will import or run correctly in n8n.

### Repository checks

- The repository contains 20 numbered workflow templates.
- Each canonical `workflows/<workflow-name>/` folder is expected to contain `README.md`, `workflow.json`, and `Code.gs`.
- Root-level numbered JSON exports and the older `apps-script/` and `workflow-guides/` directories remain as compatibility/reference copies for existing links.
- `scripts/validate_workflows.py` checks folder counts, required per-workflow files, JSON syntax, duplicate node names, and connection targets in both canonical folder exports and legacy JSON exports.
- GitHub Actions runs the static validator on pushes and pull requests.

### Live testing status

**Not run / not verified.** No running n8n instance or provider accounts were available during this repository update. The Apps Script files have not been deployed to Google Apps Script in this environment. Do not claim all 20 workflows are live-tested or production-ready.

## Run static validation locally

From the repository root:

```bash
python scripts/validate_workflows.py
```

A passing result means only that the static repository checks succeeded. It does not validate n8n import compatibility, node-specific parameters, credentials, Apps Script deployment, or live API behavior.

## Apps Script setup — each workflow separately

Open a canonical `workflows/<workflow-name>/` folder to find its `README.md`, `workflow.json`, and `Code.gs`. The script is an **optional Google Sheets adapter**; workflows that do not use Google Sheets do not need to call it.

For each script:
1. Create a separate test spreadsheet and Apps Script project.
2. Set Script Properties: `SPREADSHEET_ID` and a strong random `FLOWFORGE_TOKEN`.
3. Paste the matching `Code.gs`, run `setupSheet()`, and authorize permissions.
4. Deploy with an access policy appropriate for your environment. Never use confidential customer data in a public test deployment.
5. Test success, wrong token, malformed JSON, missing `requestId`, duplicate `requestId`, and spreadsheet permission errors.
6. Send JSON in the POST body: `{"token":"…","requestId":"stable-test-id","data":{}}`. Never commit real tokens to GitHub.

A token in the request body is not a complete production identity system. For sensitive data, use a reviewed authenticated gateway and inspect permissions and logs.

## Required n8n import and runtime test for all 20 workflows

For each workflow:
1. Import into a **test** n8n project and record the n8n version.
2. Resolve missing nodes and replace every `No Operation` or other placeholder with the intended provider/action node.
3. Configure credentials inside n8n; never put API keys or passwords in JSON.
4. Inspect node parameters and expressions, then execute with synthetic data.
5. Test success and invalid input; where relevant test duplicates, retries, API timeout/permission failures, empty datasets, and notification failures.
6. Confirm expected side effects in test destinations.
7. Keep publishing, newsletter, payment, and customer-facing actions behind human approval and consent checks until verified.
8. Record workflow name, test date, input type, execution ID, expected/actual outcome, and pass/fail. Do not include secrets or private customer information.
9. Activate only after all required tests pass.

## Per-workflow evidence checklist

- [ ] 01 Lead Capture CRM
- [ ] 02 Lead Scoring & Routing
- [ ] 03 Email Follow-up Sequence
- [ ] 04 Inbox Triage Assistant
- [ ] 05 Customer Support Desk
- [ ] 06 FAQ & Human Handoff
- [ ] 07 Meeting Booking System
- [ ] 08 Meeting Reminders
- [ ] 09 Client Onboarding
- [ ] 10 Invoice Payment Reminders
- [ ] 11 Content Creation & Approval
- [ ] 12 Instagram Publishing Pipeline
- [ ] 13 YouTube Publishing Assistant
- [ ] 14 Content Repurposing
- [ ] 15 Newsletter Campaign Builder
- [ ] 16 Weekly Business Report
- [ ] 17 Feedback Routing
- [ ] 18 Workflow Error Monitor
- [ ] 19 API Health Monitor
- [ ] 20 Telegram Business Assistant

**Do not describe a workflow as fully tested until execution evidence is recorded.**
