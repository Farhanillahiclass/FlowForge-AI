# Validation and Test Report — Muhammad Farhan

## Repository-level checks
- 20 numbered business workflow JSON files are present in the portfolio branch.
- Individual setup and credential guidance is stored in `workflow-guides/`.
- Google Apps Script source is in `apps-script/FlowForgeSheetGateway.gs`.

## Important limitation
**This is not a live n8n execution report.** The GitHub-only environment cannot authenticate to your n8n instance or verify connected Google, Gmail, Meta, Telegram, Slack, Calendar or YouTube accounts. Do not claim that all 20 flows passed end-to-end tests until you run the steps below.

## Required tests in n8n
1. Record the installed n8n version and deployment type.
2. Import every JSON file; check for missing nodes and invalid parameters.
3. Replace placeholders/No Operation nodes with real integrations.
4. Use synthetic data and test credentials only.
5. Run success, invalid-input, duplicate, timeout/permission-error and notification-failure tests.
6. Save execution IDs/outcomes without sharing credentials or customer data.
7. Keep workflows inactive until critical tests pass.

## Google Apps Script gateway test
1. Create a test Google Sheet, set Script Properties `SPREADSHEET_ID` and a strong random `FLOWFORGE_TOKEN`.
2. Run `setupSheetTabs()` and verify tabs/headers.
3. Deploy as web app using an access policy appropriate for your environment.
4. POST a synthetic request from n8n to the deployment URL with `?token=YOUR_TEST_TOKEN` and JSON body containing `kind`, stable `requestId`, and `data`.
5. Repeat the same requestId and verify duplicate detection; test invalid token, malformed JSON and unknown kind.
6. Rotate/delete test tokens after use. Query-string secrets can appear in logs; use an authenticated gateway for production or sensitive data.
