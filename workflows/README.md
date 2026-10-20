# Workflow Catalog

**Single source of truth:** each business automation is stored in one directory. Don't add another JSON or Apps Script mirror in a separate folder.

Every folder contains:
- `README.md` — business goal, credentials, setup, test plan, limitations.
- `workflow.json` — canonical n8n export.
- `Code.gs` — optional Apps Script adapter for Google Sheets, only where useful.

## Workflows

- **01 Lead Capture & CRM** — Validate a lead, save it to the sheet, notify sales, and return a structured result. [Open folder](./01-lead-capture-crm/)
- **02 Lead Scoring & Routing** — Calculate a configurable lead score and route hot/warm/cold leads. [Open folder](./02-lead-scoring-routing/)
- **03 Email Follow-up Sequence** — Prepare consent-aware follow-up work; delivery needs a consented source and mail service. [Open folder](./03-email-follow-up-sequence/)
- **04 Inbox Triage Assistant** — Classify incoming messages and route urgent items. [Open folder](./04-inbox-triage-assistant/)
- **05 Customer Support Desk** — Validate a support request, assign priority, store it, and notify support. [Open folder](./05-customer-support-desk/)
- **06 FAQ & Human Handoff** — Match an approved FAQ or hand uncertain/sensitive cases to a person. [Open folder](./06-faq-human-handoff/)
- **07 Meeting Booking System** — Validate a booking and coordinate calendar availability, event creation and confirmation. [Open folder](./07-meeting-booking-system/)
- **08 Meeting Reminders** — Find meetings due for reminder, notify, and persist a reminder marker. [Open folder](./08-meeting-reminders/)
- **09 Client Onboarding** — Validate a new client and coordinate onboarding tasks. [Open folder](./09-client-onboarding/)
- **10 Invoice & Payment Reminders** — Find overdue invoices, apply reminder rules, send reminders, and log outcomes. [Open folder](./10-invoice-payment-reminders/)
- **11 Content Creation & Approval** — Draft content from a brief and keep approval before publication. [Open folder](./11-content-creation-approval/)
- **12 Instagram Publishing Pipeline** — Validate content, require approval, publish through configured Meta integration, and log. [Open folder](./12-instagram-publishing-pipeline/)
- **13 YouTube Publishing Assistant** — Validate video metadata and source file, coordinate upload and processing. [Open folder](./13-youtube-publishing-assistant/)
- **14 Content Repurposing** — Generate platform-specific drafts and send for review. [Open folder](./14-content-repurposing/)
- **15 Newsletter Campaign Builder** — Build a newsletter for a consented audience with suppression and logging. [Open folder](./15-newsletter-campaign-builder/)
- **16 Weekly Business Reporting** — Aggregate business metrics into a weekly report and archive it. [Open folder](./16-weekly-business-report/)
- **17 Feedback & Escalation** — Store feedback and privately route low scores for follow-up. [Open folder](./17-feedback-routing/)
- **18 Workflow Error Monitor** — Normalize execution failures, write an error log and alert an operator. [Open folder](./18-workflow-error-monitor/)
- **19 API Health Monitor** — Check configured endpoints, detect failure/recovery, and alert. [Open folder](./19-api-health-monitor/)
- **20 Telegram Business Assistant** — Parse Telegram commands and route approved business actions. [Open folder](./20-telegram-business-assistant/)

Shared references: [Credentials guide](./CREDENTIALS-GUIDE.md), [A–Z system layer](../system/README.md), and [Testing & validation](../TESTING-AND-VALIDATION.md).

> These exports have different levels of completion. Valid JSON does not prove successful import, credential configuration, or real provider actions.


## Shared quality standards

Before activating any workflow, follow the repository-wide [Workflow Quality & Safe Operations Guide](../docs/WORKFLOW-QUALITY.md). It defines reusable checks for credentials, request validation, duplicate events, retries, human approval, error handling, and safe recovery.
