# 12 — Instagram Publishing Pipeline

**Maintainer:** Muhammad Farhan  
**Event type:** `instagram.publish.requested`  
**Status:** Static-checked template; Meta Graph API execution not yet verified.

## Purpose

Validate a caption and a public HTTPS media URL, require an explicit `approved: true` value, create a Meta media container, wait briefly, and request publication.

## Input contract

Required: stable `requestId`, non-empty `caption`, and accessible `imageUrl` beginning with HTTPS. A publishing attempt occurs only when the caller includes Boolean `approved: true`; otherwise the workflow returns `pending-approval`.

## Workflow path

`Header Auth Webhook / parent entry → validate → approved? → Meta media container → wait 10 seconds → media publish`

## Configuration

Replace `REPLACE_WITH_GRAPH_API_VERSION` and `REPLACE_WITH_IG_USER_ID`. Set an n8n Header Auth credential for the Meta access token and select it in both HTTP Request nodes. The connected Instagram account must be eligible for publishing and have required Meta permissions. The media URL must be reachable by Meta.

## Tests to run

Use an internal test account and non-sensitive media. Test missing caption, HTTP URL, inaccessible media, `approved: false`, token/permission failure, container creation error, media still processing, and publish failure. Confirm the post appears in the intended Instagram account.

## Safety and limits

The `approved` Boolean is a **caller-supplied gate**, not proof of a separate reviewer identity or a persisted approval record. Only trusted authenticated callers should be allowed to submit approved publishing requests. The current wait is fixed at 10 seconds; it does not poll container status or reliably handle every processing delay. Add status polling, retry limits, a publish ledger and reconciliation before production use.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
