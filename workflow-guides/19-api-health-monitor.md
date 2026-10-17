# 19 — API Health Monitor

**Maintainer:** Muhammad Farhan  
**Workflow JSON:** [19-api-health-monitor.json](../workflows/19-api-health-monitor.json)

## Business goal
Schedule → HTTP checks/timeouts → normalize → compare state → failure/recovery alert.

## Credentials
HTTP endpoints, notification channel and optional state store.

1. Import the JSON into n8n and confirm all node types are available in your n8n version.
2. Create/select credentials under **n8n → Credentials**; never put secrets in JSON or GitHub.
3. Replace IDs, tabs, recipient addresses, timezones and client business rules.
4. Replace every **Configure/Connect/No Operation** placeholder with a real provider action. These are unfinished integration points, not working actions.
5. Keep inactive while testing with synthetic data and accounts you control.

## Implementation steps
1. Configure the actual event trigger or schedule.
2. Validate required fields and return clear errors for invalid input.
3. Apply client-approved business rules, SLA, consent and approval requirements.
4. Persist results and stable IDs in the CRM/helpdesk/Sheet.
5. Connect real external actions and confirm their output.
6. Add retries/error branches and sanitized alerts.
7. Add idempotency so retries do not duplicate tickets, meetings, reminders or posts.

## Test checklist
Test 2xx, 4xx/5xx, timeout and recovery; add error outputs and state tracking to prevent alert spam.

- [ ] Valid input produces expected result.
- [ ] Invalid/missing input is rejected safely.
- [ ] Duplicate event does not duplicate an action.
- [ ] Provider timeout/permission error is visible; no false success.
- [ ] Logs/alerts contain no secrets or unnecessary customer data.

## Status
This guide is not proof of a live end-to-end test. Import and run this workflow in your own n8n instance, record n8n version and execution results, and only then describe it as production-ready.
