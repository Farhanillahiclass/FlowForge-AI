# FlowForge-AI Workflows

**Maintainer:** Muhammad Farhan

This directory contains the 20 business-oriented workflow JSON templates listed in the [main README](../README.md).

## Import
1. Import a JSON file into n8n.
2. Inspect all node types, parameters and connections for your n8n version.
3. Configure credentials and replace IDs/recipients.
4. Replace every node named **Configure**, **Connect**, or a No Operation placeholder with the real integration/action node.
5. Test success, invalid input, duplicates and external-service failures before activating.

## Setup references
- [Credentials and workflow-by-workflow guide](./CREDENTIALS-GUIDE.md)
- [Portfolio and 20-workflow catalog](../README.md)

## Important
These are portfolio builds, not a claim of 20 live-tested production deployments. A workflow is complete only after all action nodes are configured and a real end-to-end test passes. Never commit credentials or customer records.
