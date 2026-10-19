# 04 — Inbox Triage Assistant

**Maintainer:** Muhammad Farhan  
**Event type:** `inbox.message.received`  
**Status:** Apps Script rule-based triage intake added; n8n/provider execution not verified.

## Purpose

The n8n workflow receives inbox events, normalizes message data, applies classification rules or a configured classifier, routes uncertain cases for human review, and records a ticket/triage result. The standalone Apps Script adapter below can accept and classify a submitted message payload, but it does not connect to Gmail/Outlook by itself.

## Node-by-node implementation target

`Gmail/Outlook Trigger or authenticated Webhook → Normalize message → Deduplicate by provider message ID → Classify category/priority → Confidence/review decision → Create/update ticket or triage row → Notify owner → Persist outcome`

Do not claim that an LLM is being used unless an actual model node and credential are configured. Rule-based classification is acceptable for the starter implementation and should route ambiguous cases to a human.

## Apps Script intake adapter (`Code.gs`)

Set `SPREADSHEET_ID` and `FLOWFORGE_TOKEN` in Apps Script Script Properties and run `setupSheet()` once. Never commit the token. This endpoint requires `requestId`, provider `messageId`, a valid sender email, and a subject or body. It applies transparent keyword rules for category and priority, deduplicates by request ID or message ID, protects sheet values against formula injection, and logs a short body summary.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "inbox-test-001",
  "data": {
    "messageId": "provider-message-001",
    "sender": "customer@example.com",
    "subject": "Urgent: payment failed",
    "body": "I need help with a failed payment."
  }
}
```

The result contains a `category` (`billing`, `sales`, `support`, `low-priority`, or `other`) and `priority` (`high`, `medium`, or `normal`). These are starter keyword rules, not an AI judgement. Review before taking sensitive or customer-impacting action.

## n8n configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Select the correct provider credential for the inbox trigger and destination system.
3. Replace all spreadsheet/ticket/notification placeholders.
4. Set the human-review destination and define the fallback behavior when classification is ambiguous.
5. Keep the workflow inactive until the acceptance tests pass.

## Acceptance tests

1. Billing email routes to billing; pricing/demo email routes to sales; issue/bug email routes to support.
2. “Urgent” or “cannot access” is marked high priority.
3. Empty subject and body, invalid sender, missing request ID or missing message ID are rejected by Apps Script.
4. Repeated request ID or provider message ID does not create a second row.
5. Ambiguous messages reach the configured human-review path in n8n.
6. Wrong token, missing Script Properties, and sheet header mismatch fail clearly.
7. Confirm that stored summary and logs contain no unnecessary sensitive message content.

## Limits

- The Apps Script adapter classifies and logs submitted data; it does not fetch mail from Gmail/Outlook or send replies.
- Keyword rules can misclassify messages. Use human review for uncertain cases and do not automatically perform sensitive actions from classification alone.
- The n8n workflow and Apps Script endpoint are separate paths unless an HTTP Request node explicitly connects them.
- Live provider execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)
