# FlowForge-AI

**A business-automation portfolio built around n8n workflow templates.**  
Maintained by **Muhammad Farhan**.

FlowForge-AI organizes 20 automation concepts into individual, self-contained folders. Each folder keeps its workflow export, implementation notes, and optional Google Apps Script adapter together.

> **Project status:** Portfolio / implementation templates. Some workflows still contain placeholders or require provider-specific configuration. Static validation is not proof of successful import or live execution. Review the status and testing notes before using any workflow with real users or data.

## At a glance

- **20** numbered workflow templates
- **One folder per workflow** with `README.md`, `workflow.json`, and `Code.gs`
- Python static validator and GitHub Actions check
- Setup, credentials, safety, and validation documentation
- MIT-licensed repository

## Workflow catalog

| # | Workflow | Business area | Folder |
|---:|---|---|---|
| 01 | Lead Capture & CRM | Sales | [Open](workflows/01-lead-capture-crm/) |
| 02 | Lead Scoring & Routing | Sales | [Open](workflows/02-lead-scoring-routing/) |
| 03 | Email Follow-up Sequence | Sales | [Open](workflows/03-email-follow-up-sequence/) |
| 04 | Inbox Triage Assistant | Productivity | [Open](workflows/04-inbox-triage-assistant/) |
| 05 | Customer Support Desk | Support | [Open](workflows/05-customer-support-desk/) |
| 06 | FAQ & Human Handoff | Support | [Open](workflows/06-faq-human-handoff/) |
| 07 | Meeting Booking System | Scheduling | [Open](workflows/07-meeting-booking-system/) |
| 08 | Meeting Reminders | Scheduling | [Open](workflows/08-meeting-reminders/) |
| 09 | Client Onboarding | Operations | [Open](workflows/09-client-onboarding/) |
| 10 | Invoice & Payment Reminders | Finance operations | [Open](workflows/10-invoice-payment-reminders/) |
| 11 | Content Creation & Approval | Content operations | [Open](workflows/11-content-creation-approval/) |
| 12 | Instagram Publishing Pipeline | Content operations | [Open](workflows/12-instagram-publishing-pipeline/) |
| 13 | YouTube Publishing Assistant | Content operations | [Open](workflows/13-youtube-publishing-assistant/) |
| 14 | Content Repurposing | Content operations | [Open](workflows/14-content-repurposing/) |
| 15 | Newsletter Campaign Builder | Marketing | [Open](workflows/15-newsletter-campaign-builder/) |
| 16 | Weekly Business Report | Analytics | [Open](workflows/16-weekly-business-report/) |
| 17 | Feedback Routing | Customer experience | [Open](workflows/17-feedback-routing/) |
| 18 | Workflow Error Monitor | Reliability | [Open](workflows/18-workflow-error-monitor/) |
| 19 | API Health Monitor | Reliability | [Open](workflows/19-api-health-monitor/) |
| 20 | Telegram Business Assistant | Messaging | [Open](workflows/20-telegram-business-assistant/) |

Browse the [full workflow index](workflows/README.md).

## Repository layout

```text
FlowForge-AI/
├── .github/workflows/       # Automated static validation
├── docs/                    # Architecture and contribution guidance
├── scripts/                 # Local validation utilities
├── workflows/
│   ├── README.md             # Workflow index
│   ├── CREDENTIALS-GUIDE.md  # Provider setup notes
│   └── <workflow-slug>/
│       ├── README.md         # Purpose, setup, tests, limitations
│       ├── workflow.json     # n8n import/export
│       └── Code.gs           # Optional Google Apps Script adapter
├── TESTING-AND-VALIDATION.md
├── LICENSE
└── README.md
```

Older root-level numbered JSON files and reference directories are retained for backward compatibility while the per-workflow folders are the preferred entry point. See [structure notes](docs/PROJECT-STRUCTURE.md).

## Quick start

1. Open a workflow folder and read its `README.md`.
2. Download `workflow.json`, then import it into a **test** n8n project.
3. Check your n8n version and resolve missing or placeholder nodes.
4. Add credentials using n8n's credential manager; never put secrets in exported JSON or source control.
5. Replace example IDs, recipients, URLs, and business rules.
6. Run success, invalid-input, duplicate, and provider-failure tests using synthetic data.
7. Confirm expected side effects in test systems and record the execution evidence.
8. Activate only after review and end-to-end verification.

The matching `Code.gs` is an optional Google Sheets adapter, not a mandatory dependency for every workflow. Follow that workflow's guide before deploying it.

## Validate locally

Requires Python 3.10 or later.

```bash
python scripts/validate_workflows.py
```

The validator checks workflow JSON syntax, node naming, connection references, expected folder files, and the presence of the 20 numbered workflow folders. GitHub Actions runs the same static checks on pushes and pull requests.

**What this does not prove:** n8n import compatibility, valid provider-node parameters, credential configuration, Apps Script deployment, or live API behavior. See [Testing & Validation](TESTING-AND-VALIDATION.md).

## Security and responsible use

- Use test accounts and synthetic data first.
- Keep API keys, OAuth tokens, spreadsheet IDs with sensitive access, and customer data out of Git.
- Use least-privilege credentials and appropriate authentication for webhooks.
- Add consent, suppression lists, rate limits, retries, idempotency, and human approval where relevant.
- Do not enable publishing, messaging, payment reminders, or customer-facing workflows until their side effects are verified.

## Contributing

Read [the project structure and contribution notes](docs/PROJECT-STRUCTURE.md). Keep each workflow self-contained, update its guide when changing behavior, and run the validator before opening a pull request.

## Maintainer

**Muhammad Farhan**  
- GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)
- LinkedIn: [Muhammad Farhan](https://www.linkedin.com/in/muhammadfarhanmrs/)
- YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)

## License

Distributed under the [MIT License](LICENSE). Third-party platforms and APIs remain subject to their own terms.

*Design clearly. Validate continuously. Automate responsibly.*
