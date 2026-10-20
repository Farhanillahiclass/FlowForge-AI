/** FlowForge-AI dedicated Google Apps Script endpoint: FAQ and human handoff.
 * Maintainer: Muhammad Farhan
 * Script Properties required: SPREADSHEET_ID and FLOWFORGE_TOKEN.
 * Deploy as Web App only after reviewing access policy. POST JSON:
 * {"token":"YOUR_TOKEN","requestId":"stable-id","data":{...}}
 * Use a separate test spreadsheet. Do not commit secrets.
 */
const SHEET_NAME = "FaqHandoff";
const HEADERS = ["createdAt","requestId","question","matchedFaq","confidence","handoffRequired","status"];
function setupSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Set SPREADSHEET_ID in Script Properties.');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else {
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => current[i] !== h)) throw new Error('Header mismatch in ' + SHEET_NAME + '. Expected: ' + HEADERS.join(', '));
  }
  return 'Ready: ' + SHEET_NAME;
}
function doGet() {
  return output_({ok:true, service:'FlowForge-AI', workflow:"06-faq-human-handoff", sheet:SHEET_NAME});
}
function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty('FLOWFORGE_TOKEN');
  if (!expected) return output_({ok:false,error:'Server token is not configured'});
  let payload;
  try { payload = JSON.parse(e && e.postData && e.postData.contents || '{}'); }
  catch (_) { return output_({ok:false,error:'Invalid JSON'}); }
  if (!payload.token || !constantTimeEqual_(String(payload.token), expected)) return output_({ok:false,error:'Unauthorized'});
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    return output_({ok:false,error:'data must be a JSON object'});
  const requestId = String(payload.requestId || '').trim();
  if (!requestId || requestId.length > 200) return output_({ok:false,error:'requestId is required (max 200 chars)'});
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const id = props.getProperty('SPREADSHEET_ID');
    if (!id) return output_({ok:false,error:'SPREADSHEET_ID is not configured'});
    const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() === 0) return output_({ok:false,error:'Run setupSheet() first'});
    const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    if (HEADERS.some((h, i) => currentHeaders[i] !== h)) return output_({ok:false,error:'Sheet headers do not match; run setupSheet() after backing up data'});
    const idCol = HEADERS.indexOf('requestId') + 1;
    if (idCol > 0 && sheet.getLastRow() > 1) {
      const ids = sheet.getRange(2,idCol,sheet.getLastRow()-1,1).getDisplayValues().flat();
      if (ids.includes(requestId)) return output_({ok:true,duplicate:true,requestId});
    }
    const data = payload.data;
    const values = HEADERS.map(key => key === 'createdAt' ? new Date().toISOString()
      : key === 'requestId' ? requestId : safe_(data[key]));
    sheet.appendRow(values);
    return output_({ok:true,duplicate:false,workflow:"06-faq-human-handoff",requestId,row:sheet.getLastRow()});
  } catch (err) {
    return output_({ok:false,error:String(err && err.message || err).slice(0,250)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
function safe_(value) {
  let s = String(value == null ? '' : value).trim().slice(0,4000);
  // Prevent spreadsheet formula injection from untrusted incoming values.
  if (/^[=+@]/.test(s) || /^-[^0-9]/.test(s)) s = "'" + s;
  return s;
}
function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function constantTimeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
