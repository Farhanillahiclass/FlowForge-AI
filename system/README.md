# FlowForge-AI — A–Z Automation System

This directory is the proposed **system layer**. It complements the 20 business workflow templates under `workflows/`; it does not magically make each business template production-ready.

## Architecture

```text
External sources
  ├─ Webhook / Schedule / App trigger
  ▼
00 — Main Ingress (request contract, input checks, request ID)
  ▼
01 — Request Processor (normalize request, route by task)
  ▼
Reusable business workflow(s)
  ├─ lead intake / scoring
  ├─ customer support / inbox triage
  ├─ content pipeline
  └─ reporting / health monitoring
  ▼
Destination actions (Sheets, Gmail, Calendar, APIs, messaging)
  ▼
Structured result + audit logging
             
Any runtime failure ──► 02 — Central Error Handler ──► durable error log + alert
```

## Canonical ownership

- `workflows/<slug>/workflow.json` is the canonical business workflow export.
- `workflows/<slug>/README.md` documents that workflow.
- `workflows/<slug>/Code.gs` is an optional, workflow-specific Google Apps Script adapter.
- `system/*.json` contains reusable system-level examples and an architecture contract.
- `docs/ARCHITECTURE.md` explains the design and runtime responsibilities.

The old root-level workflow JSON copies and top-level `apps-script/` and `workflow-guides/` mirrors are retained for backward compatibility in this change set. They should be removed in a dedicated migration once all external links have moved to the canonical workflow folders.

## Deployment boundaries

All system JSON exports must stay inactive until imported, credentials configured, endpoints reviewed, and tests run on a disposable/test n8n instance. The included main-ingress/processor/error-handler exports are templates for a modular arrangement, not a proof of deployed connectivity. n8n Execute Workflow nodes must be bound to the actual imported child-workflow IDs in the target instance.

## Event contract

Recommended inbound envelope:

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

Use stable event IDs and durable uniqueness at the destination for cross-execution idempotency. A Set inside a Code node only detects duplicates within one execution.
