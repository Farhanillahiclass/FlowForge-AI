# Parent–Child Orchestration and End-to-End Completion

This document defines the supported parent/child execution model for FlowForge-AI. It is a deployment contract, not evidence of a successful live run.

## Architecture

```text
External caller
   |
   | POST + Header Auth + event envelope
   v
system/00-main-ingress.json
   | validate requestId, eventType, data
   v
system/01-request-processor.json
   | route by eventType
   +---- Execute Workflow ----> workflows/01-lead-capture-crm/workflow.json
   +---- Execute Workflow ----> workflows/02-lead-scoring-routing/workflow.json
   +---- ...                  > one canonical child per route
   +---- Execute Workflow ----> workflows/20-telegram-business-assistant/workflow.json
   |
   v
structured child result -> ingress HTTP response

Configured n8n Error Workflow -> system/90-central-error-handler.json
```

The 20 files under `workflows/<slug>/workflow.json` are the canonical child exports. Do not create duplicate numbered JSON copies. Each child supports a parent call through its `Execute Workflow Trigger`; some also expose a direct authenticated Webhook for standalone use. These are two entry modes into one workflow, not two copies of its business logic.

## Parent-to-child route map

| Event type | Child workflow |
|---|---|
| `lead.created` | `01-lead-capture-crm` |
| `lead.score_requested` | `02-lead-scoring-routing` |
| `email.followup.dispatch` | `03-email-follow-up-sequence` |
| `inbox.message.received` | `04-inbox-triage-assistant` |
| `support.ticket.created` | `05-customer-support-desk` |
| `support.faq.question` | `06-faq-human-handoff` |
| `meeting.booking.requested` | `07-meeting-booking-system` |
| `meeting.reminder.dispatch` | `08-meeting-reminders` |
| `client.onboarding.start` | `09-client-onboarding` |
| `invoice.reminder.dispatch` | `10-invoice-payment-reminders` |
| `content.draft.requested` | `11-content-creation-approval` |
| `instagram.publish.requested` | `12-instagram-publishing-pipeline` |
| `youtube.upload.requested` | `13-youtube-publishing-assistant` |
| `content.repurpose.requested` | `14-content-repurposing` |
| `newsletter.campaign.requested` | `15-newsletter-campaign-builder` |
| `business.report.generate` | `16-weekly-business-report` |
| `feedback.received` | `17-feedback-routing` |
| `workflow.error.received` | `18-workflow-error-monitor` |
| `api.health.check` | `19-api-health-monitor` |
| `telegram.command.received` | `20-telegram-business-assistant` |

## Import and connect in n8n Cloud 2.x

1. Create a separate test project or use a dedicated test workspace. Keep all imported workflows inactive.
2. Import all 20 canonical child JSON files first.
3. Open `01 - Request Processor`. In each of its 20 **Execute Sub-workflow** nodes, select the matching imported child from the workflow picker. Save each node and verify that no `REPLACE_WITH_WORKFLOW_ID_XX` remains.
4. Import `00 - Main Ingress`. In **Run Request Processor**, select the imported `01 - Request Processor` workflow. Configure Header Auth on the webhook.
5. Import `90 - Central Error Handler`. Configure its log destination and alert recipient. Assign it under **Workflow Settings → Error Workflow** for the parent and each child that should report failures.
6. For every child, configure provider credentials and placeholders inside n8n: spreadsheet/document IDs, sheet names, email recipients, Calendar IDs, API URLs/versions, model settings, media URLs, and provider-specific identifiers. Never put secrets in GitHub or in a chat.
7. For each child, check both entry paths: (a) parent-triggered with the shared envelope and (b) direct authenticated webhook if direct access is intended. If a direct webhook is not needed, do not expose or activate it.
8. Run the test matrix below with synthetic data. Verify the n8n execution and the destination service. Only activate a workflow after its route has passed.

Workflow IDs are assigned by the target n8n instance; they must be selected after import. A JSON export cannot safely contain the correct IDs for every user's n8n workspace.

## Shared parent input contract

Send this envelope to the Main Ingress webhook:

```json
{
  "requestId": "test-lead-0001",
  "eventType": "lead.created",
  "source": "flowforge-test",
  "occurredAt": "2026-10-18T10:00:00.000Z",
  "data": {
    "name": "Test Person",
    "email": "farhan-test@example.com",
    "company": "Example Test Co",
    "message": "Synthetic test lead"
  }
}
```

Use a new stable `requestId` per business event, and reuse that same ID when intentionally testing a retry. Do not use real customer data during acceptance testing.

## Required end-to-end checks for every route

- **Routing:** the parent calls the expected child, not another workflow.
- **Input mapping:** `requestId`, `eventType`, `source`, `occurredAt`, and object-valued `data` arrive intact; the child correctly maps domain fields.
- **Success result:** the child returns a structured result that the parent can return to its caller.
- **Validation failure:** missing or malformed required fields are rejected without an external side effect.
- **Retry/duplicate:** replaying the same request ID does not unintentionally duplicate records, messages, bookings, uploads, or other side effects. Spreadsheet read-before-write checks are not strict exactly-once protection under concurrent runs.
- **Provider failure:** test a safe, controlled failure and confirm the run is visibly failed or returns an explicit error—not a false success.
- **Observability:** record execution ID, expected/actual result, and destination-side evidence. Confirm the central Error Workflow is actually assigned and tested.
- **Safety gates:** publishing, newsletter sends, invoice reminders, and customer-facing messages must remain gated until a human-approved test passes.

## Route-specific safety notes

- **07 Meeting Booking:** verify availability/conflict checks before considering bookings production-ready; calendar event creation alone does not guarantee no overlap.
- **08 Meeting Reminders and 10 Invoice Reminders:** verify durable sent/payment state and retry reconciliation. A send that succeeds while logging fails can otherwise be repeated.
- **11 Content Approval and 14 Repurposing:** a review email alone is not a resumable approval callback. Do not treat email delivery as approval.
- **12 Instagram and 13 YouTube:** use a private/test account, require explicit approval, and verify publish/upload processing status in the destination before reporting completion.
- **15 Newsletter:** test only with internal test recipients; validate consent and unsubscribe suppression before any campaign.
- **18 Error Monitor:** the workflow must be assigned in n8n's Error Workflow setting; importing it alone does not monitor other workflows.
- **19 API Health Monitor:** test both recovery and repeated-failure behavior, not only a single failed HTTP request.
- **20 Telegram Assistant:** ensure the inbound update is from a trusted Telegram Trigger or authenticated gateway; a generic webhook does not authenticate Telegram updates by itself.

## Definition of done

A route is end-to-end complete only when its parent route is bound to the correct child in the target n8n workspace, its required credentials/configuration are set, the positive and negative tests pass, duplicate/retry behavior is understood, and the destination-side result is verified. Static JSON validation is necessary but does not establish live provider execution.
