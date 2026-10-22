# FlowForge-AI — Workflow Audit Matrix

This matrix tracks evidence-based readiness for the 20 canonical workflow exports. A repository file being present does not mean the workflow has passed live integration testing.

## Status definitions

- **Files present** — expected `README.md`, `workflow.json`, and `Code.gs` exist in the canonical workflow folder.
- **Static validation** — repository validators pass for the current commit.
- **Integration tested** — the workflow was imported and executed in a documented n8n test workspace using test credentials and synthetic data.
- **Production ready** — integration tests, security review, retry/duplicate handling, and destination-side verification have all passed for the target environment.
- **Not yet verified** — evidence has not been recorded in this matrix; do not infer success.

## Audit matrix

| # | Workflow | Files present | Static validation | Integration tested | Main verification focus |
|---:|---|---|---|---|---|
| 01 | Lead Capture & CRM | Present in repository tree | Run current CI | Not yet verified | Duplicate lead handling, field mapping, consent and destination write |
| 02 | Lead Scoring & Routing | Present in repository tree | Run current CI | Not yet verified | Score boundaries, missing fields, deterministic routing |
| 03 | Email Follow-up Sequence | Present in repository tree | Run current CI | Not yet verified | Consent/suppression, duplicate sends, retry reconciliation |
| 04 | Inbox Triage Assistant | Present in repository tree | Run current CI | Not yet verified | Classification fallback, sensitive data, human escalation |
| 05 | Customer Support Desk | Present in repository tree | Run current CI | Not yet verified | Ticket creation, duplicate events, escalation and status mapping |
| 06 | FAQ & Human Handoff | Present in repository tree | Run current CI | Not yet verified | Unsupported questions, safe fallback, handoff delivery |
| 07 | Meeting Booking System | Present in repository tree | Run current CI | Not yet verified | Availability checks, time zones, concurrent booking conflicts |
| 08 | Meeting Reminders | Present in repository tree | Run current CI | Not yet verified | Time-zone correctness, duplicate reminders, delivery logging |
| 09 | Client Onboarding | Present in repository tree | Run current CI | Not yet verified | Idempotent setup, partial failure recovery, access permissions |
| 10 | Invoice & Payment Reminders | Present in repository tree | Run current CI | Not yet verified | Correct amounts/due dates, suppression after payment, duplicate sends |
| 11 | Content Creation & Approval | Present in repository tree | Run current CI | Not yet verified | Persistent approval state, unauthorized publication prevention |
| 12 | Instagram Publishing Pipeline | Present in repository tree | Run current CI | Not yet verified | Account permissions, media requirements, destination status verification |
| 13 | YouTube Publishing Assistant | Present in repository tree | Run current CI | Not yet verified | Upload processing state, privacy defaults, retries and duplicates |
| 14 | Content Repurposing | Present in repository tree | Run current CI | Not yet verified | Output format, attribution, platform-specific constraints |
| 15 | Newsletter Campaign Builder | Present in repository tree | Run current CI | Not yet verified | Consent, unsubscribe suppression, recipient validation |
| 16 | Weekly Business Reporting | Present in repository tree | Run current CI | Not yet verified | Date windows, aggregation accuracy, empty-data behavior |
| 17 | Feedback & Escalation | Present in repository tree | Run current CI | Not yet verified | Sentiment/routing fallback, escalation delivery, duplicate feedback |
| 18 | Workflow Error Monitor | Present in repository tree | Run current CI | Not yet verified | Error event delivery, useful diagnostics, alert-loop prevention |
| 19 | API Health Monitor | Present in repository tree | Run current CI | Not yet verified | Timeout thresholds, retry limits, false positives and alert recovery |
| 20 | Telegram Business Assistant | Present in repository tree | Run current CI | Not yet verified | Trusted trigger/authentication, command validation, user access controls |

## Evidence to record per workflow

For every test, record:

1. Workflow folder and commit SHA.
2. n8n version and required community nodes.
3. Test date and test-environment identifier (no secrets).
4. Positive-path result and output verification.
5. Invalid/missing-input result.
6. Retry and duplicate-event result, where relevant.
7. External service failure result and recovery behavior.
8. Screenshot or redacted execution reference, without tokens or customer data.
9. Known limitations and the person responsible for the next action.

## Release gate

Do not label a workflow `verified` or `production ready` until its required evidence is recorded. A successful GitHub Actions run establishes only that the configured static checks passed; it is not proof of live n8n behavior.
