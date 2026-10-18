# FlowForge-AI

**A modular n8n A–Z automation system** maintained by **Muhammad Farhan**.

FlowForge-AI contains 20 canonical business workflows and a shared system layer for authenticated ingress, request validation, parent/child orchestration, and centralized error handling. Each business workflow lives in exactly one folder under `workflows/`.

> **Current status:** repository structure and static workflow graphs have been checked, and the canonical workflows now have real integration actions instead of `No Operation` nodes. This does **not** prove live n8n execution. Import the files into your n8n instance, select the workflow IDs and credentials, replace remaining configuration placeholders, and complete the test plan before activating.

## A–Z architecture

```text
Authenticated Webhook
        |
        v
00 Main Ingress
  - validate requestId, eventType, object data
  - reject malformed envelope
        |
        v
01 Request Processor
  - map eventType to one canonical child workflow
        |
        +-- 01 lead.created ----------------------> Lead Capture & CRM
        +-- 02 lead.score_requested -------------> Lead Scoring & Routing
        +-- 03 email.followup.dispatch ----------> Email Follow-up
        +-- 04 inbox.message.received -----------> Inbox Triage
        +-- 05 support.ticket.created -----------> Customer Support
        +-- 06 support.faq.question -------------> FAQ / Human Handoff
        +-- 07 meeting.booking.requested --------> Meeting Booking
        +-- 08 meeting.reminder.dispatch --------> Meeting Reminders
        +-- 09 client.onboarding.start ----------> Client Onboarding
        +-- 10 invoice.reminder.dispatch ---------> Invoice Reminders
        +-- 11 content.draft.requested ----------> Content Creation & Approval
        +-- 12 instagram.publish.requested ------> Instagram Publishing
        +-- 13 youtube.upload.requested ---------> YouTube Upload
        +-- 14 content.repurpose.requested ------> Content Repurposing
        +-- 15 newsletter.campaign.requested ----> Newsletter Campaign
        +-- 16 business.report.generate ---------> Weekly Business Report
        +-- 17 feedback.received ----------------> Feedback Routing
        +-- 18 workflow.error.received ----------> Error Monitor
        +-- 19 api.health.check -----------------> API Health Monitor
        +-- 20 telegram.command.received --------> Telegram Assistant

Unhandled execution failure --------------------> 90 Central Error Handler
                                                    sanitized log + alert
```

Every routed node references a **canonical workflow folder**, not a second copy of its JSON. The workflow ID placeholders must be bound to the imported workflows in your n8n instance. Read [system deployment instructions](system/README.md).

## Workflow catalog

| # | Workflow | Area | Folder |
|---:|---|---|---|
| 01 | Lead Capture & CRM | Sales | [Open](workflows/01-lead-capture-crm/README.md) |
| 02 | Lead Scoring & Routing | Sales | [Open](workflows/02-lead-scoring-routing/README.md) |
| 03 | Email Follow-up Sequence | Sales | [Open](workflows/03-email-follow-up-sequence/README.md) |
| 04 | Inbox Triage Assistant | Productivity | [Open](workflows/04-inbox-triage-assistant/README.md) |
| 05 | Customer Support Desk | Customer support | [Open](workflows/05-customer-support-desk/README.md) |
| 06 | FAQ & Human Handoff | Customer support | [Open](workflows/06-faq-human-handoff/README.md) |
| 07 | Meeting Booking System | Scheduling | [Open](workflows/07-meeting-booking-system/README.md) |
| 08 | Meeting Reminders | Scheduling | [Open](workflows/08-meeting-reminders/README.md) |
| 09 | Client Onboarding | Operations | [Open](workflows/09-client-onboarding/README.md) |
| 10 | Invoice & Payment Reminders | Finance operations | [Open](workflows/10-invoice-payment-reminders/README.md) |
| 11 | Content Creation & Approval | Content operations | [Open](workflows/11-content-creation-approval/README.md) |
| 12 | Instagram Publishing Pipeline | Content operations | [Open](workflows/12-instagram-publishing-pipeline/README.md) |
| 13 | YouTube Publishing Assistant | Content operations | [Open](workflows/13-youtube-publishing-assistant/README.md) |
| 14 | Content Repurposing | Content operations | [Open](workflows/14-content-repurposing/README.md) |
| 15 | Newsletter Campaign Builder | Marketing | [Open](workflows/15-newsletter-campaign-builder/README.md) |
| 16 | Weekly Business Reporting | Analytics | [Open](workflows/16-weekly-business-report/README.md) |
| 17 | Feedback & Escalation | Customer experience | [Open](workflows/17-feedback-routing/README.md) |
| 18 | Workflow Error Monitor | Reliability | [Open](workflows/18-workflow-error-monitor/README.md) |
| 19 | API Health Monitor | Reliability | [Open](workflows/19-api-health-monitor/README.md) |
| 20 | Telegram Business Assistant | Messaging | [Open](workflows/20-telegram-business-assistant/README.md) |

Browse the [complete workflow index](workflows/README.md) and [credential matrix](workflows/CREDENTIALS-GUIDE.md).

## Repository layout

```text
FlowForge-AI/
├── .github/workflows/         # Static checks on pushes and PRs
├── docs/                      # Architecture and contribution guide
├── scripts/                   # Repository validator
├── system/
│   ├── 00-main-ingress.json
│   ├── 01-request-processor.json
│   ├── 90-central-error-handler.json
│   └── README.md
├── workflows/
│   ├── README.md
│   ├── CREDENTIALS-GUIDE.md
│   └── <workflow-slug>/
│       ├── README.md
│       ├── workflow.json
│       └── Code.gs             # optional Apps Script adapter
├── TESTING-AND-VALIDATION.md
├── LICENSE
└── README.md
```

The former root-level numbered JSON copies and the mirrored `apps-script/` / `workflow-guides/` directories are removed. Per-workflow folders are the single source of truth. The old one-off demo subflows in the system directory have also been removed to avoid parallel copies of lead/support logic.

## Quick start

1. Read [architecture](docs/ARCHITECTURE.md) and [credentials setup](workflows/CREDENTIALS-GUIDE.md).
2. Import the 20 canonical `workflows/<slug>/workflow.json` files into a **test** n8n project.
3. Import `system/01-request-processor.json`; select the correct imported child workflow ID in all 20 Execute Sub-workflow nodes.
4. Import `system/00-main-ingress.json`; select the Request Processor workflow and configure Webhook Header Auth.
5. Import `system/90-central-error-handler.json`; configure the operations log and alert destination, then assign it under Workflow Settings → Error Workflow for the workflows you want to monitor.
6. Configure provider credentials, spreadsheet IDs/tabs, recipient emails, Graph API settings, and the other `REPLACE_WITH_...` placeholders inside n8n.
7. Test success, invalid payload, duplicate request, provider failure, approval gates, and actual destination-side effects. Keep workflows inactive until review is complete.

## Validate locally

Requires Python 3.10 or later.

```bash
python scripts/validate_workflows.py
```

The static validator checks canonical folder structure, JSON graph references, authentication on Webhook nodes, duplicate copies, and missing `No Operation` placeholders. GitHub Actions runs the same checks on pushes and pull requests.

**Important:** static validation is not a live n8n test. This environment cannot select your private n8n workflow IDs, grant OAuth credentials, deploy Apps Script, verify provider permissions, or inspect destination-side effects. Read [Testing & Validation](TESTING-AND-VALIDATION.md).

## Security and reliability

- Webhook triggers use Header Auth in these example exports; select the credential in your own n8n instance.
- Keep API keys, OAuth tokens, and real customer data out of Git.
- The request contract needs a stable `requestId` for duplicate handling.
- Read-before-write checks against Google Sheets are starter idempotency, not strict exactly-once guarantees: concurrent calls and uncertain timeouts need reconciliation or a database unique constraint.
- Publishing, bulk email, customer messaging, and financial reminders remain inactive until approvals, consent/suppression, and failure paths have been verified.
- Do not interpret a successful JSON parse, HTTP response, or GitHub CI pass as proof that an email, calendar booking, upload, or publish action succeeded.

## Maintainer

**Muhammad Farhan**  
GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)  
LinkedIn: [Muhammad Farhan](https://www.linkedin.com/in/muhammadfarhanmrs/)  
YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)

## License

[MIT License](LICENSE). Third-party services remain subject to their own terms.

*One source of truth. Modular workflows. Test every side effect.*
