# Testing & Validation Report — FlowForge-AI

## Scope and status

This repository contains 20 business-workflow templates and a modular system example. Static repository checks and live provider tests are different things.

- Each business workflow's canonical export is `workflows/<slug>/workflow.json`.
- The system layer contains main ingress, a dispatcher, three child-workflow examples, and a central error handler.
- **Live n8n import/execution and provider integrations have not been run from this repository environment.** Child workflow IDs and credentials still need to be selected in your n8n account.
- The system dispatcher currently routes three event types only. The other 17 business workflows remain standalone templates and are not yet connected to the central dispatcher.

## Run static validation locally

```bash
python scripts/validate_workflows.py
```

The validator checks canonical folder layout, required per-workflow files, JSON syntax, duplicate node names/IDs, and connection target references across business and system workflow exports. It warns about obvious placeholders and No Operation nodes.

A static pass does not prove installed node-schema compatibility, credential access, Apps Script deployment, or successful provider API actions.

## Core system import order

1. Import `system/10-lead-capture-subflow.json`, `system/11-lead-scoring-subflow.json`, and `system/12-support-ticket-subflow.json`.
2. Import `system/01-request-processor.json`; choose each imported child in its Execute Sub-workflow node.
3. Import `system/00-main-ingress.json`; choose the request processor and configure Header Auth on the Webhook node.
4. Import `system/90-central-error-handler.json`; configure the ops-log Sheet and alert recipient, then assign it under **Workflow Settings → Error Workflow** for relevant workflows.
5. Configure every sheet ID/tab, recipient, and provider credential inside n8n. Keep all workflows inactive until test cases pass.

## Core system test cases

| Test | Input/condition | Expected behavior |
|---|---|---|
| Valid lead | `eventType=lead.created`, stable requestId, valid name/email | lead row is recorded and sales notification is attempted |
| Invalid lead | missing name or invalid email | rejected result; no external write |
| Replay lead | repeat the same requestId | duplicate result; external side effects skipped; reconcile if prior status remains processing |
| Score request | `eventType=lead.score_requested`, valid lead data | score/tier returned, score logged, hot-lead notification attempted |
| Valid support ticket | `eventType=support.ticket.created`, subject and description | ticket row recorded and support notification attempted |
| Replay ticket | repeat the same requestId | duplicate result; no new ticket notification |
| Unsupported event | unknown eventType | structured unsupported-event result |
| Invalid envelope | missing requestId/eventType or non-object data | validation failure response |
| Provider failure | controlled test credential/permission failure | execution is visibly failed; central error handler logs/alerts if correctly assigned |

The sheet-based replay check is a small-volume starter, not a strict exactly-once guarantee. Concurrent requests can race; an uncertain provider outcome can leave a `processing` record that requires reconciliation. Use a database with unique constraints and a reviewed retry/dead-letter design for high-volume or critical workloads.

## Test evidence for all 20 business workflows

Import every canonical `workflow.json` into a disposable/test n8n project. Replace placeholder nodes, configure credentials, test valid/invalid/duplicate/provider-failure paths, and confirm destination-side effects before activation.

- [ ] 01 Lead Capture & CRM
- [ ] 02 Lead Scoring & Routing
- [ ] 03 Email Follow-up Sequence
- [ ] 04 Inbox Triage Assistant
- [ ] 05 Customer Support Desk
- [ ] 06 FAQ & Human Handoff
- [ ] 07 Meeting Booking System
- [ ] 08 Meeting Reminders
- [ ] 09 Client Onboarding
- [ ] 10 Invoice & Payment Reminders
- [ ] 11 Content Creation & Approval
- [ ] 12 Instagram Publishing Pipeline
- [ ] 13 YouTube Publishing Assistant
- [ ] 14 Content Repurposing
- [ ] 15 Newsletter Campaign Builder
- [ ] 16 Weekly Business Reporting
- [ ] 17 Feedback & Escalation
- [ ] 18 Workflow Error Monitor
- [ ] 19 API Health Monitor
- [ ] 20 Telegram Business Assistant

Record n8n version, workflow name, test date, execution ID, expected/actual result, and pass/fail. Never include tokens or private customer data.
