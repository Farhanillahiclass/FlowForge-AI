# A–Z System Layer

These inactive workflow exports demonstrate a modular starter architecture. They are not yet a fully deployed or live-tested automation system.

## Flow

```text
00 Main Ingress (Header Auth + envelope validation)
    └── Execute Sub-workflow
        └── 01 Request Processor (eventType router)
            ├── lead.created → 10 Lead Capture
            ├── lead.score_requested → 11 Lead Scoring
            └── support.ticket.created → 12 Support Ticket

Unhandled runtime error → 90 Central Error Handler (sanitized log + operator alert)
```

## Import and bind workflow IDs

1. Import `10-lead-capture-subflow.json`, `11-lead-scoring-subflow.json`, and `12-support-ticket-subflow.json`.
2. Import `01-request-processor.json`. In each Execute Sub-workflow node, select the matching imported child.
3. Import `00-main-ingress.json` and select the request-processor workflow.
4. Configure Header Auth on the Webhook node. Select Google Sheets and Gmail credentials in the child workflows.
5. Import `90-central-error-handler.json`, configure its ops-log spreadsheet and alert recipient, then assign it under Workflow Settings → Error Workflow.
6. Keep all workflows inactive while testing. Run success, invalid-input, duplicate-request, unsupported-event, and provider-failure cases listed in [Testing & Validation](../TESTING-AND-VALIDATION.md).

The Execute Sub-workflow node calls another workflow by its database ID, and the paired Execute Sub-workflow Trigger starts the child. Official references: [Execute Sub-workflow](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/) and [Error Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/).

## Input contract

```json
{
  "requestId": "stable-client-generated-id",
  "eventType": "lead.created",
  "source": "website",
  "occurredAt": "2026-10-17T12:00:00.000Z",
  "data": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

Use one stable request ID per business event. Lead capture and support examples check existing Sheet rows before they create a side effect. This is a small-volume starter only: concurrent requests can race, and a failure after an external action may require reconciliation. Use an indexed database with a unique constraint for critical or high-volume processing.

## Completeness boundary

The dispatcher currently routes the three event types above. The other 17 business workflow templates are not connected to the central dispatcher yet. Child workflow selection, credentials, provider-side effects, n8n import, and live runtime tests remain required before production use.
