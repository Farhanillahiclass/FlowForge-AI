/** FlowForge-AI Apps Script endpoint: deterministic inbox triage intake.
 * This endpoint classifies and logs a message; it does not read an inbox or send replies.
 * Script Properties: SPREADSHEET_ID and FLOWFORGE_TOKEN. Never commit secrets.
 * POST JSON: {"token":"...","requestId":"stable-id","data":{"messageId":"provider-id","sender":"person@example.com","subject":"Need help","body":"My order is delayed"}}
 */
const SHEET_NAME = "InboxTriage";
const HEADERS = ["createdAt","requestId","messageId","sender","subject","category","priority","summary","status"];
const WORKFLOW_ID = "04-inbox-triage-assistant";

function setupSheet() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else {
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => current[i] !== h)) throw new Error("Header mismatch in " + SHEET_NAME + ".");
  }
  return "Ready: " + SHEET_NAME;
}

function doGet() {
  return output_({ok:true, service:"FlowForge-AI", workflow:WORKFLOW_ID, status:"ready"});
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty("FLOWFORGE_TOKEN");
  if (!expected) return output_({ok:false, status:"configuration_error", error:"Server token is not configured"});
  let payload;
  try { payload = JSON.parse(e && e.postData && e.postData.contents || "{}"); }
  catch (_) { return output_({ok:false, status:"rejected", error:"Invalid JSON"}); }
  if (!payload.token || !constantTimeEqual_(String(payload.token), expected)) {
    return output_({ok:false, status:"unauthorized", error:"Unauthorized"});
  }
  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return output_({ok:false, status:"rejected", error:"data must be a JSON object"});
  const requestId = String(payload.requestId || "").trim();
  const messageId = String(data.messageId || "").trim();
  const sender = String(data.sender || data.from || "").trim().toLowerCase();
  const subject = String(data.subject || "").trim();
  const body = String(data.body || data.text || "").trim();
  if (!requestId || requestId.length > 200) return output_({ok:false, status:"rejected", error:"requestId is required (max 200 chars)"});
  if (!messageId || messageId.length > 300) return output_({ok:false, status:"rejected", requestId, error:"messageId is required (max 300 chars)"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender) || sender.length > 320) return output_({ok:false, status:"rejected", requestId, error:"A valid sender email is required"});
  if (!subject && !body) return output_({ok:false, status:"rejected", requestId, error:"subject or body is required"});
  const result = classifyMessage_(subject, body);
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    const id = props.getProperty("SPREADSHEET_ID");
    if (!id) return output_({ok:false, status:"configuration_error", error:"SPREADSHEET_ID is not configured"});
    const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() === 0) return output_({ok:false, status:"configuration_error", error:"Run setupSheet() first"});
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => current[i] !== h)) return output_({ok:false, status:"configuration_error", error:"Sheet headers do not match"});
    if (sheet.getLastRow() > 1) {
      const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getDisplayValues();
      const duplicate = rows.find(r => r[1] === requestId || r[2] === messageId);
      if (duplicate) return output_({ok:true, status:"duplicate", duplicate:true, requestId, messageId, sideEffectsSkipped:true});
    }
    const summary = body.replace(/\s+/g, " ").slice(0, 500);
    sheet.appendRow([new Date().toISOString(), requestId, safe_(messageId), safe_(sender), safe_(subject), result.category, result.priority, safe_(summary), "triaged"]);
    return output_({ok:true, status:"triaged", duplicate:false, workflow:WORKFLOW_ID, requestId, messageId, category:result.category, priority:result.priority, reason:result.reason, row:sheet.getLastRow()});
  } catch (err) {
    return output_({ok:false, status:"failed", error:String(err && err.message || err).slice(0, 250)});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (_) {} }
  }
}

function classifyMessage_(subject, body) {
  const text = (subject + " " + body).toLowerCase();
  const priority = /\b(urgent|asap|outage|security incident|account compromised|cannot access|blocked)\b/.test(text) ? "high"
    : /\b(refund|cancel|complaint|failed|error|late|broken)\b/.test(text) ? "medium" : "normal";
  let category = "other";
  if (/\b(invoice|billing|payment|charge|refund|subscription)\b/.test(text)) category = "billing";
  else if (/\b(demo|pricing|quote|sales|purchase|buy)\b/.test(text)) category = "sales";
  else if (/\b(help|support|issue|problem|error|bug|cannot|can't|broken)\b/.test(text)) category = "support";
  else if (/\b(unsubscribe|promotion|newsletter|spam)\b/.test(text)) category = "low-priority";
  const reason = "rule-based classification; review ambiguous messages before acting";
  return {category, priority, reason};
}

function safe_(value) {
  let s = String(value == null ? "" : value).trim().slice(0, 4000);
  if (/^[=+@]/.test(s) || /^-[^0-9]/.test(s)) s = "'" + s;
  return s;
}

function constantTimeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
