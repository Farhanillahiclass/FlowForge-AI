# 02 — Lead Scoring & Routing

**Maintainer:** Muhammad Farhan  
**Event type:** `lead.score_requested`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Validate a lead profile, calculate a configurable score, classify it as hot/warm/cold, append the result to a Google Sheets score log, and alert Sales for hot leads.

## Scoring inputs

- Required: `requestId`, `name`, valid `email`.
- Optional: `company`, non-negative `budget`, `timeline` (such as `urgent` or `soon`), and Boolean `decisionMaker`.
- Output: `score`, `tier`, and a structured request status.

Current score weights in the Code node: company +15; budget ≥ 5,000 +35, budget ≥ 1,000 +20, smaller positive budget +10; urgent timeline +30, other timeline +10; decision-maker true +20. The score is capped at 100. Hot is ≥65, warm ≥40, otherwise cold. Adjust these rules to your real business and currency.

## Workflow path

`Header Auth Webhook / parent entry → Validate and score → Append LeadScores row → Hot-lead IF → Gmail alert when hot → result`

## Configuration

Select Google Sheets and Gmail credentials. Replace `REPLACE_WITH_SCORE_LOG_SPREADSHEET_ID` and `REPLACE_WITH_SALES_PRIORITY_EMAIL`. Create a `LeadScores` tab whose column headers match the output fields.

## Tests to run

Test each tier boundary, missing request ID, invalid email, negative/non-numeric budget, sheet permission error and Gmail send failure. Confirm the stored score matches the current scoring formula.

## Limits

This workflow currently logs repeated score requests as separate scoring events; it does not deduplicate by `requestId`. Repeated requests and updated lead profiles should be handled by your chosen business policy.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
