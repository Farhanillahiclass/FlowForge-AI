# 13 — YouTube Publishing Assistant

**Maintainer:** Muhammad Farhan  
**Event type:** `youtube.upload.requested`  
**Status:** Static-checked template; YouTube OAuth/upload execution not yet verified.

## Purpose

Validate a video metadata request, wait for explicit approval, fetch the video binary from a reachable HTTPS URL, and upload it using n8n's native YouTube node.

## Input contract

Required: `requestId`, `title`, `description`, and a downloadable `videoUrl` that begins with HTTPS. Optional: `tags` array and `visibility`. A new request without Boolean `approved: true` returns `pending-approval`. Visibility defaults to private; trusted callers can request public or unlisted visibility when approved.

## Workflow path

`Header Auth Webhook / parent entry → validate metadata → approved? → download binary → native YouTube Upload → return video ID/result`

## Configuration

Select YouTube OAuth credentials that have permission to upload to the intended channel. The native node uses region code `US`, category ID `22`, tags and the configured privacy status. The URL must be downloadable by n8n without an interactive login page; the file must fit your instance's memory, execution timeout and provider limits.

## Tests to run

Test missing title/description, invalid request ID, inaccessible URL, a large video within safe test limits, `approved: false`, OAuth failure, upload failure, and each privacy mode. Check the video and final visibility in YouTube Studio.

## Safety and limits

The `approved` Boolean is a caller-supplied gate, not a persisted reviewer approval. Keep untrusted callers from selecting public visibility. Upload success and final processing are different states; the workflow does not yet poll processing status or reconcile an upload that times out after YouTube accepted it. Test binary handling and node-schema compatibility on your n8n version.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
