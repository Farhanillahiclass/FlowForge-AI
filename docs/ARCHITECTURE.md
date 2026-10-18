# FlowForge-AI A–Z Automation Architecture

## Design goal

Separate transport and validation, event orchestration, business logic, provider actions, durable state, and failure reporting. Keep every business workflow in a single canonical folder and reuse it through n8n Execute Sub-workflow nodes.

## Layers

1. **Ingress and authentication.** Main Ingress uses a Webhook with Header Auth. Direct Webhook triggers in canonical workflow exports also use Header Auth. In n8n, select real credentials after import. Filtering traffic before the webhook fires belongs at the API gateway/perimeter, since no workflow runs before its trigger.
2. **Request contract.** Validate `requestId`, `eventType` and object-valued `data`. Normalize `source` and `occurredAt`. Clients should reuse the same request ID when retrying one business event.
3. **Orchestration.** Request Processor maps 20 event types to the matching canonical workflow. Its Execute Sub-workflow nodes require each imported child workflow ID to be selected in n8n.
4. **Business workflow.** Each of the 20 canonical folders owns its validation, business rules, and service actions. Use documented inputs and structured outputs; don't duplicate a second business-workflow JSON under `system/`.
5. **Provider integrations.** Credentials live in n8n Credentials. Spreadsheet IDs/tabs, recipients, Calendar IDs, Meta API settings, YouTube and Telegram accounts, and model parameters must be configured in the target n8n instance.
6. **State and idempotency.** Use stable event keys and durable uniqueness. The Sheet-based checks in this repository are low-volume starter patterns, not strict exactly-once processing.
7. **Reliability and observability.** The central Error Handler logs sanitized execution context and sends an alert. Assign it under Workflow Settings → Error Workflow. Use bounded retries for transient failures and reconcile uncertain external outcomes before replaying them.

## Event contract and route list

Main Ingress expects an envelope in this shape:

```json
{
  "requestId": "stable-client-generated-id",
  "eventType": "lead.created",
  "source": "website",
  "occurredAt": "2026-10-18T08:00:00.000Z",
  "data": {"name": "Test User", "email": "test@example.com"}
}
```

The Request Processor currently defines 20 routes:

1. `lead.created` → 01 Lead Capture & CRM
2. `lead.score_requested` → 02 Lead Scoring & Routing
3. `email.followup.dispatch` → 03 Email Follow-up
4. `inbox.message.received` → 04 Inbox Triage
5. `support.ticket.created` → 05 Customer Support
6. `support.faq.question` → 06 FAQ & Human Handoff
7. `meeting.booking.requested` → 07 Meeting Booking
8. `meeting.reminder.dispatch` → 08 Meeting Reminders
9. `client.onboarding.start` → 09 Client Onboarding
10. `invoice.reminder.dispatch` → 10 Invoice Reminders
11. `content.draft.requested` → 11 Content Creation
12. `instagram.publish.requested` → 12 Instagram Publishing
13. `youtube.upload.requested` → 13 YouTube Upload
14. `content.repurpose.requested` → 14 Content Repurposing
15. `newsletter.campaign.requested` → 15 Newsletter Campaign
16. `business.report.generate` → 16 Weekly Business Report
17. `feedback.received` → 17 Feedback Routing
18. `workflow.error.received` → 18 Error Monitor
19. `api.health.check` → 19 API Health Monitor
20. `telegram.command.received` → 20 Telegram Assistant

Unsupported event types receive a structured error rather than being routed to an arbitrary child.

## Import/deploy order

Import all 20 canonical workflow exports, then the Request Processor, then Main Ingress, then the Central Error Handler. Select the actual child IDs in the Execute Sub-workflow nodes and configure each credential in n8n. Keep all exports inactive until each test route succeeds and destination-side effects are confirmed.

## Reliability boundaries

Static validation checks JSON structure and graph references, not provider node schemas, installed node versions, credentials, external API permissions, or destination-side effects. Live import and execution remain required. For publishing, financial reminders, newsletter sends, and customer communication, test approval, consent, duplicate and failure behavior before activation.

Official references: [Execute Sub-workflow](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/), [Execute Sub-workflow Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/), and [Error Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/).
