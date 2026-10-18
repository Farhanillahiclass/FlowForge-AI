# FlowForge-AI System Layer

This folder contains three central system workflows. The **20 business workflow exports under `workflows/` are the only canonical child workflows**.

## Flow

```text
00 Main Ingress — Header Auth + request envelope validation
       |
       v
01 Request Processor — Switch on eventType
       |
       +--> Execute one of the 20 canonical workflow files
       |
       +--> Reject unknown eventType with structured error

Unattended execution error --> 90 Central Error Handler
                               sanitized log + operator alert
```

## Import and bind workflow IDs

1. Import all 20 canonical JSON exports from `workflows/<slug>/workflow.json`. Keep them inactive.
2. Open `system/01-request-processor.json`. In each of the 20 Execute Sub-workflow nodes, select the matching imported workflow from the n8n workflow list. Do not leave any `REPLACE_WITH_WORKFLOW_ID_XX` value.
3. Import `system/00-main-ingress.json`. Select the imported Request Processor workflow in its Execute Sub-workflow node.
4. Configure a Header Auth credential on the Main Ingress Webhook node. Direct Webhook triggers in the business workflows also use Header Auth; configure those if you plan to call them directly.
5. Import `system/90-central-error-handler.json`. Select its operations-log spreadsheet and alert recipient, then assign it under **Workflow Settings → Error Workflow** for the ingress, processor, and unattended child workflows you want monitored.
6. Select the required Google Sheets, Gmail, Calendar, Anthropic, Meta, YouTube and Telegram credentials on each applicable node. Replace IDs, sheet names, recipients, Graph API version and other placeholders in n8n.
7. Test the full parent call and every route in a test workspace before activation.

## Shared request envelope

```json
{
  "requestId": "stable-client-generated-id",
  "eventType": "lead.created",
  "source": "website",
  "occurredAt": "2026-10-18T08:00:00.000Z",
  "data": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

`requestId` should stay the same when retrying the same business event. Child workflows normalize the envelope into their domain input and return structured results. When an event is unsupported, Request Processor returns an explicit `unsupported_event_type` result.

## Event routing

| Event type | Canonical workflow |
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
| `instagram.publish.requested` | 12 Instagram Publishing |
| `youtube.upload.requested` | 13 YouTube Upload |
| `content.repurpose.requested` | 14 Content Repurposing |
| `newsletter.campaign.requested` | 15 Newsletter Campaign |
| `business.report.generate` | 16 Weekly Business Report |
| `feedback.received` | 17 Feedback & Escalation |
| `workflow.error.received` | 18 Workflow Error Monitor |
| `api.health.check` | 19 API Health Monitor |
| `telegram.command.received` | 20 Telegram Assistant |

## Reliability and status boundaries

- Exported workflows are inactive. IDs, credentials and external destinations are selected in the target n8n instance after import.
- Canonical workflow JSON contains no No Operation placeholder nodes, but provider-specific configuration and behavior still need runtime testing.
- Google Sheets read-before-write checks can prevent ordinary duplicate runs, but are not strict exactly-once processing under concurrency. For critical/high-volume routes use a durable store with unique constraints and a reconciliation plan.
- The central error handler must itself have valid credentials and should be tested with a controlled failure.
- CI/static checks do not prove that a target n8n version accepts every node parameter or that external services execute successfully.

Read [Architecture](../docs/ARCHITECTURE.md), [Credentials Guide](../workflows/CREDENTIALS-GUIDE.md), and [Testing & Validation](../TESTING-AND-VALIDATION.md).
