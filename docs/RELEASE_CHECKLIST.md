# FlowForge-AI Release Readiness Checklist

Use this checklist before tagging a release or describing the library as production-ready.

## Repository checks

- [ ] Current branch is up to date and intended changes are committed.
- [ ] Existing static workflow validation passes.
- [ ] Validator unit tests pass.
- [ ] GitHub Actions run links are recorded for the release commit.
- [ ] No secrets, real customer records, or private credentials are present in committed files.
- [ ] License, third-party notices, and asset attribution are reviewed.

## Workflow checks

- [ ] All 20 workflow exports import into the documented target n8n version.
- [ ] Parent/child workflow bindings are configured with actual workspace IDs.
- [ ] Credential requirements and least-privilege scopes are documented.
- [ ] Positive-path tests use synthetic data and test destinations.
- [ ] Missing/invalid input behavior is checked.
- [ ] Retry, duplicate-event, and partial-failure behavior is tested where relevant.
- [ ] Side effects are verified at the destination, not inferred only from HTTP status or node output.
- [ ] Central error workflow is explicitly assigned in n8n settings and its notification route is tested.
- [ ] Known limitations are recorded in `docs/WORKFLOW_AUDIT_MATRIX.md`.

## Gallery and docs

- [ ] Workflow gallery loads on desktop and mobile.
- [ ] Search and category filters work.
- [ ] Each card points to the matching README and JSON export.
- [ ] Setup instructions match the actual exported workflow.
- [ ] Deployment workflow completed successfully for the release commit.
- [ ] No links, images, or download paths are broken.

## Release record

- **Version/tag:** `<version>`
- **Commit SHA:** `<sha>`
- **Static validation run:** `<URL>`
- **Unit test run:** `<URL>`
- **Gallery deployment run:** `<URL>`
- **Integration test evidence:** `<redacted reference>`
- **Known limitations:** `<summary>`
- **Release date:** `<YYYY-MM-DD>`

## Release decision

- [ ] Ready for the stated scope, with evidence recorded.
- [ ] Not ready; blocking issues are documented.

Do not mark a release as production-ready solely because static validation passes. Runtime readiness depends on the target n8n environment, credentials, external services, and observed test results.
