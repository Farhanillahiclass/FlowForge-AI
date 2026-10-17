# 01-lead-capture-crm

**Maintainer:** Muhammad Farhan

## This workflow's files
- `workflow.json` — n8n workflow export.
- `Code.gs` — dedicated Google Apps Script adapter for this workflow's own sheet schema. Use only if this workflow needs Google Sheets.

## Setup
1. Import `workflow.json` into a test n8n instance.
2. Read the detailed guide: [01-lead-capture-crm implementation guide](../../workflow-guides/01-lead-capture-crm.md).
3. Configure credentials inside n8n; never commit secrets to GitHub.
4. Replace any No Operation/placeholder nodes with real integration nodes as described in the guide.
5. If Google Sheets is needed, create a separate Apps Script project using this folder's `Code.gs`; set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`, run `setupSheet()`, and deploy with an appropriate access policy.
6. Test success and failure paths with synthetic data before activation.

## Validation status
Folder organization is not proof of live execution. The workflow JSON may parse while still containing placeholder nodes or provider parameters that need configuration. See [Testing and Validation](../../TESTING-AND-VALIDATION.md).
