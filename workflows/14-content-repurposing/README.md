# 14 — Multi-platform Content Repurposing

**Maintainer:** Muhammad Farhan  
**Event type:** `content.repurpose.requested`  
**Status:** Static-checked template; Anthropic/Sheets/Gmail execution not yet verified.

## Purpose

Send a source text and selected platform targets to Anthropic, extract platform-specific draft copy, store the draft package in Google Sheets, and email it to an editor for human review.

## Input contract

Required: stable `requestId` and `sourceText` of at least 50 characters. Optional: `targets` array (defaults to LinkedIn, Instagram and YouTube), `tone`, and `editorEmail`.

## Workflow path

`Header Auth Webhook / parent entry → validate source → Anthropic Messages API → extract drafts → Google Sheets append → Gmail editor review → pending-approval result`

## Configuration

Select Google Sheets and Gmail credentials. Configure an Anthropic Header Auth credential supplying `x-api-key`, set the version header, and replace `REPLACE_WITH_SUPPORTED_ANTHROPIC_MODEL`, `REPLACE_WITH_CONTENT_SPREADSHEET_ID`, and `REPLACE_WITH_EDITOR_EMAIL`.

## Tests to run

Test source text under 50 characters, each target set, model authentication/error, empty model response, Sheets failure and editor-email failure. Have a human compare generated drafts with the original source to check factual faithfulness, attribution and platform requirements.

## Limits

This workflow creates drafts and emails the editor; it does not publish or persist a separate approval decision. After review, send approved assets to the platform-specific workflow with an appropriate approval input. Human review remains important because generated text can omit context or introduce unsupported claims.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
