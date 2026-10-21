# FlowForge-AI Repository Improvement Roadmap

This roadmap helps keep the FlowForge-AI workflow library reliable, understandable, and easy to use.

## 1. Workflow quality

- [ ] Confirm each workflow folder includes its own `README.md`, n8n JSON export, and Apps Script where applicable.
- [ ] Document each workflow's purpose, trigger, inputs, outputs, required services, and credential setup.
- [ ] Replace example values with clearly marked placeholders; never commit real tokens, passwords, or private customer data.
- [ ] Validate every JSON export and record the result.
- [ ] Check node connections, expressions, and error paths.
- [ ] Test each workflow in an isolated n8n environment with test accounts before describing it as verified.

## 2. Developer experience

- [ ] Keep the root README focused on the project's value, quick start, workflow gallery, requirements, and support links.
- [ ] Add a consistent setup section to every workflow README.
- [ ] Keep examples and environment-variable names consistent across documentation.
- [ ] Explain which workflows need external credentials and which can be inspected without them.

## 3. Automated checks

- [ ] Run JSON parsing and structural validation on every workflow export.
- [ ] Run checks on pull requests and pushes through GitHub Actions.
- [ ] Fail checks with actionable error messages and file paths.
- [ ] Review workflow changes for accidental secrets before merging.
- [ ] Keep validation reports aligned with the checks that actually ran.

## 4. Website and gallery

- [ ] Confirm every gallery card links to the correct workflow folder and JSON file.
- [ ] Test search, filters, and copy/download links on desktop and mobile.
- [ ] Check accessibility: keyboard navigation, readable contrast, and descriptive link text.
- [ ] Verify GitHub Pages deployment and fix broken links or missing assets.

## 5. Release readiness

- [ ] Review all 20 workflows and record their individual status.
- [ ] Separate static JSON validation from live credential-based execution tests.
- [ ] Update documentation and changelog with each release.
- [ ] Verify license and third-party attribution for included code and assets.
- [ ] Publish only evidence-backed claims; do not call a workflow production-ready until its required tests pass.

## Suggested status labels

- `planned`: work has not started.
- `in-progress`: someone is actively working on it.
- `needs-credentials`: live testing is blocked until test credentials are configured.
- `blocked`: a dependency or defect prevents progress.
- `verified`: the documented checks passed and evidence is available.

## Definition of done

A change is done when the workflow or documentation is reviewed, automated checks pass, any required isolated test is recorded, secrets are not exposed, and the relevant README or validation report is updated.
