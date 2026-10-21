# Workflow Documentation Template

Use this template when documenting an individual FlowForge-AI workflow. Copy it into that workflow's folder as `README.md` and replace every placeholder with verified details.

## Overview

- **Workflow name:** `<name>`
- **Purpose:** `<what problem this workflow solves>`
- **Status:** `planned | static-validated | integration-tested | needs-credentials`
- **Workflow export:** `<relative path to JSON file>`

## How it works

1. **Trigger:** `<manual, schedule, webhook, app event, etc.>`
2. **Inputs:** `<required input fields and example placeholders>`
3. **Processing:** `<main steps and important decisions>`
4. **Outputs:** `<result, destination, or side effect>`
5. **Failure handling:** `<retry, error workflow, notification, or known limitation>`

## Requirements

- n8n version: `<tested version or not yet verified>`
- External services: `<service names>`
- Credentials: `<credential types only; never paste secrets>`
- Environment variables: `<NAME=value placeholder and purpose>`

## Setup

1. Import the JSON export into a test n8n instance.
2. Review all nodes, expressions, and connections before enabling the workflow.
3. Configure credentials using n8n's credential manager.
4. Replace sample values with test data.
5. Run the test procedure below before enabling the workflow for real use.

## Test procedure

- [ ] JSON export parses successfully.
- [ ] Required nodes and connections are present.
- [ ] Happy path tested with non-sensitive sample data.
- [ ] Missing or invalid input tested.
- [ ] External service failure behavior reviewed.
- [ ] Output and side effects verified in the test environment.
- [ ] Test date, n8n version, and result recorded below.

## Validation evidence

- **Static validation:** `<pass/fail/not run>`
- **Integration test:** `<pass/fail/not run/needs credentials>`
- **Tested on:** `<date and n8n version, if applicable>`
- **Known limitations:** `<limitations>`

## Security notes

- Never commit API keys, OAuth tokens, passwords, personal data, or real customer records.
- Use test accounts and least-privilege credentials.
- Confirm external actions (email, payments, record updates, deletion) are safe before enabling the workflow.
- Treat imported workflow JSON as executable automation and review every node before running it.

## Troubleshooting

| Problem | Likely cause | Suggested check |
|---|---|---|
| Authentication fails | Missing, expired, or incorrectly scoped credentials | Reconnect credentials and verify required scopes |
| No items reach a node | Input mapping or filter conditions | Inspect the previous node's output and expressions |
| Workflow fails on import | Unsupported node type or version mismatch | Check the n8n version and required community nodes |
| Output differs from expectation | Sample data, expression, or API response changed | Inspect execution data and service response |

## Changelog

- `<date>` — `<documented change>`
