# 19 — API Health Monitor

**Maintainer:** Muhammad Farhan  
**Event type:** `api.health.check`  
**Status:** Static-checked template; scheduled HTTP/Gmail execution not yet verified.

## Purpose

Run periodic GET requests against two sample public endpoints (GitHub API and Open-Meteo), evaluate the response/error outcome, and email operations when an endpoint is unhealthy.

## Workflow path

`Daily Schedule / parent entry → HTTP checks in parallel → normalize health results → unhealthy? → Gmail alert or healthy result`

## Configuration

Replace `REPLACE_WITH_OPS_ALERT_EMAIL` and select Gmail OAuth credentials. Update the endpoints to the APIs your organization actually depends on. The HTTP nodes have a 10-second timeout and continue on node errors so the evaluation/alert path can inspect failures.

## Tests to run

Test normal responses, HTTP error status, DNS/network failure, timeout, invalid endpoint, Gmail failure and multiple simultaneous unhealthy endpoints. Confirm the alert includes the target, status/error and check timestamp.

## Limits

The two endpoints are examples, not a monitoring plan for your real services. The current workflow does not store the previous state; it may alert on every schedule while an outage persists and does not generate a reliable recovery-only alert. Add durable state, severity/threshold policy and deduplication before using it for production operations.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
