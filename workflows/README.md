# FlowForge-AI Workflow Catalog

This folder contains 20 importable n8n JSON templates.

## Import

1. Open your n8n instance.
2. Choose **Import from File** from the workflow menu.
3. Select any JSON file in this folder.
4. Inspect nodes and expressions, then run with sample data.

## Notes

- Workflows 01–13 use built-in manual trigger and Code nodes; no external API credentials are needed to test them.
- Workflows 14–19 call public APIs and require internet access. Third-party endpoints can change, rate-limit, or become unavailable.
- Workflow 20 accepts a POST JSON payload. Test with the webhook test URL first, and activate only when ready.
- The sample data and rules are demonstrations, not production business logic.
- Do not commit API keys, passwords, personal data, or private webhook URLs to a public repository.
