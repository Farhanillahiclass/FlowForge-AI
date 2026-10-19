# 06 — FAQ & Human Handoff

**Maintainer:** Muhammad Farhan  
**Event:** `support.faq.question`  
**Status:** Static source updates only; live provider execution is not verified.

## Purpose

Match incoming questions against a small set of approved keyword rules. Matching questions with a valid customer email can receive an FAQ suggestion through n8n. Unknown questions or unusable email addresses must be routed to a human support inbox.

## Node-by-node paths

- Standalone: `Receive Customer Question (Header Auth Webhook) → Match Approved FAQ → Needs Human Review?`
- Human handoff: `Needs Human Review? (true) → Send Support Handoff Email`
- FAQ suggestion: `Needs Human Review? (false) → Send FAQ Suggestion Email`
- Parent: `Called by Parent Workflow → Normalize Parent Payload → Match Approved FAQ`

Built-in keyword groups: pricing/price/cost; hours/timing/open; refund/return. The answer copy is sample text and must be reviewed against actual company policy.

## Setup

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth for the standalone webhook.
3. Select Gmail OAuth credentials and replace `REPLACE_WITH_SUPPORT_EMAIL`.
4. Test with an internal customer address first. Keep the workflow inactive until tests pass.

## Apps Script adapter

`Code.gs` provides a separate endpoint that matches the same starter FAQ groups and logs each request to a `FaqHandoff` tab. It does not send emails. Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Script Properties, run `setupSheet()`, and deploy only after reviewing web-app access settings. Never commit the token.

Example body:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "faq-test-001",
  "data": {
    "question": "Can you share your pricing?",
    "email": "customer@example.com"
  }
}
```

The adapter returns `matchedFaq`, sample answer, confidence label, and `handoffRequired`. The numeric confidence of 0.8 is a fixed heuristic for a keyword match, not a statistically calibrated model score. No match or invalid email means human review is required. n8n and Apps Script remain separate execution paths unless an HTTP Request node connects them.

## Acceptance tests

1. Pricing, hours and refund keywords match the corresponding FAQ group.
2. Unmatched question returns `human_review_required`.
3. Missing/invalid email requires human review, not an automated customer email.
4. Missing request ID, blank question, invalid token, malformed JSON and wrong sheet headers fail clearly.
5. Repeated Apps Script request ID is not appended twice.
6. Gmail failure is visible in n8n execution history; do not report email delivery as successful without provider confirmation.
7. Review all sample answers against real pricing, business hours and refund policies before production.

## Limits

- Keyword matching is not semantic retrieval or an LLM.
- The current n8n workflow does not persist a support ticket or human-review callback; add an auditable ticket store if required.
- Apps Script logs the request but does not send the customer reply or handoff email.
- Live provider execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
