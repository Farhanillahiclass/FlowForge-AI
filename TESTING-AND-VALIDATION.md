# Testing and Validation Report — Muhammad Farhan

## Scope and honest status

This report separates **static repository checks** from **live integration tests**. A JSON file parsing successfully does not prove the workflow will execute correctly in n8n.

### Static checks completed during repository review
- Located all **20 numbered workflow JSON files**.
- Parsed the JSON content for all 20 workflow files successfully.
- Reviewed their node lists and connection maps. Several workflows intentionally contain `No Operation` placeholder nodes whose labels say to connect/configure a real provider action. Those are **not complete end-to-end automations yet**.
- Each `workflows/<workflow-name>/` folder now contains `README.md`, `workflow.json`, and `Code.gs` together. The Apps Script files are copied from the dedicated adapters and each has its own sheet schema/request validation. The older top-level `workflow-guides/` and `apps-script/` paths remain as reference copies for now.
- Added `scripts/validate_workflows.py` so you can run repeatable local checks for JSON syntax, duplicate node names, and connection targets.

### Live testing status
**Not run / not verified.** This environment does not have access to your running n8n instance or your Google, Gmail, Meta, Telegram, Slack, Calendar or YouTube credentials. I cannot truthfully mark all 20 workflows as live-tested. The Apps Script files have also not been deployed to Google Apps Script, so their runtime behavior is not confirmed.

## Run static validation locally

From the repository root:

```bash
python scripts/validate_workflows.py
```

The script checks each `workflows/*.json` file for valid JSON, unique node names and connection references that point to existing nodes. It does not validate provider credentials, node parameter schemas, or remote API behavior.

## Apps Script setup — each workflow separately

Open any `workflows/<workflow-name>/` folder to find that workflow's `README.md`, `workflow.json`, and `Code.gs` together. These are **optional Google Sheets adapters**: a workflow that does not need Google Sheets should not call its adapter. The top-level `apps-script/` and `workflow-guides/` folders remain reference copies. The scripts are distinct, but still require deployment, correct Script Properties, and a real test before use.

For each script:
1. Create a separate test spreadsheet and a separate Apps Script project.
2. Set Script Properties: `SPREADSHEET_ID` and a strong random `FLOWFORGE_TOKEN`.
3. Paste the matching `Code.gs`, run `setupSheet()`, and authorize permissions.
4. Deploy using an access policy approved for your environment. Do not use confidential customer data in a public test deployment.
5. Test success, wrong token, malformed JSON, missing `requestId`, duplicate `requestId`, and spreadsheet permission errors.
6. Send JSON in the POST body: `{"token":"…","requestId":"stable-test-id","data":{}}`. Never commit real tokens to GitHub.

The token-in-body pattern is safer than a token in a URL query string, but it is not a complete production identity system by itself. For sensitive production data, use an authenticated gateway and review permissions/logging.

## Required n8n import and runtime test for all 20 workflows

For every file in `workflows/`:
1. Import into a **test** n8n project and record the n8n version.
2. Resolve all red/missing nodes and replace every `No Operation` placeholder with the intended provider/action node.
3. Configure credentials inside n8n; never place API keys or passwords in JSON.
4. Inspect node parameters and expressions, then execute with synthetic data.
5. Test the success path and invalid input; where relevant test duplicate requests, retries, API timeout/permission failures, empty datasets and notification failure.
6. Confirm side effects in the destination (test sheet, test inbox, calendar sandbox, or provider test account).
7. Keep publishing, newsletter, payment and customer-facing actions behind human approval and consent checks until verified.
8. Record workflow name, test date, input type, execution ID, expected/actual outcome and pass/fail. Do not include secrets or private customer information.
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

**Do not describe a workflow as fully tested until its execution evidence is recorded above.**
