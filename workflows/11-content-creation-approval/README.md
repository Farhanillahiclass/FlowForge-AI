# 11 — Content Creation & Approval

**Maintainer:** Muhammad Farhan  
**Event type:** `content.draft.requested`  
**Status:** Static-checked template; Anthropic/Sheets/Gmail execution not yet verified.

## Purpose

Send a writing brief to Anthropic, extract a draft, save it in the `ContentDrafts` sheet, and email the draft to an editor for human review. This workflow drafts content; it does not publish it.

## Input contract

Required: a stable `requestId` and a `brief` with at least 20 characters. Optional: `platforms` array, `tone`, `audience`, and `editorEmail`. Direct Webhook requests require Header Auth; parent calls use `eventType: "content.draft.requested"`.

## Workflow path

`Webhook/parent entry → validate brief → Anthropic Messages API → extract draft → Google Sheets append → Gmail editor review → pending-approval result`

## Configuration

Create a Header Auth credential for the Anthropic API that supplies `x-api-key`; set the `anthropic-version` header and a model name supported by your account. Replace `REPLACE_WITH_SUPPORTED_ANTHROPIC_MODEL`, `REPLACE_WITH_CONTENT_SPREADSHEET_ID`, and `REPLACE_WITH_EDITOR_EMAIL`. Select Google Sheets and Gmail credentials.

## Tests to run

Test a brief under 20 characters, a valid brief, provider authentication failure, model/HTTP error, empty model response, Sheets failure and editor-email failure. Review the actual saved draft rather than assuming a successful HTTP call means the text is acceptable.

## Limits

The editor email is a notification, not a persistent approval callback. It does not wait for a reviewer or publish by itself. After human review, send approved content to a platform-specific workflow through its own authenticated input and explicit approval flag. Do not send model-generated claims externally without human fact-checking.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
