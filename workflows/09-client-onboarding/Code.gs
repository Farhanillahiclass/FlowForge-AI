/** FlowForge-AI client onboarding intake.
 * Script Properties: SPREADSHEET_ID and FLOWFORGE_TOKEN.
 * POST: {"token":"...","requestId":"client-001","data":{"clientId":"c-001","name":"Example Client","email":"client@example.com","package":"starter","checklistJson":"[]","status":"onboarding-pending"}}
 * This Apps Script endpoint logs a client row only. It does not send email or schedule a kickoff.
 */
const SHEET_NAME = "ClientOnboarding";
const HEADERS = ["createdAt","requestId","clientId","name","email","package","checklistJson","status"];

function setupSheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else {
    const actual = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => actual[i] !== h)) throw new Error("ClientOnboarding headers do not match.");
  }
  return "Ready: " + SHEET_NAME;
}

function doGet() {
  return output_({ok:true, service:"FlowForge-AI", workflow:"09-client-onboarding", status:"ready"});
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty("FLOWFORGE_TOKEN");
  if (!expected) return output_({ok:false, status:"configuration_error", error:"FLOWFORGE_TOKEN is not configured"});
  let payload;
  try { payload = JSON.parse(e && e.postData && e.postData.contents || "{}"); }
  catch (err) { return output_({ok:false, status:"rejected", error:"Invalid JSON"}); }
  if (!constantTimeEqual_(String(payload.token || ""), expected)) return output_({ok:false, status:"unauthorized", error:"Unauthorized"});
  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return output_({ok:false, status:"rejected", error:"data must be a JSON object"});

  const requestId = String(payload.requestId || data.requestId || data.eventId || "").trim();
  const clientId = String(data.clientId || "").trim();
  const name = String(data.clientName || data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const packageName = String(data.package || data.service || "not specified").trim();
  const status = String(data.status || "onboarding-pending").trim();
  let checklistJson = data.checklistJson == null ? "[]" : String(data.checklistJson);
  if (Array.isArray(data.checklist)) checklistJson = JSON.stringify(data.checklist);
  try {
    const parsed = JSON.parse(checklistJson);
    if (!Array.isArray(parsed)) throw new Error("checklistJson must contain a JSON array");
    checklistJson = JSON.stringify(parsed);
  } catch (err) {
    return output_({ok:false, status:"rejected", requestId, error:"checklistJson must be a valid JSON array"});
  }
  if (!requestId || requestId.length > 200) return output_({ok:false, status:"rejected", error:"requestId is required (max 200 chars)"});
  if (!name || name.length > 200) return output_({ok:false, status:"rejected", requestId, error:"Client name is required (max 200 chars)"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return output_({ok:false, status:"rejected", requestId, error:"A valid email is required"});
  if (clientId.length > 200 || packageName.length > 200 || status.length > 100) return output_({ok:false, status:"rejected", requestId, error:"One or more fields exceed the allowed length"});
  if (checklistJson.length > 10000) return output_({ok:false, status:"rejected", requestId, error:"Checklist is too large (max 10000 chars)"});

  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000); locked = true;
    const id = props.getProperty("SPREADSHEET_ID");
    if (!id) return output_({ok:false, status:"configuration_error", error:"SPREADSHEET_ID is not configured"});
    const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() === 0) return output_({ok:false, status:"configuration_error", error:"Run setupSheet() first"});
    const actual = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => actual[i] !== h)) return output_({ok:false, status:"configuration_error", error:"ClientOnboarding headers do not match"});
    if (sheet.getLastRow() > 1) {
      const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getDisplayValues();
      const prior = rows.find(r => r[1] === requestId);
      if (prior) return output_({ok:true, status:"duplicate", duplicate:true, requestId, clientId:prior[2], existingStatus:prior[7], sideEffectsSkipped:true});
    }
    sheet.appendRow([new Date().toISOString(), requestId, safe_(clientId), safe_(name), safe_(email), safe_(packageName), safe_(checklistJson), safe_(status)]);
    return output_({ok:true, status:"created", duplicate:false, workflow:"09-client-onboarding", requestId, clientId, row:sheet.getLastRow(), emailSent:false, kickoffScheduled:false});
  } catch (err) {
    return output_({ok:false, status:"failed", error:String(err && err.message || err).slice(0, 250)});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (err) {} }
  }
}
function safe_(value) {
  let s = String(value == null ? "" : value).trim().slice(0, 10000);
  if (/^[=+@]/.test(s) || /^-[^0-9]/.test(s)) s = "'" + s;
  return s;
}
function constantTimeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
