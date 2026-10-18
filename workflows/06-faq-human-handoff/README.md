# 06 — FAQ & Human Handoff

**Maintainer:** Muhammad Farhan  
**Event type:** `support.faq.question`  
**Status:** Static-checked template; live provider execution not yet verified.

## Purpose

Compare an incoming question with a small set of approved keyword rules. A matching FAQ can be emailed to the customer; unmatched questions or questions without a usable customer email are forwarded to a human support inbox.

## Input contract

Required for useful handling: `question` or `message`. Include a valid `email` if a customer reply is expected. Optional: `requestId` and `chatId`. Current built-in keyword groups cover pricing, hours/timing/opening, and refund/return.

## Workflow path

`Header Auth Webhook / parent entry → FAQ matching → Needs Human Review? → support handoff email OR FAQ suggestion email`

## Configuration

Select Gmail OAuth and replace `REPLACE_WITH_SUPPORT_EMAIL`. Direct Webhook calls require Header Auth. The answer text is starter copy and must be reviewed and adapted to your real FAQ/policies.

## Tests to run

Test a match from each keyword group, no match, missing/invalid email, empty question, support inbox failure, and customer email failure. Confirm that uncertain questions go to a person rather than being presented as a verified answer.

## Limits

Matching is simple keyword matching, not semantic retrieval or an LLM system. The FAQ content is hard-coded in the Code node. No CRM/ticket record is persisted in this template; add one if your support process needs a searchable audit trail.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
