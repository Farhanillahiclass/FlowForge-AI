/** FlowForge-AI Apps Script endpoint: consent-aware follow-up queue intake.
 * This endpoint records a contact for the n8n follow-up workflow; it does NOT send email.
 * Script Properties: SPREADSHEET_ID and FLOWFORGE_TOKEN. Never commit secrets.
 * POST JSON: {"token":"...","requestId":"stable-id","data":{"contactId":"c-001","email":"test@example.com","consent":true,"optedOut":false,"nextFollowUpAt":"2026-10-20T12:00:00Z","followUpCount":0}}
 */
const SHEET_NAME = "FollowUps";
const HEADERS = ["createdAt","requestId","contactId","email","consent","optedOut","nextFollowUpAt","followUpCount","lastFollowUpAt","status","followUpSubject","followUpBody"];
const WORKFLOW_ID = "03-email-follow-up-sequence";

function setupSheet() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else {
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => current[i] !== h)) {
      throw new Error("Header mismatch in " + SHEET_NAME + ". Back up existing data before aligning headers.");
    }
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
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return output_({ok:false, status:"rejected", error:"data must be a JSON object"});
  }
  const requestId = String(payload.requestId || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const contactId = String(data.contactId || requestId).trim();
  const consent = data.consent === true || String(data.consent || "").toLowerCase() === "yes" || String(data.consent || "").toLowerCase() === "true";
  const optedOut = data.optedOut === true || data.unsubscribed === true || ["yes","true"].includes(String(data.optedOut || data.unsubscribed || "").toLowerCase());
  const dueRaw = String(data.nextFollowUpAt || "").trim();
  const dueMs = Date.parse(dueRaw);
  const count = data.followUpCount === "" || data.followUpCount == null ? 0 : Number(data.followUpCount);
  if (!requestId || requestId.length > 200) return output_({ok:false, status:"rejected", error:"requestId is required (max 200 chars)"});
  if (!contactId || contactId.length > 200) return output_({ok:false, status:"rejected", requestId, error:"contactId is required (max 200 chars)"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return output_({ok:false, status:"rejected", requestId, error:"A valid email is required"});
  if (!consent) return output_({ok:false, status:"rejected", requestId, error:"Explicit consent is required"});
  if (optedOut) return output_({ok:false, status:"rejected", requestId, error:"Opted-out contacts cannot be queued"});
  if (!Number.isFinite(dueMs)) return output_({ok:false, status:"rejected", requestId, error:"nextFollowUpAt must be a valid date"});
  if (!Number.isInteger(count) || count < 0 || count >= 3) return output_({ok:false, status:"rejected", requestId, error:"followUpCount must be an integer from 0 to 2"});
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    const id = props.getProperty("SPREADSHEET_ID");
    if (!id) return output_({ok:false, status:"configuration_error", error:"SPREADSHEET_ID is not configured"});
    const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() === 0) return output_({ok:false, status:"configuration_error", error:"Run setupSheet() first"});
    const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => currentHeaders[i] !== h)) return output_({ok:false, status:"configuration_error", error:"Sheet headers do not match"});
    if (sheet.getLastRow() > 1) {
      const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getDisplayValues();
      const requestIndex = HEADERS.indexOf("requestId");
      const emailIndex = HEADERS.indexOf("email");
      const duplicateRequest = rows.find(r => r[requestIndex] === requestId);
      if (duplicateRequest) return output_({ok:true, status:"duplicate", duplicate:true, requestId, sideEffectsSkipped:true});
      const existingContact = rows.find(r => String(r[emailIndex] || "").trim().toLowerCase() === email);
      if (existingContact) return output_({ok:true, status:"contact_exists", duplicate:true, requestId, message:"Contact email already exists; update the existing row rather than creating a second contact."});
    }
    const values = HEADERS.map(key => {
      if (key === "createdAt") return new Date().toISOString();
      if (key === "requestId") return requestId;
      if (key === "contactId") return safe_(contactId);
      if (key === "email") return safe_(email);
      if (key === "consent") return true;
      if (key === "optedOut") return false;
      if (key === "nextFollowUpAt") return new Date(dueMs).toISOString();
      if (key === "followUpCount") return count;
      if (key === "lastFollowUpAt") return "";
      if (key === "status") return dueMs <= Date.now() ? "due" : "scheduled";
      return safe_(data[key]);
    });
    sheet.appendRow(values);
    return output_({ok:true, status:dueMs <= Date.now() ? "due" : "scheduled", duplicate:false, workflow:WORKFLOW_ID, requestId, contactId, email, nextFollowUpAt:new Date(dueMs).toISOString(), row:sheet.getLastRow()});
  } catch (err) {
    return output_({ok:false, status:"failed", error:String(err && err.message || err).slice(0, 250)});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (_) {} }
  }
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
