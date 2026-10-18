# 18 — Workflow Error Monitor

**Maintainer:** Muhammad Farhan  
**Event type:** `workflow.error.received`  
**Status:** Static-checked template; Gmail alert execution not yet verified.

## Purpose

Receive n8n error context from an Error Trigger or parent event, sanitize key execution details, and send a notification to the operations inbox.

## Workflow path

`Error Trigger / parent entry → sanitize workflow/execution/error fields → Gmail operator alert`

## Configuration

Select Gmail OAuth and replace `REPLACE_WITH_OPS_ALERT_EMAIL`. Import the workflow and assign it under **Workflow Settings → Error Workflow** for workflows whose failures should trigger alerts. The central system workflow `system/90-central-error-handler.json` can also be used for shared monitoring.

## Tests to run

Cause a controlled failure in a disposable test workflow, verify this workflow was invoked by the n8n Error Workflow setting, and confirm the email contains workflow name, execution ID/URL, last node, sanitized error and timestamp. Test a missing/large error message and Gmail failure.

## Limits

This workflow sends email alerts but does not currently persist an error row itself. Alert failure inside the handler can hide additional failures unless the handler has its own independent monitoring. Do not include credentials or full customer payloads in error notifications.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
