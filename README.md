# FlowForge-AI

**A modular n8n automation portfolio** maintained by **Muhammad Farhan**.

FlowForge-AI contains 20 business-workflow templates and a system layer showing how webhook intake, request validation, parent/child workflows, business actions, and centralized error reporting can fit together.

> **Honest status:** this repository is not a claim that all 20 automations are fully configured in your account. Credentials and destination IDs must be selected in n8n. The system dispatcher currently demonstrates three event routes (lead capture, lead scoring, and support tickets); the other 17 templates are not yet connected to the central dispatcher.

## Project at a glance

- 20 canonical workflow folders — one source file for each workflow.
- Modular system exports for ingress, dispatch, reusable child processors, and error reporting.
- Python static validator and GitHub Actions checks.
- Credential, architecture, and end-to-end test documentation.
- MIT license.

## System architecture

```text
Webhook with Header Auth
        |
        v
00 Main Ingress ---- invalid input ----> structured validation response
        |
        v
01 Request Processor
        |
        +---- lead.created ------------> 10 Lead Capture sub-workflow
        +---- lead.score_requested ---> 11 Lead Scoring sub-workflow
        +---- support.ticket.created -> 12 Support Ticket sub-workflow
        +---- unsupported event ------> structured error result

Unhandled execution errors -----------> 90 Central Error Handler
                                         sanitized log + operator alert
```

Execute Sub-workflow references must be bound to real workflow IDs after import. See [system deployment steps](system/README.md). The relevant n8n concepts are documented in [Execute Sub-workflow](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/), [Execute Sub-workflow Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/), and [Error Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/).

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

See the [workflow index](workflows/README.md).

## Repository layout

```text
FlowForge-AI/
├── .github/workflows/       # Automated static validation
├── docs/                    # Architecture and contribution guidance
├── scripts/                 # Local validator
├── system/                  # Parent/child architecture examples
├── workflows/
│   ├── README.md
│   ├── CREDENTIALS-GUIDE.md
│   └── <workflow-slug>/
│       ├── README.md
│       ├── workflow.json
│       └── Code.gs
├── TESTING-AND-VALIDATION.md
├── LICENSE
└── README.md
```

The per-workflow folders are the single source of truth. Root-level workflow JSON copies and parallel `apps-script/` and `workflow-guides/` directories are being removed after each workflow guide was consolidated into its own README.

## Quick start

1. Read the [architecture guide](docs/ARCHITECTURE.md) and [credentials guide](workflows/CREDENTIALS-GUIDE.md).
2. Open the relevant workflow folder and read its README.
3. Import the JSON into a test n8n project and inspect all nodes.
4. Select child workflow IDs and provider credentials in n8n.
5. Replace spreadsheet IDs, recipients, URLs, and business-specific rules.
6. Test valid/invalid input, duplicate events, provider failures, and actual destination side effects.
7. Configure the central error workflow and verify it with a controlled automatic failure.
8. Activate only after all required tests pass.

## Validate locally

Requires Python 3.10+.

```bash
python scripts/validate_workflows.py
```

The validator checks canonical folder structure, workflow/system JSON syntax, basic node identities, and connection references. GitHub Actions runs it on pushes and pull requests. A static pass does not prove n8n import or live API execution; see [Testing & Validation](TESTING-AND-VALIDATION.md).

## Security and reliability

- Use Header Auth or an approved gateway for webhook intake.
- Store credentials in n8n Credentials; never commit tokens.
- Use least-privilege access and synthetic test data.
- Configure bounded retries for transient errors and alerts for unhandled failures.
- Use durable IDs and uniqueness constraints for reliable cross-run idempotency.
- Keep publishing, marketing sends, billing reminders, and customer-facing actions behind consent/approval checks until fully tested.

## Maintainer

**Muhammad Farhan**  
GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)  
LinkedIn: [Muhammad Farhan](https://www.linkedin.com/in/muhammadfarhanmrs/)  
YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)

## License

[MIT License](LICENSE). Third-party services remain subject to their respective terms.

*Build modularly. Validate every branch. Automate responsibly.*
