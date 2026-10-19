# 20 — Telegram Business Assistant

**Maintainer:** Muhammad Farhan  
**Event:** `telegram.command.received`  
**Status:** Source and documentation hardening only; live provider execution has not been verified.

## Purpose

Handle Telegram commands, log lead/support requests and reply to the originating chat.

## Node-by-node path

`Telegram update/webhook → normalize update → route /start, /help, /lead, /support → validate → persist lead/support → Telegram reply; unknown commands return help.`

## Integration setup

Configure a Telegram bot credential, native Telegram Trigger or secured webhook, Sheets credentials and support email. Keep bot token in n8n credentials. Input should include message.text and message.chat.id; use update_id as stable request ID.

1. Import `workflow.json` into a non-production n8n workspace.
2. Set credentials through n8n's credential manager; never commit tokens or API keys.
3. Replace all `REPLACE_WITH_...` values and verify every node's field mapping against the actual sheet/API schema.
4. Keep the workflow inactive until acceptance tests pass.

## Apps Script adapter

`Code.gs` is a separate authenticated logging/queue endpoint, not an automatic bridge to the n8n execution path. Set Script Properties `SPREADSHEET_ID` and `FLOWFORGE_TOKEN`, run `setupSheet()`, and deploy only after reviewing Web App access settings. The adapter validates a request ID, checks exact sheet headers, prevents duplicate IDs under a script lock and protects spreadsheet cells from formula injection. It logs records only; it does not perform the provider side effects described by the workflow.

Example request:

```json
{
  "token": "YOUR_SCRIPT_PROPERTY_TOKEN",
  "requestId": "test-001",
  "data": {
    "sourceId": "source-001",
    "status": "pending"
  }
}
```

Replace the example fields with the columns used by this workflow. Never put the real token in a repository or screenshot.

## Acceptance tests

/start; /help; valid/invalid /lead; /support; unknown command; missing chat ID; duplicate update_id; Telegram API error; Sheets/Gmail failure.

Additionally, verify duplicate request IDs do not create duplicate registry rows, wrong tokens are rejected, malformed JSON is rejected, missing Script Properties produce a configuration error, and mismatched headers are detected. Verify the provider-side effect separately in the relevant service.

## Known limitations

If using a generic webhook, ensure Telegram webhook authentication/secret verification is configured. Apps Script registry only logs events and is not the live Telegram bot.

Do not describe the workflow as production-ready until provider credentials, external side effects, retry behavior and failure recovery are tested in a disposable environment.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
