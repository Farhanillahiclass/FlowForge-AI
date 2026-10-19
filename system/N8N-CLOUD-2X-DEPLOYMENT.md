# n8n Cloud 2.x Deployment Guide

This guide is the practical setup companion for FlowForge-AI. Follow it in a separate test project before enabling schedules, public webhooks, customer messages, financial reminders, or publishing.

> **Status boundary:** these steps describe how to deploy and test the exported templates. They do not mean the workflows have been imported or live-tested in your n8n account.

## 1. What is included

- 20 canonical business workflow exports: `workflows/<slug>/workflow.json`
- `system/00-main-ingress.json`: authenticated HTTP entry point and envelope validation
- `system/01-request-processor.json`: event dispatcher with 20 child routes
- `system/90-central-error-handler.json`: error-triggered log and alert workflow
- Per-workflow setup guides, credentials matrix, and static validator

Architecture overview: [System diagram](../docs/images/flowforge-architecture.svg).

## 2. Import in the correct order

1. In n8n Cloud, create or choose a dedicated **test project**.
2. Import each of the 20 canonical child JSON files. Do not activate them yet.
3. Open each child and review all nodes. Configure its required credentials and placeholders from [Credentials Guide](../workflows/CREDENTIALS-GUIDE.md) and its own README.
4. Import `system/01-request-processor.json`.
5. In every Execute Sub-workflow node in Request Processor, use the workflow picker to select the matching imported child. Verify all 20 routes. Never leave `REPLACE_WITH_WORKFLOW_ID_XX` values.
6. Import `system/00-main-ingress.json`. In **Run Request Processor**, select the imported Request Processor workflow.
7. Create/select a Header Auth credential for the Main Ingress Webhook. Keep the secret in n8n's credential store.
8. Import `system/90-central-error-handler.json`. Configure the operations log and operator alert destination.
9. For the ingress, request processor, and any child whose unattended failures need reporting, open workflow settings and select the central error workflow in **Error Workflow**. Save and test this configuration.
10. Save each workflow. Leave all workflows inactive until the test matrix passes.

The imported workflow IDs are local to your n8n workspace. Selecting them in the UI is a required deployment step; GitHub exports cannot safely know the IDs assigned in another workspace.

## 3. Shared request contract

Main Ingress expects an object with a non-empty `requestId`, a supported `eventType`, and object-valued `data`. Example:

```json
{
  "requestId": "test-lead-0001",
  "eventType": "lead.created",
  "source": "flowforge-test",
  "occurredAt": "2026-10-19T09:00:00.000Z",
  "data": {
    "name": "Test Person",
    "email": "test@example.com",
    "company": "Example Test Co",
    "message": "Synthetic test lead"
  }
}
```

Use only synthetic records and test recipients. For a deliberate retry of one event, reuse the same request ID. For a new business event, generate a new ID.

## 4. Route binding checklist

Confirm every row in Request Processor's Switch/route section is connected to the expected Execute Sub-workflow node and the node selects the correct imported child.

| Event type | Child |
|---|---|
| `lead.created` | 01 Lead Capture & CRM |
| `lead.score_requested` | 02 Lead Scoring & Routing |
| `email.followup.dispatch` | 03 Email Follow-up Sequence |
| `inbox.message.received` | 04 Inbox Triage Assistant |
| `support.ticket.created` | 05 Customer Support Desk |
| `support.faq.question` | 06 FAQ & Human Handoff |
| `meeting.booking.requested` | 07 Meeting Booking System |
| `meeting.reminder.dispatch` | 08 Meeting Reminders |
| `client.onboarding.start` | 09 Client Onboarding |
| `invoice.reminder.dispatch` | 10 Invoice & Payment Reminders |
| `content.draft.requested` | 11 Content Creation & Approval |
| `instagram.publish.requested` | 12 Instagram Publishing Pipeline |
| `youtube.upload.requested` | 13 YouTube Publishing Assistant |
| `content.repurpose.requested` | 14 Content Repurposing |
| `newsletter.campaign.requested` | 15 Newsletter Campaign Builder |
| `business.report.generate` | 16 Weekly Business Reporting |
| `feedback.received` | 17 Feedback & Escalation |
| `workflow.error.received` | 18 Workflow Error Monitor |
| `api.health.check` | 19 API Health Monitor |
| `telegram.command.received` | 20 Telegram Business Assistant |

## 5. How to test a child workflow

For each child:

1. Open its workflow canvas and confirm the correct parent-call trigger is present.
2. Run a manual test using synthetic input. If a child also has a schedule trigger, test the schedule branch separately and leave it inactive until approved.
3. Inspect node input/output at each step; do not rely only on the final green check.
4. Verify the real destination: expected test sheet row, message in the test inbox, calendar event, API response, private/test upload, or test bot response.
5. Test invalid input and confirm it stops before the external side effect.
6. Replay the same request ID and inspect whether a duplicate record/message/action is created.
7. Use a safe controlled provider failure and confirm the run fails visibly or returns a truthful structured error.
8. Record execution ID, expected output, actual output, destination-side evidence, and pass/fail in [Testing & Validation](../TESTING-AND-VALIDATION.md).

## 6. Workflow-specific guardrails

- **01 Lead Capture / 02 Lead Scoring / 05 Support / 09 Onboarding / 17 Feedback:** use dedicated test sheets; verify column headers and duplicate behavior.
- **03 Follow-up / 08 Reminders / 10 Invoice Reminders:** test schedules manually first. Do not enable repeated sends until timing, sent markers, and retry behavior are verified.
- **04 Inbox Triage / 06 FAQ Handoff / 20 Telegram:** use synthetic messages. Verify uncertain or sensitive cases reach a human. Telegram updates must arrive from a trusted Telegram Trigger or authenticated gateway.
- **07 Meeting Booking:** verify time zones, required fields, Calendar permissions, and overlapping bookings. Calendar event creation alone does not prove a conflict-free booking.
- **11 Content Creation / 14 Repurposing:** verify generated content is saved as a draft and that reviewer notification is not confused with a durable approval callback.
- **12 Instagram / 13 YouTube:** use private/test destinations, require explicit approval, and check the final processing/publishing state in the platform.
- **15 Newsletter:** first test with no eligible recipients, then only internal test addresses. Verify consent and unsubscribe suppression before any real campaign.
- **16 Weekly Report:** compare reported totals against a small synthetic source dataset by hand.
- **18 Error Monitor:** deliberately cause a safe test failure only after assigning the Error Workflow; verify the alert/log arrives.
- **19 API Health:** test healthy, failing, repeated-failure, and recovery states; confirm alerts do not falsely claim recovery.

## 7. Parent ingress acceptance tests

Run these through the authenticated Main Ingress test URL:

- **Valid known event:** expect the intended child to execute and the result to return.
- **Missing requestId:** expect validation rejection and no child side effect.
- **Missing/non-object data:** expect validation rejection.
- **Unknown eventType:** expect a structured unsupported-event result with supported event types.
- **Repeated requestId:** inspect child-side idempotency and external destinations.
- **Controlled child failure:** inspect execution history and confirm the Error Workflow is assigned and invoked where configured.
- **Wrong/missing Header Auth:** confirm the request is rejected before business logic.

Use n8n's Executions view to inspect status and node output. Retry only after understanding whether the previous run may already have caused an external side effect.

## 8. Definition of done

A workflow may be marked **PASS in the target workspace** only when:

- All required credentials and configuration placeholders are resolved.
- Parent workflow IDs and input mappings are correct.
- Positive, negative, duplicate/retry, and provider-failure cases have been tested.
- Destination-side evidence confirms the expected outcome.
- Approval, consent, and safety gates behave as intended.
- Execution ID and results are recorded.

A repository JSON file passing static validation is not sufficient to mark a workflow end-to-end complete.

## 9. Official n8n documentation

Use official docs for UI details, node options, and version-specific behavior:

- [n8n documentation](https://docs.n8n.io/)
- [Sub-workflows](https://docs.n8n.io/flow-logic/subworkflows/)
- [Error handling](https://docs.n8n.io/flow-logic/error-handling/)
- [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Executions and retry](https://docs.n8n.io/workflows/executions/all-executions/)
- [Data mapping](https://docs.n8n.io/data/data-mapping/data-mapping-ui/)
- [Security audit](https://docs.n8n.io/hosting/securing/security-audit/)
