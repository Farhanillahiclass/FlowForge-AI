# FlowForge-AI A–Z Automation Architecture

## Goal

Build reusable n8n workflows from protected entry through validation, routing, provider actions, state tracking, and failure notification. Keep request transport/orchestration separate from domain business logic.

## Layers

1. **Entry and protection:** use Webhook, Schedule, or native service triggers. Webhook intake should use Header Auth or an approved API gateway. Payload validation runs immediately after the trigger; a sub-workflow cannot execute before a webhook event arrives.
2. **Request envelope:** normalize `requestId`, `eventType`, `source`, `occurredAt`, and object-valued `data`.
3. **Orchestrator:** validate the envelope and route by event type. Execute Sub-workflow nodes invoke child workflow IDs selected in the target n8n instance after import.
4. **Business sub-workflows:** each child owns domain validation, business rules, provider actions, and structured output.
5. **Persistence/idempotency:** use a durable event key and uniqueness enforcement. The provided read-existing-rows Sheet check is a small-volume starter; concurrent requests can race.
6. **Reliability:** use bounded retry/backoff for transient errors, an assigned Error Workflow, sanitized logs, alerts, and explicit reconciliation for uncertain provider outcomes.

## Current dispatcher routes

The system layer demonstrates three routed business events:

- `lead.created` → Lead Capture sub-workflow.
- `lead.score_requested` → Lead Scoring sub-workflow.
- `support.ticket.created` → Support Ticket sub-workflow.

The other 17 business workflow templates are documented under `workflows/` but are not yet connected to the central dispatcher. They must be adapted to the Execute Sub-workflow input contract and individually verified before they can be advertised as integrated.

## Deployment steps

Import the child workflows first, then Request Processor, then Main Ingress. Select each child's actual workflow ID in its parent's Execute Sub-workflow node. Configure credentials through n8n Credentials. Assign the central error handler under Workflow Settings → Error Workflow. Keep exports inactive until test paths and destination-side effects are verified.

Official references: [Execute Sub-workflow](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/), [Execute Sub-workflow Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/), and [Error Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/).
