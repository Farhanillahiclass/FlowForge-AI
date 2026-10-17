# FlowForge-AI A–Z Automation Architecture

## Design goal

Build reusable, observable n8n automations from a clear request entry point through validation, business logic, integrations, logging, and failure recovery. Separate transport and orchestration logic from business workflows so that each part can be reviewed and tested independently.

## Layers

### 1. Entry and protection
Use native Webhook, Schedule, or service-specific trigger nodes. Authenticate inbound webhook calls using n8n's supported authentication settings or an approved gateway. Validate content type, payload size, required fields, rate limits, and schema before processing. A workflow cannot execute before its trigger; pre-webhook network filtering belongs at the API gateway or perimeter.

### 2. Orchestration
Normalize an event envelope with `requestId`, `eventType`, `source`, `occurredAt`, and `data`. Use IF/Switch nodes for explicit routes. Use Execute Workflow only after importing the child and choosing the correct child workflow ID. Define whether child calls wait for completion or run asynchronously, and define a response contract.

### 3. Business sub-workflows
Each business automation owns its transformation and domain rules. Keep input/output contracts documented. A child should return structured results such as `{ ok, requestId, status, data, error }`, without leaking secrets or unneeded personal data.

### 4. Integrations and effects
Configure provider credentials in n8n Credentials, with least privilege. Keep placeholder IDs and recipients clearly identified. Use test accounts first. Consider provider rate limits, pagination, timeouts, transient errors, and external API idempotency. Do not put tokens into Code nodes or committed JSON.

### 5. Persistence and idempotency
Use a durable data store (database with unique key, n8n Data Table where available, or destination's documented idempotency mechanism) to track `requestId` and completed side effects. A JavaScript Set only lasts for one execution and is not sufficient for retries after a workflow restarts.

### 6. Reliability and observability
Use n8n Error Workflow(s), bounded retry/backoff for transient failures, explicit handling for permanent failures, structured execution logs, and alert destinations. Sanitize errors so tokens, message bodies, and sensitive customer data do not appear in alerts. Error handler notification itself needs failure protection and monitoring.

## Minimum acceptance criteria for a workflow

- Valid input accepted; malformed input rejected with a stable schema.
- Duplicate event tested within a batch and across separate executions.
- Destination writes checked in a test environment.
- Timeout after a write investigated before blindly replaying the operation.
- Retry only transient failures; cap retry attempts and use backoff.
- Failed writes have a defined path to error logging/dead-letter handling.
- Credentials are selected in the target n8n project, not embedded in the JSON.
- Workflow stays inactive until test evidence is reviewed.

## Reality check

Repository/static tests can check JSON parsing and graph references. Only a compatible n8n runtime can confirm import and node behavior. Provider effects require credentials and synthetic test accounts. This repository has no access to those accounts during static review; consequently, don't label the system production-ready before importing and testing every path.
