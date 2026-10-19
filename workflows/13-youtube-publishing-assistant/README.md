# 13 — YouTube Publishing Assistant

**Maintainer:** Muhammad Farhan  
**Event:** `youtube.upload.requested`  
**Status:** Queue adapter hardened; YouTube upload and processing-status verification are not live-tested.

## Purpose and paths

Validate title/description/video URL, require an approval gate, download video binary, upload with n8n's native YouTube node, and return the upload response.

- Webhook: `Submit YouTube Metadata → Validate Metadata and Default Private → Metadata Valid?`
- Invalid metadata: `Metadata Valid? (false) → Return Invalid Metadata`
- Approved: `Metadata Valid? (true) → Explicitly Approved? (true) → Download Video File → Upload Video to YouTube → Return YouTube Upload Result`
- Pending: `Explicitly Approved? (false) → Return Awaiting Approval`
- Parent: `Called by Parent Workflow → Normalize Parent Payload → Validate Metadata and Default Private`

## Configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth for the webhook and YouTube OAuth credentials for the intended channel.
3. Set a supported video URL that n8n can download without an interactive login. Large files may exceed memory, execution-time or provider limits.
4. Confirm title, description, tags, category ID and region code match the channel's requirements. Current node defaults to category `22` and region `US`.
5. Keep uploads private while testing. Public/unlisted visibility must be restricted to trusted callers and verified human approval.
6. Test the native YouTube node schema against the deployed n8n version before activation.

## Apps Script queue adapter

Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`; run `setupSheet()` to create/validate `YouTubeQueue` with columns `createdAt, requestId, videoId, title, description, privacyStatus, approvalStatus, uploadStatus, publishedUrl`. Deploy only after reviewing Web App access settings; never commit the token.

Example:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "yt-test-001",
  "data": {
    "title": "Private test upload",
    "description": "Testing the upload request registry.",
    "privacyStatus": "private",
    "approvalStatus": "pending",
    "uploadStatus": "queued"
  }
}
```

The endpoint validates request ID, title length, description length, visibility and status, prevents duplicate request IDs under a script lock, checks sheet headers and blocks unapproved public/unlisted requests. It records a queue row only; it does not upload a video. The queue is separate from n8n unless explicitly connected.

## Acceptance tests

1. Missing request ID/title, overlong title/description, invalid visibility/status and malformed JSON are rejected.
2. Wrong token, missing Script Properties and mismatched headers fail clearly.
3. Duplicate request ID does not append a second row.
4. Unapproved public/unlisted request is rejected; private pending request can be queued.
5. Download failure, OAuth failure, upload failure and timeout are tested with non-sensitive test media.
6. Verify the returned video ID in YouTube Studio and separately check processing status and final visibility.
7. Reconcile ambiguous timeout outcomes before retrying; the current n8n workflow does not have a durable upload idempotency key or processing poller.

## Known limitations

- Caller-supplied `approved: true` is not proof of a reviewer identity or persisted approval.
- Native node success does not prove YouTube finished processing.
- Apps Script queue and n8n upload flow are separate unless connected.
- Live YouTube and Google Sheets execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
