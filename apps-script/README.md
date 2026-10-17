# Dedicated Apps Script endpoints

Each workflow has a separate Apps Script project source under its own folder. These scripts are optional Google Sheets logging/storage adapters, not replacements for workflow-specific n8n integrations.

- [01-lead-capture-crm](./01-lead-capture-crm/Code.gs) — dedicated sheet tab: `LeadCapture`
- [02-lead-scoring-routing](./02-lead-scoring-routing/Code.gs) — dedicated sheet tab: `LeadScoring`
- [03-email-follow-up-sequence](./03-email-follow-up-sequence/Code.gs) — dedicated sheet tab: `FollowUps`
- [04-inbox-triage-assistant](./04-inbox-triage-assistant/Code.gs) — dedicated sheet tab: `InboxTriage`
- [05-customer-support-desk](./05-customer-support-desk/Code.gs) — dedicated sheet tab: `SupportTickets`
- [06-faq-human-handoff](./06-faq-human-handoff/Code.gs) — dedicated sheet tab: `FaqHandoff`
- [07-meeting-booking-system](./07-meeting-booking-system/Code.gs) — dedicated sheet tab: `Bookings`
- [08-meeting-reminders](./08-meeting-reminders/Code.gs) — dedicated sheet tab: `MeetingReminders`
- [09-client-onboarding](./09-client-onboarding/Code.gs) — dedicated sheet tab: `ClientOnboarding`
- [10-invoice-payment-reminders](./10-invoice-payment-reminders/Code.gs) — dedicated sheet tab: `InvoiceReminders`
- [11-content-creation-approval](./11-content-creation-approval/Code.gs) — dedicated sheet tab: `ContentApproval`
- [12-instagram-publishing-pipeline](./12-instagram-publishing-pipeline/Code.gs) — dedicated sheet tab: `InstagramQueue`
- [13-youtube-publishing-assistant](./13-youtube-publishing-assistant/Code.gs) — dedicated sheet tab: `YouTubeQueue`
- [14-content-repurposing](./14-content-repurposing/Code.gs) — dedicated sheet tab: `RepurposedContent`
- [15-newsletter-campaign-builder](./15-newsletter-campaign-builder/Code.gs) — dedicated sheet tab: `NewsletterCampaigns`
- [16-weekly-business-report](./16-weekly-business-report/Code.gs) — dedicated sheet tab: `BusinessReports`
- [17-feedback-routing](./17-feedback-routing/Code.gs) — dedicated sheet tab: `CustomerFeedback`
- [18-workflow-error-monitor](./18-workflow-error-monitor/Code.gs) — dedicated sheet tab: `WorkflowErrors`
- [19-api-health-monitor](./19-api-health-monitor/Code.gs) — dedicated sheet tab: `ApiHealthChecks`
- [20-telegram-business-assistant](./20-telegram-business-assistant/Code.gs) — dedicated sheet tab: `TelegramEvents`

## Setup each script
1. Create a separate Apps Script project for the workflow and paste that folder's `Code.gs`.
2. Create a **test** Google Sheet, set Script Properties `SPREADSHEET_ID` and a strong random `FLOWFORGE_TOKEN`.
3. Run `setupSheet()` and authorize the requested permissions.
4. Deploy as a web app with an access policy appropriate to your organisation; never use public access for confidential client data without a security review.
5. POST JSON containing `token`, stable `requestId`, and a `data` object. Do not commit tokens.
6. Test success, bad token, malformed JSON, missing requestId and duplicate requestId.

## Security note
Apps Script ContentService does not give this simple sample a robust production authentication boundary. The token is in the POST body (not URL query), but web-app access policy, logs, permissions and client data sensitivity still matter. For production, put an authenticated service/gateway in front and follow your organisation's security requirements.

These files have not been deployed or live-tested against Google accounts in this environment. They are distinct starter adapters; workflows that do not use Sheets do not need to call them.
