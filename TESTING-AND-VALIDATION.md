# Testing & Validation Report — FlowForge-AI

## Scope and honest status

The repository contains 20 canonical n8n workflow exports, a shared ingress/dispatcher/error-handler layer, individual Apps Script adapters, and static validation in GitHub Actions.

- Canonical exports live at `workflows/<slug>/workflow.json`; each workflow folder also contains its own `Code.gs` and `README.md`.
- The system dispatcher is intended to route the 20 documented event types to their canonical child workflows.
- The workflow exports are designed to remain inactive until credentials, IDs and node mappings are configured.
- Apps Script adapters have been hardened to validate request IDs and payload shapes, check spreadsheet headers, deduplicate under a script lock, and avoid spreadsheet formula injection. These adapters are separate from n8n until an HTTP Request node explicitly connects them.
- **Live n8n import, provider credentials, Apps Script deployment, and destination-side effects have not been executed in this environment.** A source-level change is not proof of runtime success.

## Run repository validation

From the repository root:

```bash
python scripts/validate_workflows.py
```

The validator checks folder layout, required files, JSON syntax, unique node identities, connection targets, webhook authentication settings, absence of duplicate mirrors and No Operation nodes, and the system's 20 Execute Sub-workflow routes. GitHub Actions runs this static validator on pushes and pull requests.

A passing static check does **not** prove node-parameter compatibility, credential validity, authentication setup, Apps Script deployment, correct business logic, or successful execution against a provider.

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

## Workflow-specific limitations still requiring tests

- **Lead/support and spreadsheet-backed queues:** read-before-write can race in overlapping executions; use a database unique constraint for high-volume/critical idempotency.
- **Meeting booking/reminders:** verify calendar free/busy conflict handling, timezone, reminder send/log reconciliation and repeated schedule runs.
- **Client onboarding/invoice reminders:** the Sheets state is not authoritative accounting or project state; external payment state and calendar scheduling need separate integrations.
- **Content approval:** email notifications are not approval callbacks. Approval state must be persisted and tied to a trusted reviewer before any publishing action.
- **Instagram:** the current workflow uses a fixed wait instead of polling media container status; publish ledger and ambiguous-timeout reconciliation remain required.
- **YouTube:** upload success and processing completion are different; verify final processing status in YouTube Studio. Caller-supplied approval flags are not identity proof.
- **Newsletter:** verify consent/unsubscribe semantics and run only against an internal test audience first; sending and campaign logging are not transactional.
- **Weekly report:** counts and totals depend on source schemas, date boundaries and timezone; reconcile with known sample data.
- **Error monitor:** assign the workflow in n8n settings. An error workflow does not monitor all other workflows merely by being imported.
- **API health monitor:** durable alert suppression and recovery state are required to prevent repeated alerts during a prolonged outage.
- **Telegram assistant:** configure a native Telegram Trigger or a secured webhook with Telegram webhook verification; keep bot tokens in n8n credentials.

## Apps Script adapter contract

Each `Code.gs` file is a standalone Web App adapter, not an automatic integration bridge. Before deployment:

1. Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`.
2. Run that workflow's `setupSheet()` function manually and confirm its exact headers.
3. Use a separate test spreadsheet and a dedicated token.
4. Restrict Web App access as tightly as the deployment architecture allows.
5. Send a test payload using the expected `requestId` and `data` shape; verify invalid token, malformed JSON, duplicate ID, bad header and missing configuration cases.
6. Connect n8n to the Apps Script URL explicitly only if that integration is intended. Do not assume the Apps Script queue and n8n nodes share state.
7. Never commit real tokens, API keys, personal data or provider credentials.

## Evidence record

For every runtime test, record n8n version, workflow name, test date, execution ID, expected and actual output, pass/fail, and destination-side evidence. Use synthetic data and redact secrets. Do not mark an automation production-ready until the relevant cases pass in your n8n instance.

**Current conclusion:** Source and documentation hardening has been applied across the workflow set. Static validation should be run in GitHub Actions, then all workflows still need import/configuration/runtime verification against the actual n8n Cloud instance and provider accounts.
