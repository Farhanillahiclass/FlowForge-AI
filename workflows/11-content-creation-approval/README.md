# 11 — Content Creation & Approval

**Maintainer:** Muhammad Farhan  
**Event type:** `content.draft.requested`  
**Status:** Source-level updates only; Anthropic, Google Sheets, Gmail and Apps Script execution have not been live-tested.

## Purpose

Generate a content draft from a brief, store it, and request a human review. Approval and rejection are separate, authenticated state transitions. Approval does not publish content; publishing must be a separate platform-specific workflow with its own authorization and verification.

## n8n node path

`Submit Content Brief / Called by Parent Workflow → Normalize Parent Payload (parent path) → Validate Brief and Set Approval Gate → Brief Valid? → Generate Content Draft with Anthropic → Extract Generated Draft → Save Draft and Email for Approval → Email Draft to Editor → Return Draft Status`

Invalid brief path: `Brief Valid? (false) → Reject Short Brief`.

The current n8n JSON sends an editor notification, but it does not have an authenticated callback that resumes this workflow after a decision. The Apps Script adapter below supplies a persistent decision registry, but it is not automatically connected to n8n.

## Required configuration

1. Import `workflow.json` into a test n8n Cloud workspace.
2. Configure Header Auth on the webhook.
3. Configure Anthropic header credentials with `x-api-key`, set `anthropic-version: 2023-06-01`, and choose a supported model.
4. Replace `REPLACE_WITH_CONTENT_SPREADSHEET_ID` and `REPLACE_WITH_EDITOR_EMAIL`; select Google Sheets and Gmail OAuth credentials.
5. Create a `ContentDrafts` tab whose headers match the fields emitted by `Extract Generated Draft`. Check the actual Sheets node mappings before enabling it.
6. Keep the workflow inactive until acceptance tests pass.

## Apps Script approval registry

Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`. Run `setupSheet()` to create/validate `ContentApproval` and `ContentApprovalAudit`. Deploy as a Web App only after reviewing access settings. Do not commit the token.

### Create a pending draft record

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "action": "create",
  "requestId": "content-test-001",
  "data": {
    "briefId": "brief-test-001",
    "platform": "linkedin",
    "brief": "Write a professional update about our new learning resource.",
    "draft": "Draft text that the editor will review."
  }
}
```

### Record a reviewer decision

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "action": "decision",
  "requestId": "content-test-001",
  "data": {
    "approvalStatus": "approved",
    "reviewer": "editor@example.com",
    "reviewComment": "Reviewed and fact-checked."
  }
}
```

Use `rejected` instead of `approved` to reject. The adapter validates request IDs, brief/draft/platform, reviewer email and decision state; prevents duplicate draft creation; rejects a second final decision; and writes an audit row. The token authenticates the caller but does not establish the real-world identity of the reviewer by itself. Restrict who can call the decision endpoint, and do not treat a user-supplied reviewer email as verified identity.

## Acceptance tests

1. Valid create request records a `pending` row and an audit entry.
2. Repeated create request with the same request ID returns duplicate without another draft row.
3. Missing/short brief, missing draft/platform, malformed JSON and wrong token are rejected.
4. Decision for an unknown request ID returns not found.
5. Valid approved/rejected decision records reviewer, timestamp and audit event.
6. Second decision after a final decision returns conflict and does not overwrite the first decision.
7. Wrong sheet headers and missing Script Properties fail clearly.
8. Verify the n8n workflow saves the right fields and sends editor email; simulate Anthropic, Sheets and Gmail errors.
9. Confirm approval does not trigger publication until a separate publishing workflow verifies the approved status.

## Known limitations

- The n8n workflow currently saves to `ContentDrafts`, while the Apps Script registry uses its own `ContentApproval` sheet. They are separate records unless you explicitly connect them with an HTTP Request node and reconcile field mappings.
- Current n8n email is a notification, not an approval callback.
- Apps Script records approval/rejection but does not publish content.
- The endpoint's shared token is not a full per-reviewer identity system. Use a trusted identity provider or protected approval UI for production.
- A failure between writing the decision and writing the audit row can leave partial state; verify/reconcile sheet records after failures.
- Live execution has not been verified.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
