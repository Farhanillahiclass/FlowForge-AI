# FlowForge-AI — Workflow Quality & Safe Operations Guide

This guide makes the 20 canonical workflow exports easier to configure, test, operate, and maintain. It complements each workflow's local README; it does not claim that integrations have been live-tested.

## Before importing

1. Use a recent n8n version compatible with the node versions in each export.
2. Download the canonical `workflow.json` from the relevant workflow folder. Do not import Apps Script `Code.gs` as an n8n workflow.
3. Keep imported workflows inactive until credentials, IDs, and test data are configured.
4. Read that workflow's README and the central [credentials guide](../workflows/CREDENTIALS-GUIDE.md).
5. Store secrets only in n8n credentials or your provider's secret manager. Never commit tokens, API keys, passwords, personal customer data, or credential exports.

## Repeatable setup checklist

- [ ] Replace every documented `REPLACE_WITH_...` value with a real provider resource ID in n8n.
- [ ] Create the exact spreadsheet tabs and column headers documented by the workflow.
- [ ] Select the intended credential on every provider node; verify least-privilege access.
- [ ] Configure timezone, locale, sender, recipient, callback URL, and provider-specific permissions.
- [ ] For webhook triggers, use the documented authentication and test URL first; do not expose unauthenticated production endpoints.
- [ ] For content publishing, email sequences, invoice reminders, and other external side effects, keep approval/consent gates enabled and test with a private test destination.
- [ ] Confirm retry behavior and deduplication before enabling recurring or webhook-triggered production runs.
- [ ] Set an error workflow where supported, and configure alert recipients and log retention.
- [ ] Run the workflow's acceptance tests with synthetic data, inspect every node output, and confirm the destination-side effect.
- [ ] Activate only after all checks pass and an operator knows how to disable or roll back it.

## Acceptance-test matrix

Run these checks for every workflow, adapting the fields to its documented contract.

| Test | Expected result |
|---|---|
| Valid minimal request | Structured success result and the expected record/action |
| Missing required field | Clear validation failure; no external side effect |
| Malformed email, date, URL, or identifier | Rejected or safely routed to review |
| Duplicate request ID/event | No duplicate record or repeated side effect where idempotency is required |
| Provider credential missing/expired | Visible actionable error; no false success response |
| Provider rate limit or transient failure | Bounded retry/backoff or a clear failed status |
| Downstream node fails | Error logged with correlation/request ID; alert routed when configured |
| Approval/consent missing | Publishing or outbound communication is blocked |
| Sensitive or uncertain support request | Human handoff rather than fabricated or unsafe answer |
| Re-run after a partial failure | Safe recovery without duplicate payment, message, booking, or post |

## Production-readiness criteria

A workflow should only be called production-ready after all relevant checks pass in the target n8n instance:

- JSON imports without unsupported-node warnings.
- Each node's parameters match the installed n8n and provider API versions.
- Credentials and permissions are verified with non-production data.
- Success, validation failure, duplicate event, timeout, rate limit, and provider failure paths are tested.
- Idempotency, retry policy, and external side effects are understood.
- Logs avoid secrets and unnecessary personal information.
- An operator can identify, pause, retry, and recover a failed execution.

## Architecture and shared dispatcher

For the parent-child system, import child workflows first, select the real child workflow in each Execute Sub-workflow node, then configure the dispatcher and ingress references. Replace workflow ID placeholders; do not assume the IDs in one n8n instance match another. Assign the central error handler in each intended workflow's settings. Verify the ingress Header Auth credential independently.

## Honest validation status

The repository's validator checks source structure and JSON consistency. A green static validation run is not evidence of successful n8n execution, provider authentication, or real destination-side effects. Record live test date, n8n version, test case, result, and any known limitations in the workflow's README before claiming production readiness.
