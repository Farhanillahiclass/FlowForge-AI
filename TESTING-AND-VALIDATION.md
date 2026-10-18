# Testing & Validation Report — FlowForge-AI

## Scope and honest status

The repository contains 20 canonical n8n workflow exports, a shared ingress/dispatcher/error-handler layer, and static validation in GitHub Actions.

- Duplicate root-level JSON copies and mirrored `apps-script/` / `workflow-guides/` trees have been removed.
- The 20 canonical workflow exports are structurally checked on this branch: each has a parent-call entry point, unique node names and IDs, valid connection targets, and remains inactive.
- The canonical 20 workflow exports contain no `n8n-nodes-base.noOp` nodes.
- The central request processor has 20 event routes, each pointing at one canonical workflow folder.
- **Live n8n import, provider credentials, and destination-side effects have not been executed in this environment.** Provider node compatibility depends on the n8n version and needs to be verified in a disposable test project.

## Run repository validation

From the repository root:

```bash
python scripts/validate_workflows.py
```

The validator checks folder layout, required files, JSON syntax, unique node identities, connection targets, webhook authentication settings, absence of duplicate mirrors and No Operation nodes, and the system's 20 Execute Sub-workflow routes. GitHub Actions runs this static validator on pushes and pull requests.

A passing static check does **not** prove node-parameter compatibility, credential validity, authentication setup, Apps Script deployment, or successful execution against a provider.

## Core system deployment order

1. Import all 20 canonical files at `workflows/<slug>/workflow.json`. Keep every workflow inactive.
2. Open `system/01-request-processor.json`. Select the correct imported workflow in every Execute Sub-workflow node. Replace all `REPLACE_WITH_WORKFLOW_ID_XX` placeholders.
3. Import `system/00-main-ingress.json`; choose the Request Processor workflow in its Execute Sub-workflow node and assign a Header Auth credential to the ingress Webhook.
4. Import `system/90-central-error-handler.json`; configure the ops log sheet and alert email, then set it under **Workflow Settings → Error Workflow** for the workflows you want monitored.
5. Configure each workflow's provider credentials, spreadsheet IDs and headers, recipients, calendar IDs, API versions, media URLs, and model settings in n8n. Never copy secrets into JSON or GitHub.
6. Test direct Webhook triggers with Header Auth too, or call a workflow through the protected Main Ingress.

## Main request contract

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

Use the same `requestId` when retrying one business event. The Main Ingress requires `requestId`, `eventType` and object-valued `data`; unsupported event types should return an explicit error.

## System route test matrix

| # | Event type | Expected child route |
|---:|---|---|
| 01 | `lead.created` | Lead Capture & CRM |
| 02 | `lead.score_requested` | Lead Scoring & Routing |
| 03 | `email.followup.dispatch` | Email Follow-up Sequence |
| 04 | `inbox.message.received` | Inbox Triage Assistant |
| 05 | `support.ticket.created` | Customer Support Desk |
| 06 | `support.faq.question` | FAQ & Human Handoff |
| 07 | `meeting.booking.requested` | Meeting Booking System |
| 08 | `meeting.reminder.dispatch` | Meeting Reminders |
| 09 | `client.onboarding.start` | Client Onboarding |
| 10 | `invoice.reminder.dispatch` | Invoice & Payment Reminders |
| 11 | `content.draft.requested` | Content Creation & Approval |
| 12 | `instagram.publish.requested` | Instagram Publishing Pipeline |
| 13 | `youtube.upload.requested` | YouTube Publishing Assistant |
| 14 | `content.repurpose.requested` | Content Repurposing |
| 15 | `newsletter.campaign.requested` | Newsletter Campaign Builder |
| 16 | `business.report.generate` | Weekly Business Reporting |
| 17 | `feedback.received` | Feedback & Escalation |
| 18 | `workflow.error.received` | Workflow Error Monitor |
| 19 | `api.health.check` | API Health Monitor |
| 20 | `telegram.command.received` | Telegram Business Assistant |

For each event route, test valid input, malformed input, stable-request replay, unsupported event type, a controlled provider failure, and the returned output. Inspect the child execution result and the destination itself—not only the HTTP response.

## Important workflow-specific limits to test

- **Lead and support duplicate checks:** the spreadsheet read-before-write path prevents ordinary repeated requests, but concurrent requests can race. A timeout after the external action may need reconciliation. For high volume/critical use, use a database with a unique constraint or documented provider idempotency key.
- **Email follow-up and meeting reminders:** state is tracked in Google Sheets. Check that the configured headers match the node mappings and test a repeated schedule run. Overlapping runs can still race.
- **Meeting booking:** event creation needs valid Calendar permissions and conflict/availability checks appropriate to the business; the current export doesn't prove a conflict-free booking.
- **Content drafts:** Anthropic API/model credentials, Sheets, and editor email need configuration. Human-review emails are not a live approval callback by themselves; don't assume an editor reply automatically resumes publishing.
- **Instagram and YouTube:** public publishing/upload requires provider app permissions, IDs, access credentials, media accessibility, and account testing. Publishing/upload output must be checked in the destination service.
- **Newsletter:** test with an internal audience, verify consent and unsubscribe columns, confirm campaign suppression, and review delivery logs before a real mailing.
- **Weekly report and health monitor:** report calculations depend on the actual schema; health alerts can repeat during a prolonged outage until durable previous-state/recovery tracking is configured.
- **Central error handler:** assign it in n8n settings and test a controlled automatic execution failure. Errors in the handler itself require separate visibility.

## Evidence record

For every runtime test, record n8n version, workflow name, test date, execution ID, expected and actual output, pass/fail, and destination-side evidence. Use synthetic data and redact secrets. Do not mark an automation production-ready until the relevant cases pass in your n8n instance.

**Current conclusion:** repository structure, static JSON graph consistency, and route wiring have been addressed; full provider-runtime validation remains outstanding.
