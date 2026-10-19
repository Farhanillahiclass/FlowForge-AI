# FlowForge-AI: Parent Nodes, Integrations, and Per-Workflow Implementation Guide

**Repository:** FlowForge-AI  
**Scope:** 20 independent n8n workflows, each with its own `workflow.json`, `Code.gs`, and `README.md`.

This is the implementation contract for making each workflow usable by a beginner. It is a design and setup guide, not proof that provider integrations have been executed live. Keep workflows inactive until their own acceptance tests pass.

## 1. Shared parent / orchestration layer

### Main ingress workflow
Recommended node path:
1. **Webhook — Receive FlowForge Event**: POST only; Header Auth; accept the common event envelope.
2. **Code — Validate Envelope**: require `requestId`, `eventType`, `source`, object `data`; reject malformed input and oversized payloads.
3. **Code — Normalize Event**: trim values, standardize timestamps, preserve the original request ID.
4. **Switch — Route Event Type**: route by exact `eventType`; do not route from free-form text.
5. **Execute Workflow — Call Child**: one child per event type, pass the same common envelope.
6. **Respond to Webhook — Return Result**: return the child status and request ID; do not report success before the child action succeeds.
7. **Error path**: record workflow/execution/request IDs and sanitized error, then alert the operator without exposing credentials or private payloads.

### Request processor / parent node requirements
- Each of the 20 child workflows must have a **Called by Parent Workflow** (`Execute Workflow Trigger`) node and a **Normalize Parent Payload** adapter.
- Each child must also have a standalone trigger if the use case needs it (webhook, schedule, app trigger, or manual test). Do not assume a child can use a webhook's response path when invoked as a subworkflow.
- Parent event mappings must match the child's documented event type exactly.
- Parent and child must pass a stable `requestId`, a typed `data` object, and an explicit outcome.
- A child should return `ok`, `status`, `requestId`, `result` (where applicable), and a safe error code.
- Keep all exports inactive until credentials, placeholder values, and tests are complete.

### Common reusable node pattern for every child
**Trigger / Parent Trigger → Normalize Input → Validate Required Fields → Idempotency / Duplicate Check → Business Rules → Human Approval (if needed) → Provider Action → Verify Provider Result → Persist Status / Audit → Success Response**

Failure route: **Catch/Continue-on-error branch → Classify Error → Retry only transient failures → Log → Notify Owner → Return Failed/Needs Review**. Never automatically retry a non-idempotent public action without a duplicate-safety strategy.

## 2. Integration setup principles

1. Import each `workflow.json` into n8n Cloud.
2. Create the exact provider credential in n8n Credentials (OAuth/API credential as appropriate); select it in every relevant node. Never put secrets in JSON, Apps Script source, README, or Git.
3. Replace every `REPLACE_...` placeholder using the node UI and validate the target sheet/table/calendar/channel/account.
4. Create a separate test spreadsheet and test inbox/calendar/channel. Verify permissions with a least-privilege account.
5. Deploy the matching `Code.gs` only if that endpoint is actually part of the architecture. Add `SPREADSHEET_ID` and a high-entropy `FLOWFORGE_TOKEN` to Apps Script Script Properties; never reuse a production token in tests.
6. Use a stable request ID across retries. Store provider IDs and status transitions, not just “sent-attempted”.
7. Run each acceptance test in its own workflow, inspect n8n execution output, and verify the actual provider-side result.
8. Enable production triggers only after a human reviews the test evidence.

## 3. Per-workflow implementation and user guide

Each workflow below is separate. Node names are a recommended implementation sequence; adapt only where the provider's n8n node version requires it.

### 01 — Lead Capture & CRM
**Event:** `lead.created`  
**Node path:** Webhook / Parent Trigger → Normalize name/email/company/source → Validate name + email + requestId → Lookup CRM/Leads by requestId and normalized email → IF duplicate → return duplicate without side effects; otherwise → Create CRM record or append Google Sheets row → Send Gmail/Slack sales notification → Persist CRM ID + notification status → Return accepted result.  
**Integrations:** Webhook, Google Sheets or one chosen CRM, Gmail/Slack optional.  
**User setup:** choose one source of truth (CRM or Sheet); configure OAuth; map the columns/fields; set sales recipient; test invalid email and duplicate email.  
**Acceptance:** one valid lead creates one record; duplicate does not create a second record; notification failure is visible and retryable without duplicating the lead.

### 02 — Lead Scoring & Routing
**Event:** `lead.score_requested`  
**Node path:** Trigger → Validate lead fields → Load scoring rules/weights → Code calculates deterministic score → IF/Switch by tier → assign owner/queue → update CRM/Sheet → notify the correct team → log score, rule version, route and timestamp.  
**Integrations:** CRM or Sheets; Gmail/Slack/CRM assignment.  
**User setup:** define explicit score weights and thresholds in a rules table; do not imply an AI model exists unless configured.  
**Acceptance:** score boundaries and missing-field behavior tested; same input and rule version produce the same result.

### 03 — Email Follow-up Sequence
**Event:** `email.followup.dispatch`  
**Node path:** Schedule Trigger → Fetch due follow-ups → Check consent/unsubscribe and contact status → check sent/idempotency key → build approved template → send via Gmail/SMTP/provider → persist provider message ID, sent time and next step → log failure/retry status.  
**Integrations:** Google Sheets/CRM, Gmail or approved email provider.  
**User setup:** configure timezone, cadence, templates, opt-out source and sender; use a test mailbox first.  
**Acceptance:** future-due, unsubscribed and already-sent contacts are skipped; a failed send is not recorded as sent.

### 04 — Inbox Triage Assistant
**Event:** `inbox.message.received`  
**Node path:** Gmail/Outlook Trigger or Webhook → normalize sender/subject/body/message ID → deduplicate by provider message ID → rules or configured LLM classification → validate category/priority/confidence → low-confidence IF to human review → create/update ticket → notify owner → persist classification and audit.  
**Integrations:** Gmail/Outlook, ticket system or Sheets, optional LLM node.  
**User setup:** define categories, priority rules, allowed model credential, privacy restrictions and human-review destination.  
**Acceptance:** uncertain messages go to review; repeated provider events do not create duplicate tickets.

### 05 — Customer Support Desk
**Event:** `support.ticket.created`  
**Node path:** Webhook/Form → validate contact + message → assign stable ticket ID → classify category/priority using rules or configured AI → route urgent tickets to on-call queue → create ticket in chosen helpdesk/Sheet → acknowledge customer only after ticket creation → audit status.  
**Integrations:** Helpdesk (one selected), Gmail, Sheets optional.  
**User setup:** choose the system of record, priority matrix, support hours and escalation contacts.  
**Acceptance:** ticket ID is stable; urgent route works; failure to create a ticket never returns false success.

### 06 — FAQ & Human Handoff
**Event:** `support.faq.question`  
**Node path:** Trigger → normalize question → search approved FAQ/knowledge base → compute/use actual retrieval confidence → IF confidence above configured threshold → return sourced answer; otherwise → create human handoff/ticket → notify queue → persist question, answer source, confidence and handoff status.  
**Integrations:** FAQ source/knowledge base, helpdesk, messaging channel.  
**User setup:** load maintained FAQ content, choose threshold and handoff destination. If no retrieval/LLM node is configured, use explicit keyword rules and label them as such.  
**Acceptance:** answer source is traceable; low-confidence questions reliably reach a person.

### 07 — Meeting Booking System
**Event:** `meeting.booking.requested`  
**Node path:** Webhook/Parent Trigger → validate email, future start/end and timezone → query Google Calendar free/busy → IF slot available → create event → verify returned event ID → send confirmation → store booking/event ID; otherwise offer alternatives or send for manual review.  
**Integrations:** Google Calendar, Gmail, booking form/webhook, optional Sheets.  
**User setup:** configure calendar OAuth and calendar ID; set working hours, meeting duration, timezone, buffer and conflict policy.  
**Acceptance:** overlapping event is not confirmed; invalid date is rejected; confirmation includes the real event ID/time.

### 08 — Meeting Reminders
**Event:** `meeting.reminder.dispatch`  
**Node path:** Schedule Trigger → fetch upcoming events in a bounded time window → normalize timezone → exclude cancelled events → check reminder idempotency key (event ID + reminder window) → send reminder → store send status/message ID → log failures.  
**Integrations:** Google Calendar, Gmail/SMS provider, persistent log.  
**User setup:** select reminder windows (e.g. 24 hours / 1 hour), recipients and timezone.  
**Acceptance:** correct window only; rerun does not send the same reminder twice.

### 09 — Client Onboarding
**Event:** `client.onboarding.start`  
**Node path:** Trigger → validate client identity and consent → create/find client record → create onboarding checklist/tasks → send approved welcome email → assign internal owner → wait/track required steps via persistent statuses → escalate overdue tasks → mark complete only when required steps are complete.  
**Integrations:** CRM, task/project manager, Gmail, Sheets optional.  
**User setup:** define checklist, owners, due dates and consent requirements.  
**Acceptance:** rerunning resumes the existing onboarding; it does not create duplicate clients/tasks.

### 10 — Invoice & Payment Reminders
**Event:** `invoice.reminder.dispatch`  
**Node path:** Schedule Trigger → fetch invoices from accounting source → confirm outstanding balance/status → filter due/overdue and not disputed → consent/contact checks → deduplicate by invoice ID + reminder stage → send approved message → persist provider result and next stage → escalate failed/long-overdue items for review.  
**Integrations:** actual accounting system (preferred), Gmail/email provider, persistent audit store.  
**User setup:** connect read-only accounting scope where possible; define due dates, currency, stages, exclusions and message templates. Do not use a manually entered Sheet as proof of current paid/unpaid status unless it is authoritative and maintained.  
**Acceptance:** paid invoices never receive reminders; amount/currency match source; retries do not double-send.

### 11 — Content Creation & Approval
**Event:** `content.draft.requested`  
**Node path:** Form/Webhook → validate brief/channel/owner → create draft using approved template or configured AI → save draft/version → request reviewer approval → wait for authenticated approval/rejection callback → IF approved → hand off to publishing workflow; rejected → save feedback and return to draft → audit all decisions.  
**Integrations:** LLM if configured, Docs/Sheets/content store, email/chat approval channel, publishing workflow.  
**User setup:** choose channels, brand rules, reviewers and an authenticated callback or approval tool; an email notification alone is not a durable approval state.  
**Acceptance:** no publish before recorded approval; rejection returns to editing; approval identity/time stored.

### 12 — Instagram Publishing Pipeline
**Event:** `instagram.publish.requested`  
**Node path:** Trigger → validate approval, caption and publicly accessible media URL → verify media type/constraints → create Instagram media container through supported Meta API → poll container status → publish only after ready → verify publish response/permalink → store media/publish IDs and status → alert on failure.  
**Integrations:** Meta/Instagram Graph API, content approval store, optional notification channel.  
**User setup:** eligible professional Instagram account, linked Facebook Page, Meta app permissions/token, account-specific media URL and required publishing permissions. Check current Meta API requirements before deployment.  
**Acceptance:** test media reaches published status and has a returned provider ID; failed container is not reported as published.

### 13 — YouTube Publishing Assistant
**Event:** `youtube.upload.requested`  
**Node path:** Trigger → validate video file/URL, title, description, visibility and approval → upload via YouTube API → store video ID → poll processing/status → verify visibility/status → send completion/failure notice → persist audit.  
**Integrations:** YouTube Data API/OAuth, file storage, approval store, Gmail optional.  
**User setup:** configure Google OAuth with YouTube upload scopes, test channel and privacy default (prefer private/unlisted for initial tests).  
**Acceptance:** upload ID exists, processing state is checked, and public success is not claimed while processing/failing.

### 14 — Content Repurposing
**Event:** `content.repurpose.requested`  
**Node path:** Trigger → validate source and requested formats → fetch source text/content with permission → generate platform-specific drafts with configured model or templates → validate length/format/brand rules → save each variant linked to source/version → human approval → pass approved variant to publisher.  
**Integrations:** source CMS/Docs, optional LLM, content store, approval workflow.  
**User setup:** define allowed source types, target channels, character limits, brand style and reviewer.  
**Acceptance:** all variants link back to source; no automatic public posting before approval.

### 15 — Newsletter Campaign Builder
**Event:** `newsletter.campaign.requested`  
**Node path:** Trigger → validate campaign and audience → query consented subscribers → apply suppression/unsubscribe filters → build preview → require approval → send via selected email marketing provider → process provider results/bounces where available → store campaign ID, counts and audit.  
**Integrations:** consent source/CRM, email marketing provider, approval channel.  
**User setup:** choose one provider and source of truth for consent; configure sender domain and unsubscribe mechanism.  
**Acceptance:** suppressed contacts excluded; preview and approval required; delivery stats come from provider, not estimates.

### 16 — Weekly Business Report
**Event:** `business.report.generate`  
**Node path:** Schedule Trigger → load defined reporting window → fetch source metrics → validate missing/duplicate data → aggregate with documented formulas → generate report/table/chart → send to authorized recipients → store report and source window → log totals and errors.  
**Integrations:** source CRM/Sheets/accounting, Docs/Sheets/email or chat.  
**User setup:** define timezone, week boundary, metric formulas, source owners and recipient access.  
**Acceptance:** totals reconcile with source queries; empty data is labelled, not fabricated.

### 17 — Feedback & Escalation
**Event:** `feedback.received`  
**Node path:** Form/Webhook/provider trigger → validate and normalize feedback → deduplicate by feedback ID → classify with deterministic rules or configured model → IF urgent/negative threshold → create escalation ticket and notify owner → persist score, route, acknowledgement and resolution status.  
**Integrations:** feedback form/review source, CRM/helpdesk, email/chat.  
**User setup:** define thresholds, SLA, owner mapping and privacy policy.  
**Acceptance:** urgent feedback reaches a configured owner; repeated events do not create duplicate escalations.

### 18 — Workflow Error Monitor
**Event:** `workflow.error.received`  
**Node path:** n8n Error Trigger → normalize workflow/execution/error metadata → redact tokens/PII → deduplicate repeated errors → append central log → classify severity → alert on-call destination → store alert delivery and acknowledgement → track recovery/closure.  
**Integrations:** n8n Error Trigger, central Sheet/database, Slack/Email/Telegram alert.  
**User setup:** configure the Error Workflow in n8n workflow settings and test with a deliberately failing test workflow.  
**Acceptance:** failed execution is logged and alert receipt is verified; error handler failures are independently visible.

### 19 — API Health Monitor
**Event:** `api.health.check`  
**Node path:** Schedule Trigger → call configured health endpoint with timeout → capture status/latency/body summary → evaluate threshold and consecutive failures → persist check result → alert only on state transition/cooldown → detect recovery → close incident.  
**Integrations:** HTTP Request, persistent store, Slack/Email/Telegram alert.  
**User setup:** configure safe health URLs, timeout, thresholds, interval, cooldown and expected status. Never include API secrets in logs.  
**Acceptance:** 2xx healthy, timeout/5xx unhealthy, consecutive-failure threshold and recovery alert all tested.

### 20 — Telegram Business Assistant
**Event:** `telegram.command.received`  
**Node path:** Telegram Trigger → validate update/chat/user and allowlist rules → deduplicate update ID → parse known command → Switch command → run only permitted business action → send Telegram reply → store request/action status. Unknown or unauthorized commands get a safe response; destructive actions require confirmation/approval.  
**Integrations:** Telegram Bot API, business data sources, optional Sheets/CRM, approval mechanism.  
**User setup:** create a bot with BotFather, store bot token only in n8n Credentials, configure allowed chats/users and command list.  
**Acceptance:** allowed command gets expected reply; unknown/unauthorized commands do nothing; duplicate update is ignored.

## 4. Role of each Code.gs

The workflow-specific Apps Script file is a separate Google Apps Script web-app adapter for recording/accepting requests in Google Sheets. It must not silently be treated as the workflow's entire business implementation.

For each one:
- Document whether n8n actually calls the Apps Script endpoint.
- If called, use authenticated HTTPS POST and a stable request ID.
- Validate a workflow-specific schema and required fields; generic “stringify any field” intake is insufficient as the only business validation.
- Return a clear accepted/duplicate/rejected/failed status.
- Store provider-side outcome IDs/status where relevant.
- Do not use the same public `doPost` endpoint as a substitute for native provider triggers when a native trigger is required.
- Configure Script Properties in the Apps Script project and keep the web app access policy as restrictive as the integration permits.

## 5. Test checklist per workflow

- [ ] Valid happy path.
- [ ] Missing required field / invalid type.
- [ ] Duplicate request ID and duplicate provider event.
- [ ] Provider permission/authentication failure.
- [ ] Provider timeout / rate limit / 5xx.
- [ ] Retry without duplicate side effect.
- [ ] Human approval/rejection path, if applicable.
- [ ] Audit record contains request ID, execution ID, result and timestamp without secrets.
- [ ] Actual destination confirms the expected side effect.
- [ ] README explains user setup and recovery.

## 6. Release status

The repository currently has the canonical structure of 20 workflow folders, each with `workflow.json`, `Code.gs`, and `README.md`. The above defines the target implementation and user setup per workflow. It must not be read as confirmation that every provider integration is already wired, every credential is configured, or all live acceptance tests have passed.
