# FlowForge-AI — Client-Oriented n8n Automation Portfolio

**Maintainer:** Muhammad Farhan  
**Focus:** Business leads, customer support, content operations, scheduling, and service monitoring.

> **Honest project status:** These are portfolio templates under configuration. Some workflows include working intake/processing nodes; nodes named “Configure”, “Connect”, or implemented as No Operation placeholders still need real provider action nodes. No workflow should be described as production-ready until it imports correctly and passes an end-to-end test with real credentials in your n8n version.

## Import and use
1. Open a workflow JSON below and download the file.
2. In n8n, choose **Import from File**.
3. Inspect node types, parameters, and connections for your n8n version.
4. Create credentials in n8n Credentials; never place secrets in JSON/GitHub.
5. Replace placeholder spreadsheet/calendar IDs, recipient addresses, and business rules.
6. Configure every node labelled “Configure/Connect”; these labels mark unfinished integration steps.
7. Test success, invalid input, duplicates, API failures, and notification failures.
8. Activate only after end-to-end verification.

## 20 business automation systems

| # | Workflow | Trigger | Purpose |
|---:|---|---|---|
| 01 | [Lead Capture & CRM](workflows/01-lead-capture-crm.json) | Webhook | Validate inbound lead, append to Sheets, notify sales by Gmail |
| 02 | [Lead Scoring & Routing](workflows/02-lead-scoring-routing.json) | Webhook | Calculate configurable lead score and hot/warm/cold tier |
| 03 | [Email Follow-up Sequence](workflows/03-email-follow-up-sequence.json) | Schedule | Follow-up setup blueprint; needs consent checks, data source, Gmail and send log |
| 04 | [Professional Inbox Triage](workflows/04-inbox-triage-assistant.json) | Webhook starter | Classify messages and branch by priority; connect real inbox and alert nodes |
| 05 | [Customer Support Desk](workflows/05-customer-support-desk.json) | Webhook | Validate and classify support ticket; connect ticket storage and notifications |
| 06 | [FAQ & Human Handoff](workflows/06-faq-human-handoff.json) | Webhook | Match example FAQs or route to human support |
| 07 | [Meeting Booking System](workflows/07-meeting-booking-system.json) | Webhook | Validate request and create Calendar event; add availability/conflict check |
| 08 | [Meeting Reminder Dispatcher](workflows/08-meeting-reminders.json) | Schedule | Find events in reminder window; add send marker and notification action |
| 09 | [Client Onboarding](workflows/09-client-onboarding.json) | Webhook | Validate client and build onboarding checklist; connect CRM, Gmail, Calendar |
| 10 | [Invoice & Payment Reminders](workflows/10-invoice-payment-reminders.json) | Schedule | Filter unpaid overdue invoices; connect invoice source, Gmail, update node |
| 11 | [Content Creation & Approval](workflows/11-content-creation-approval.json) | Webhook | Intake brief, draft generation and human approval integration points |
| 12 | [Instagram Publishing Pipeline](workflows/12-instagram-publishing-pipeline.json) | Webhook | Validate caption/media and mark approval requirement; add Meta API publish steps |
| 13 | [YouTube Publishing Assistant](workflows/13-youtube-publishing-assistant.json) | Webhook | Validate metadata; add YouTube upload and processing-status nodes |
| 14 | [Content Repurposing](workflows/14-content-repurposing.json) | Webhook | Validate source and target platforms; add LLM and approval nodes |
| 15 | [Newsletter Campaign Builder](workflows/15-newsletter-campaign-builder.json) | Webhook | Validate campaign; connect consented audience, suppression, and email service |
| 16 | [Weekly Business Reporting](workflows/16-weekly-business-report.json) | Schedule | Read metrics, aggregate report inputs, connect formatted email and report log |
| 17 | [Feedback Routing](workflows/17-feedback-routing.json) | Webhook | Classify feedback and route low ratings for private escalation |
| 18 | [Workflow Error Monitor](workflows/18-workflow-error-monitor.json) | Error Trigger | Sanitize error context; connect alert node and set as n8n Error Workflow |
| 19 | [API Health Monitor](workflows/19-api-health-monitor.json) | Schedule | Check APIs and normalize status; add robust failure-state tracking/alerts |
| 20 | [Telegram Business Assistant](workflows/20-telegram-business-assistant.json) | Webhook starter | Parse commands and route; connect Telegram Trigger/send and CRM actions |

## Credential and setup guide
Read [the workflow-by-workflow credential guide](workflows/CREDENTIALS-GUIDE.md) for Google Sheets, Gmail, Telegram, Slack, Google Calendar, Meta/Instagram, YouTube, and LLM setup. Read [workflows README](workflows/README.md) for the catalog.

## Client-delivery checklist
- [ ] Import works in the client's n8n version with no missing nodes.
- [ ] Every “Configure/Connect” placeholder has been replaced with a real action node.
- [ ] Credentials are selected in n8n and use least privilege.
- [ ] Duplicate handling, privacy/consent, retries, and rate limits are addressed.
- [ ] Error notifications and human handoff are tested.
- [ ] Valid, invalid, and provider-failure test cases pass.
- [ ] Real end-to-end test result is recorded before calling it production-ready.
- [ ] No credentials, tokens, or real client data are committed.

## License
Released under the [MIT License](LICENSE). Third-party services are subject to their own terms.

## Author
**Muhammad Farhan**  
GitHub: [@Farhanillahiclass](https://github.com/Farhanillahiclass)  
LinkedIn: [Muhammad Farhan](https://www.linkedin.com/in/muhammadfarhanmrs/)  
YouTube: [FarhanMRSDeveloper](https://www.youtube.com/@FarhanMRSDeveloper)

*Build carefully. Test every node. Automate responsibly.*

## Individual implementation guides
Every workflow has a separate guide covering credentials, implementation steps, test cases and remaining production checks:

- [All 20 workflow guides](workflow-guides/README.md)
- [Testing and validation report](TESTING-AND-VALIDATION.md)
- [Google Sheets Apps Script gateway](apps-script/FlowForgeSheetGateway.gs)

### Google Sheets Apps Script starter
The script is a starter gateway for appending lead, support and feedback records to a Google Sheet. Follow its comments and the [Apps Script setup notes](workflow-guides/01-lead-capture-crm.md). Configure Script Properties and use test data first. Query-string tokens can leak into logs; for sensitive/production use, use a reviewed authenticated gateway. The script does not magically attach a Sheet to every workflow: connect the n8n HTTP Request or Google Sheets nodes explicitly in each workflow that needs it.

## Testing transparency
Repository-level files and documentation have been added, but no live execution against your n8n server or connected accounts was possible from GitHub alone. Refer to [TESTING-AND-VALIDATION.md](TESTING-AND-VALIDATION.md). Do not claim end-to-end production tests passed until you run them in n8n.
