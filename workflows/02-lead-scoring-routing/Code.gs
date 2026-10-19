/** FlowForge-AI Apps Script endpoint: lead scoring and routing.
 * Default rules are transparent starter rules, not a universal sales model.
 * Script Properties: SPREADSHEET_ID and FLOWFORGE_TOKEN. Never commit secrets.
 * POST JSON: {"token":"...","requestId":"stable-id","data":{"name":"...","email":"...","company":"...","source":"referral","message":"Interested in pricing","budget":true}}
 */
const SHEET_NAME = "LeadScoring";
const HEADERS = ["createdAt","requestId","leadId","name","email","score","tier","route","reason"];
const WORKFLOW_ID = "02-lead-scoring-routing";

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
      throw new Error("Header mismatch in " + SHEET_NAME + ". Expected: " + HEADERS.join(", "));
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
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  if (!requestId || requestId.length > 200) return output_({ok:false, status:"rejected", error:"requestId is required (max 200 chars)"});
  if (!name || name.length > 200) return output_({ok:false, status:"rejected", requestId, error:"name is required (max 200 chars)"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return output_({ok:false, status:"rejected", requestId, error:"A valid email is required"});
  }

  const scored = scoreLead_(data, name, email);
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
    if (HEADERS.some((h, i) => currentHeaders[i] !== h)) {
      return output_({ok:false, status:"configuration_error", error:"Sheet headers do not match; back up data before repairing the header row"});
    }
    if (sheet.getLastRow() > 1) {
      const ids = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
      if (ids.includes(requestId)) {
        return output_({ok:true, status:"duplicate", duplicate:true, requestId, score:scored.score, tier:scored.tier, route:scored.route, sideEffectsSkipped:true});
      }
    }
    const leadId = String(data.leadId || requestId).trim().slice(0, 200);
    const row = [
      new Date().toISOString(), requestId, safe_(leadId), safe_(name), safe_(email),
      scored.score, scored.tier, scored.route, safe_(scored.reason)
    ];
    sheet.appendRow(row);
    return output_({ok:true, status:"scored", duplicate:false, workflow:WORKFLOW_ID, requestId, leadId, score:scored.score, tier:scored.tier, route:scored.route, reason:scored.reason, row:sheet.getLastRow()});
  } catch (err) {
    return output_({ok:false, status:"failed", error:String(err && err.message || err).slice(0, 250)});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (_) {} }
  }
}

/** Transparent starter rubric: maximum 100. Tune these weights to your sales process. */
function scoreLead_(data, name, email) {
  let score = 10; // a valid name and email are required to reach this function
  const reasons = ["valid name and email +10"];
  const company = String(data.company || "").trim();
  if (company) { score += 20; reasons.push("company supplied +20"); }
  const source = String(data.source || "").trim().toLowerCase();
  if (source === "referral" || source === "partner") { score += 20; reasons.push("referral/partner source +20"); }
  const message = String(data.message || "").trim().toLowerCase();
  if (message) { score += 10; reasons.push("message supplied +10"); }
  if (/\b(demo|pricing|quote|buy|purchase|trial)\b/.test(message)) {
    score += 25; reasons.push("purchase-intent keyword +25");
  }
  const budget = data.budget === true || String(data.budget || "").toLowerCase() === "yes";
  if (budget) { score += 15; reasons.push("budget confirmed +15"); }
  score = Math.min(100, score);
  const tier = score >= 70 ? "HOT" : score >= 40 ? "WARM" : "NURTURE";
  const route = tier === "HOT" ? "sales-priority" : tier === "WARM" ? "sales-follow-up" : "nurture";
  return {score, tier, route, reason:reasons.join("; ")};
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
