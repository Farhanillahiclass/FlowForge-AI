# FlowForge-AI — Workflows

Maintainer: **Muhammad Farhan**

This folder contains the n8n workflow JSON files and setup documentation.

## Files

- [Credential setup guide for all 20 workflows](CREDENTIALS-GUIDE.md) — required accounts, credentials, placeholders, and test checklist for each workflow.
- [Main project README](../README.md) — project overview, workflow catalog, security notes, and license.
- [MIT License](../LICENSE)

## Import and configure

1. Open n8n and choose **Import from File**.
2. Select the workflow JSON you want to test.
3. Open each integration node and select/create its credential in n8n.
4. Replace example spreadsheet IDs, tab names, channel IDs, chat IDs, recipients, and other placeholders.
5. Test with dummy data and inspect each node's output.
6. Activate only after end-to-end testing and webhook security review.

## Important

- Not every workflow needs external credentials; local examples and some public APIs may not need them.
- OAuth scopes, API access, node versions, and provider requirements can vary.
- A credential guide is setup documentation, not proof that a workflow is connected or production-tested.
- Never commit passwords, API keys, OAuth tokens, bot tokens, customer data, or private webhook URLs to GitHub.
