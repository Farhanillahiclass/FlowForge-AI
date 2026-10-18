# 16 — Weekly Business Reporting

**Maintainer:** Muhammad Farhan  
**Event type:** `business.report.generate`  
**Status:** Static-checked template; Sheets/Gmail execution not yet verified.

## Purpose

Run weekly or on parent request, read lead and support records in parallel, merge the two inputs, calculate starter seven-day counts, email a report, and append a report-run log.

## Workflow path

`Weekly Schedule / parent entry → Read Leads + Read SupportTickets → tag source → Merge (append) → aggregate → Gmail report → ReportLog append`

## Configuration

Select Google Sheets and Gmail OAuth credentials. Replace `REPLACE_WITH_LEADS_SPREADSHEET_ID`, `REPLACE_WITH_SUPPORT_SPREADSHEET_ID`, `REPLACE_WITH_REPORT_RECIPIENT`, and `REPLACE_WITH_REPORT_LOG_SPREADSHEET_ID`. Create a `ReportLog` tab with the fields used by the logging node.

## Metrics

The current report counts lead and support rows and counts rows with parseable `createdAt`, `receivedAt` or `timestamp` values from the last seven days. Your sheet schema and timestamp conventions determine the accuracy of these totals.

## Tests to run

Test with a small synthetic set in both tabs, including records inside/outside the seven-day window, missing timestamps, an empty sheet, Sheets permission failures and Gmail failure. Verify that the Merge output includes both source types and the report totals agree with the sheets.

## Limits

These are starter row counts, not a normalized KPI model. The workflow doesn't yet calculate revenue, conversion rates, response SLA or deduplicated customer counts. Define KPI formulas with your business stakeholders before sharing the email as a business performance report.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
