# FlowForge-AI — Client-Oriented n8n Automation Portfolio

**Maintainer:** Muhammad Farhan  
**Goal:** Practical automation portfolio for business operations, leads, support, content, and integrations.

> **Status notice:** The rebuild is in progress on branch `rebuild/professional-portfolio`. Do not treat all planned systems as complete or production-ready yet. Every integration requires credentials, node configuration, and end-to-end tests in your own n8n instance.

## Current rebuild
- [01 — Lead Capture & CRM](workflows/01-lead-capture-crm.json): POST webhook, input validation, Google Sheets append node, sales email node, success/error response. Configure the spreadsheet ID, sheet tab, Google Sheets credential, Gmail credential, and sales recipient.
- [02 — Lead Scoring & Routing](workflows/02-lead-scoring-routing.json): webhook intake and configurable sample scoring rules.
- [03 — Email Follow-up Sequence](workflows/03-email-follow-up-sequence.json): scheduled starter; requires CRM/Sheets read, consent suppression, Gmail send, and send-history update nodes before production.
- [05 — Customer Support Desk](workflows/05-customer-support-desk.json): webhook ticket validation and priority/category classification; requires persistent ticket storage and customer/team notification nodes before production.

## Planned portfolio systems
Lead qualification; email follow-up; inbox triage; customer support; FAQ/human handoff; meeting booking and reminders; client onboarding; invoice reminders; content creation and approval; Instagram publishing; YouTube publishing; content repurposing; newsletter campaign; weekly reporting; feedback routing; error monitoring; API health checks; Telegram business assistant.

## Import and setup
1. Download a JSON file from this repository branch.
2. In n8n, choose **Import from File**.
3. Inspect nodes, parameters, connections, and compatibility with your n8n version.
4. Configure credentials inside n8n; never commit API keys, tokens, or customer records.
5. Replace placeholders and configure every documented action node.
6. Test valid/invalid input, duplicate events, provider failures, and notification failures.
7. Activate only after a successful end-to-end test.

## Credentials
- **Google Sheets:** authorize an account with access to the target sheet; map column headers and verify appended rows.
- **Gmail:** authorize in n8n and test only with an address you control.
- **Telegram/Slack:** store bot/app credentials in n8n and test in a private channel.
- **Google Calendar:** configure OAuth, timezone, availability checks, and conflict handling.
- **Instagram/Meta and YouTube:** use official APIs, eligible accounts, approved permissions, and actual publish/upload nodes. Validation alone does not publish.
- **LLM provider:** configure the official n8n credential and require human approval for public content.

## Security and release checklist
- [ ] Secrets stored only in n8n Credentials.
- [ ] Webhooks protected and inputs validated.
- [ ] Duplicate/idempotency protection added where needed.
- [ ] Retry/error paths and alerts tested.
- [ ] Human approval for public publishing and consequential decisions.
- [ ] Live end-to-end test passed in target n8n version.

## License
MIT License. Third-party services remain subject to their own terms.

## Author
**Muhammad Farhan**  
GitHub: https://github.com/Farhanillahiclass  
LinkedIn: https://www.linkedin.com/in/muhammadfarhanmrs/  
YouTube: https://www.youtube.com/@FarhanMRSDeveloper
