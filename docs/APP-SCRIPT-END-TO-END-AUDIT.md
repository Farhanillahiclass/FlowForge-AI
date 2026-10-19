# Apps Script and End-to-End Workflow Audit

**Scope:** all 20 canonical workflows in `workflows/<slug>/`, including each `Code.gs`, `workflow.json`, and `README.md`.

**Audit type:** source-level review of the repository. This is not a live execution report. Apps Script services, OAuth scopes, n8n credentials, provider APIs, and destination-side effects must be tested in their real environments.

## Main finding

The 20 `Code.gs` files share essentially the same generic web-app adapter pattern: check a shared token, parse `requestId` and `data`, acquire a script lock, append selected fields to a workflow-specific Google Sheet, and return JSON. That pattern can be useful as an intake/audit endpoint, but by itself it does **not** implement the business behavior implied by each workflow's name.

Examples:
- Lead scoring needs an explicit scoring/routing contract, not only stringifying fields into a row.
- Follow-up and invoice reminders need due-time eligibility, sent-state tracking, and duplicate-send prevention; accepting a row is not sending a reminder.
- Meeting booking needs validated date/time values and a conflict/availability strategy; writing a booking request is not confirming a calendar slot.
- Instagram/YouTube publishing needs provider-side upload/publish steps and final status verification; storing a queue item is not publishing.
- Error monitoring needs a defined event schema and reliable alert/acknowledgement behavior; storing an error record is not an alert.
- Telegram assistant needs Telegram update parsing, command/intent handling, and a response path; storing an event is not responding to the user.

These are capability gaps to resolve against each workflow's stated requirements, not proof that every file has a JavaScript syntax error.

## Cross-cutting checks for every Apps Script endpoint

- [ ] Validate the request envelope, payload size, required fields, field types, and allowed values.
- [ ] Keep credentials in Script Properties; never commit real tokens, spreadsheet IDs, or provider secrets.
- [ ] Use a stable idempotency key and ensure duplicate requests do not repeat external side effects.
- [ ] Use `LockService` only around the critical section and return consistent HTTP-compatible JSON responses.
- [ ] Avoid spreadsheet formula injection for untrusted strings.
- [ ] Validate existing sheet headers, not just whether the first row is empty.
- [ ] Separate intake/logging from irreversible actions (email, calendar changes, invoice messages, public publishing).
- [ ] Log action status, provider response identifiers, timestamps, and sanitized errors.
- [ ] Add safe dry-run/test mode for external actions and require explicit approval for public or customer-facing actions.
- [ ] Document deployment settings, Script Properties, scopes, request/response examples, and rollback steps.

## Workflow acceptance matrix

| # | Workflow | Required end-to-end acceptance evidence |
|---:|---|---|
| 01 | Lead Capture & CRM | Valid lead creates one row; invalid input rejected; repeated request ID creates no duplicate; formula-like input is stored safely. |
| 02 | Lead Scoring & Routing | Same input yields deterministic score/tier/route; boundaries tested; invalid or missing scoring fields rejected; route is auditable. |
| 03 | Email Follow-up Sequence | Due follow-up is selected; not-yet-due and opted-out contacts are skipped; send result is recorded; retry does not double-send. |
| 04 | Inbox Triage Assistant | Message schema validated; category/priority has a defined source/rule; uncertain cases are flagged for review; message IDs deduplicated. |
| 05 | Customer Support Desk | Ticket gets stable ID, validated priority/category, status transition and audit entry; repeated intake is idempotent. |
| 06 | FAQ & Human Handoff | FAQ match includes a documented confidence rule; low-confidence queries create a handoff; handoff state can be tracked. |
| 07 | Meeting Booking System | Start/end/time zone validated; end is after start; conflict check runs before confirmation; calendar outcome is recorded. |
| 08 | Meeting Reminders | Only eligible upcoming meetings are selected; reminder windows and time zones are tested; sent marker prevents repeat reminders. |
| 09 | Client Onboarding | Required onboarding fields validated; steps have explicit statuses; retries resume safely; completion is auditable. |
| 10 | Invoice & Payment Reminders | Only unpaid/eligible invoices are selected; amount/currency/due date validated; paid invoices are excluded; send result and retry state recorded. |
| 11 | Content Creation & Approval | Draft, reviewer, decision and timestamp persist; approval/rejection changes state; publishing cannot occur before approval. |
| 12 | Instagram Publishing Pipeline | Approval and media requirements validated; provider publishing result/ID and final status are checked; retries are safe. |
| 13 | YouTube Publishing Assistant | Upload inputs validated; upload ID and processing status tracked; publication state is verified before reporting success. |
| 14 | Content Repurposing | Source content and requested formats validated; generated variants are stored with source linkage; human review is supported. |
| 15 | Newsletter Campaign Builder | Consent/suppression rules are enforced; audience and content preview available; send requires explicit approval; delivery outcomes recorded. |
| 16 | Weekly Business Reporting | Source ranges and metrics are defined; empty/malformed data handled; report totals reconcile to source data; generated report is traceable. |
| 17 | Feedback & Escalation | Feedback normalized; escalation rules deterministic; urgent items notify the right destination; acknowledgement/status tracked. |
| 18 | Workflow Error Monitor | n8n error event schema mapped; duplicate errors controlled; alert delivery and acknowledgement recorded; failure of alerting is visible. |
| 19 | API Health Monitor | Timeout/status/error cases tested; thresholds and consecutive-failure policy defined; recovery is detected; alert spam is suppressed. |
| 20 | Telegram Business Assistant | Telegram update schema and allowed commands validated; unknown commands handled safely; reply delivery verified; duplicate update IDs ignored. |

## Validation plan

1. Run the repository's existing static validator and capture the exact result.
2. Add syntax/structure checks for all 20 Apps Script files and contract checks for each workflow's required fields.
3. Run deterministic unit tests with mocked Apps Script services where practical.
4. Import each n8n export into a non-production n8n Cloud project, configure credentials, and execute the workflow-specific acceptance cases.
5. Record n8n execution IDs and external destination evidence before marking a workflow end-to-end verified.

## Safety and release rule

Keep all workflows inactive during repair. Use test spreadsheets, test inboxes, test calendars, and provider sandbox accounts where available. Do not send customer-facing messages, issue invoices, publish content, or modify production records until the relevant acceptance tests pass.

## Current status

- Repository structure confirms 20 canonical workflow folders and one `Code.gs` in each.
- The shared Apps Script adapter pattern is present in the sampled files; the per-workflow business contract needs to be made explicit and implemented.
- Live Apps Script and n8n execution has not been performed by this source audit.
