# 02 — Lead Scoring & Routing

**Maintainer:** Muhammad Farhan  
**Event type:** `lead.score_requested`  
**Status:** Apps Script scoring logic aligned with the n8n starter rubric; live provider execution not yet verified.

## Purpose

Validate a lead profile, calculate a transparent score, classify it as hot/warm/cold, append the result to a Google Sheets score log, and alert Sales for hot leads.

## Scoring contract

Required: `requestId`, `name`, valid `email`. Optional: `company`, non-negative numeric `budget`, `timeline`, and Boolean `decisionMaker`.

| Signal | Points |
|---|---:|
| Company provided | +15 |
| Budget >= 5,000 | +35 |
| Budget >= 1,000 and < 5,000 | +20 |
| Budget > 0 and < 1,000 | +10 |
| Timeline = `urgent` | +30 |
| Timeline = `soon` | +20 |
| Other / unspecified timeline | +10 |
| Decision-maker is Boolean `true` | +20 |

Score is capped at 100. Tier thresholds: hot >=65, warm >=40, otherwise cold. Routing labels: hot → `sales-priority`, warm → `sales-follow-up`, cold → `nurture`. These are starter rules: confirm the budget currency and business thresholds before production use.

## Node-by-node path

`Header Auth Webhook OR Called by Parent Workflow → Normalize Parent Payload (parent path only) → Validate and Score Lead → Lead Data Valid?`

- Invalid data → `Return Invalid Lead Score Input`.
- Valid data → `Log Lead Score → Hot Lead?`.
- Hot lead → `Notify Sales for Hot Lead → Return Lead Score Result`.
- Warm/cold lead → `Return Lead Score Result`.

## Configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth for the standalone webhook.
3. Select Google Sheets OAuth credentials and replace `REPLACE_WITH_SCORE_LOG_SPREADSHEET_ID`.
4. Create a `LeadScores` tab with columns matching the output fields: requestId, leadId, name, email, score, tier, route, reason, and timestamps.
5. Select Gmail OAuth credentials and replace `REPLACE_WITH_SALES_PRIORITY_EMAIL`.
6. Keep the workflow inactive until acceptance tests pass.

## Apps Script adapter (`Code.gs`)

This endpoint logs the same scoring rubric to a separate `LeadScoring` tab. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Apps Script Script Properties, then run `setupSheet()` once. Do not commit the token. The endpoint rejects invalid request IDs, names, emails, negative/non-numeric budgets, wrong tokens, malformed JSON and duplicate request IDs. It returns the score/tier/route in JSON.

Example request data:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "score-test-001",
  "data": {
    "leadId": "lead-001",
    "name": "Test User",
    "email": "test@example.com",
    "company": "Example Ltd",
    "budget": 1200,
    "timeline": "soon",
    "decisionMaker": true
  }
}
```

The Apps Script endpoint and n8n workflow are separate execution paths. The n8n workflow does not automatically call Apps Script unless an HTTP Request node is configured to do so.

## Acceptance tests

1. No optional signals: score = 10 (unspecified timeline contributes +10), tier cold.
2. Company + budget 1,200 + soon timeline + decision-maker true: score = 75, tier hot.
3. Company + budget 1,200 + unspecified timeline + decision-maker false: score = 45, tier warm.
4. Budget 5,000 + urgent timeline + company + decision-maker true: score is capped at 100.
5. Negative or non-numeric budget: rejected.
6. Invalid email / missing request ID: rejected without writing a row.
7. Repeated request ID to Apps Script: duplicate response without second row.
8. Sheets permission error and Gmail send error: verify the execution fails visibly and no false success is returned.
9. Confirm that the configured budget currency matches the thresholds before production use.

## Limits

- n8n's current scoring node and Apps Script rubric should be kept in sync if you change weights.
- Apps Script duplicate detection is protected by a script lock, but n8n's separate read-then-append path can race under simultaneous requests.
- Gmail delivery is not guaranteed by a “send attempted” label; verify the actual send result in the provider and execution log.
- Live execution has not been verified by this source change.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)
