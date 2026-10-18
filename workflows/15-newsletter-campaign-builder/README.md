# 15 — Newsletter Campaign Builder

**Maintainer:** Muhammad Farhan  
**Event type:** `newsletter.campaign.requested`  
**Status:** Static-checked template; live mailing not yet verified.

## Purpose

Validate a newsletter draft, require an explicit approval flag, read the subscriber list, filter by consent and unsubscribe status, send the message to eligible recipients, and log send attempts.

## Input contract

Required: stable `requestId`, non-empty `subject`, `body` longer than 20 characters, and `approved: true` to start sending. Optional: `audienceId` to limit recipients. Without approval, the workflow returns `pending-approval` and does not enter the mailing branch.

## Required Subscribers and CampaignLog sheet fields

The `Subscribers` tab needs `email`, `consent`, `unsubscribed` and optionally `audienceId`, `subscriberId`. The workflow accepts Boolean or string forms of true/yes for consent and unsubscribe flags. The `CampaignLog` tab stores request ID, subscriber email/ID, subject and attempt time.

## Workflow path

`Header Auth Webhook / parent entry → validate → Campaign Approved? → read subscribers → filter valid consented recipients and suppress unsubscribed → Gmail per recipient → append send-attempt log`

## Configuration

Select Google Sheets and Gmail credentials. Replace `REPLACE_WITH_SUBSCRIBERS_SPREADSHEET_ID` and `REPLACE_WITH_CAMPAIGN_LOG_SPREADSHEET_ID`. Test with internal addresses first and keep the workflow inactive until the full mailing and suppression behavior is verified.

## Tests to run

Test missing consent, unsubscribed flag, invalid email, another audience ID, an empty eligible list, approval false/true, Gmail failure, and log-write failure. Confirm only intended addresses receive a test message.

## Limits and safeguards

The `approved` flag is supplied by the authenticated caller; it is not a reviewer identity or persisted approval record. The current template relies on Gmail sends per subscriber, not a specialized campaign provider. Provider quotas, unsubscribe law/policy, bounce management and suppression data need separate handling. A send followed by failed logging can create uncertain delivery state; reconcile before retrying. Use an internal test list and require human review before a real campaign.

Files: [workflow.json](./workflow.json) · [Code.gs](./Code.gs)  
Shared guides: [credentials](../CREDENTIALS-GUIDE.md) · [testing](../../TESTING-AND-VALIDATION.md)
