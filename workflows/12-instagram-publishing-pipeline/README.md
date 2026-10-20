# 12 — Instagram Publishing Pipeline

**Maintainer:** Muhammad Farhan  
**Event:** `instagram.publish.requested`  
**Status:** Apps Script request registry hardened; Meta Graph API runtime is not verified.

## What this workflow does

Accepts an authenticated n8n webhook request and validates a caption and HTTPS media URL. **Publishing is fail-closed:** the workflow deliberately ignores caller-supplied `approved: true` and returns pending approval until a trusted, persisted reviewer-approval lookup is connected. Do not enable publishing until that approval integration, container status polling, durable idempotency and live account testing are complete.

## Node paths

- Webhook path: `Receive Instagram Draft → Validate Caption and Public Media URL → Draft Valid?`
- Invalid: `Draft Valid? (false) → Return Invalid Draft`
- Valid request: `Draft Valid? (true) → Explicitly Approved? (false) → Return Awaiting Approval`
- The approval gate intentionally fails closed; the Meta container/publish nodes remain unreachable until trusted reviewer approval is implemented.
- Parent path: `Called by Parent Workflow → Normalize Parent Payload → Validate Caption and Public Media URL`

## Configure integrations

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth for the webhook. Do not use a caller-controlled `approved: true` flag as proof of human approval; restrict webhook callers or connect a persisted approval registry.
3. Configure an HTTP Header Auth credential for Meta using a protected access token; never paste tokens into the JSON.
4. Replace `REPLACE_WITH_GRAPH_API_VERSION` and `REPLACE_WITH_IG_USER_ID` in both HTTP Request URLs.
5. Use an Instagram professional account connected to an eligible Facebook Page and grant the required publishing permissions.
6. Supply a public HTTPS image URL accessible to Meta. Validate media format and size against the current Meta API requirements.
7. Keep the workflow inactive until tests pass.

## Apps Script queue registry

Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`; run `setupSheet()`. The script creates/validates the `InstagramQueue` tab with columns `createdAt, requestId, contentId, caption, mediaUrl, approvalStatus, publishStatus, publishedAt, error`. Deploy only after reviewing Web App access settings.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "ig-test-001",
  "data": {
    "contentId": "post-001",
    "caption": "Test caption",
    "mediaUrl": "https://example.com/public-test-image.jpg",
    "approvalStatus": "pending",
    "publishStatus": "queued"
  }
}
```

The endpoint validates fields, authenticates with a shared secret, checks exact headers and rejects duplicate request IDs under a lock. It only queues/logs a record; it does not call Meta or publish content. This queue is separate from n8n unless an HTTP Request node is explicitly connected.

## Acceptance tests

1. Missing request ID, blank/oversized caption, non-HTTPS media URL, invalid approval state, wrong token and malformed JSON are rejected.
2. Repeating the same request ID does not append a second queue row.
3. Wrong sheet headers and missing Script Properties return configuration errors.
4. Any request, including one containing `approved: true`, returns pending approval and does not call Meta until trusted approval lookup is implemented.
5. Simulate Meta authentication failure, invalid media, container creation failure and publication failure.
6. Check container status before publishing; a fixed 10-second wait is not reliable for every media-processing duration.
7. Reconcile ambiguous publish timeouts before retrying, because blindly retrying may publish duplicates.
8. Confirm the post exists on the intended test account before marking it published.

## Known limitations

- The n8n approval gate is fail-closed; a persisted reviewer-approval integration is not yet connected.
- Fixed wait does not poll `status_code` for the media container.
- No durable publishing ledger or reconciliation path is connected to the n8n workflow.
- The Apps Script registry and n8n workflow are independent until explicitly connected.
- Live Meta, Sheets and n8n execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
