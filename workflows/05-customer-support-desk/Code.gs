/** Support ticket intake adapter for FlowForge-AI.
 * Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 * POST JSON: {"token":"...","requestId":"stable-id","data":{"name":"Test","email":"test@example.com","message":"Urgent payment failure"}}
 * This endpoint logs tickets only; it does not send email.
 */
const SHEET_NAME = "SupportTickets";
const HEADERS = ["createdAt","requestId","ticketId","name","email","category","priority","message","status"];

function setupSheet() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  else {
    const actual = sh.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => h !== actual[i])) throw new Error("SupportTickets headers do not match.");
  }
  return "Ready: " + SHEET_NAME;
}

function doGet() {
  return json_({ok:true, workflow:"05-customer-support-desk", status:"ready"});
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty("FLOWFORGE_TOKEN");
  if (!secret) return json_({ok:false, status:"configuration_error", error:"FLOWFORGE_TOKEN is not configured"});
  let p;
  try { p = JSON.parse(e && e.postData && e.postData.contents || "{}"); }
  catch (err) { return json_({ok:false, status:"rejected", error:"Invalid JSON"}); }
  if (String(p.token || "") !== secret) return json_({ok:false, status:"unauthorized", error:"Unauthorized"});
  const d = p.data;
  if (!d || typeof d !== "object" || Array.isArray(d)) return json_({ok:false, status:"rejected", error:"data must be an object"});
  const requestId = String(p.requestId || d.requestId || d.eventId || "").trim();
  const name = String(d.name || "").trim();
  const email = String(d.email || "").trim().toLowerCase();
  const message = String(d.message || d.description || "").trim();
  if (!requestId || requestId.length > 200) return json_({ok:false, status:"rejected", error:"requestId is required (max 200 chars)"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return json_({ok:false, status:"rejected", requestId, error:"Valid email required"});
  if (!message || message.length > 10000) return json_({ok:false, status:"rejected", requestId, error:"Message required (max 10000 chars)"});
  if (name.length > 200) return json_({ok:false, status:"rejected", requestId, error:"Name too long"});
  const c = classify_(message);
  const ticketId = "SUP-" + requestId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 180);
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000); locked = true;
    const spreadsheetId = props.getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) return json_({ok:false, status:"configuration_error", error:"SPREADSHEET_ID is not configured"});
    const sh = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME);
    if (!sh || sh.getLastRow() === 0) return json_({ok:false, status:"configuration_error", error:"Run setupSheet() first"});
    const actual = sh.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => h !== actual[i])) return json_({ok:false, status:"configuration_error", error:"Sheet headers do not match"});
    if (sh.getLastRow() > 1) {
      const rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getDisplayValues();
      const old = rows.find(r => r[1] === requestId || r[2] === ticketId);
      if (old) return json_({ok:true, status:"duplicate", duplicate:true, requestId, ticketId, existingStatus:old[8] || "", sideEffectsSkipped:true});
    }
    sh.appendRow([new Date().toISOString(), requestId, ticketId, safe_(name), safe_(email), c.category, c.priority, safe_(message), "open"]);
    return json_({ok:true, status:"created", duplicate:false, requestId, ticketId, category:c.category, priority:c.priority, row:sh.getLastRow(), notification:"not_sent_by_apps_script"});
  } catch (err) {
    return json_({ok:false, status:"failed", error:String(err && err.message || err).slice(0, 250)});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (err) {} }
  }
}

function classify_(message) {
  const s = String(message).toLowerCase();
  const priority = /urgent|blocked|cannot access|security|outage/.test(s) ? "high" : "normal";
  const category = /refund|payment|invoice|billing/.test(s) ? "billing" : /error|bug|crash|not working|access/.test(s) ? "technical" : "general";
  return {category, priority};
}
function safe_(v) {
  let s = String(v == null ? "" : v).trim().slice(0, 10000);
  if (/^[=+@]/.test(s) || /^-[^0-9]/.test(s)) s = "'" + s;
  return s;
}
function json_(v) {
  return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);
}
