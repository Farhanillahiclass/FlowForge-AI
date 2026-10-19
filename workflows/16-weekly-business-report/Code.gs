/** Weekly Business Reporting request registry. This endpoint logs workflow events; it does not perform external side effects.
 * Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN. Run setupSheet() before deploying.
 */
const SHEET_NAME="BusinessReports";
const HEADERS=["createdAt","requestId","periodStart","periodEnd","leads","tickets","revenue","summary","deliveryStatus"];
function setupSheet(){const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");const ss=SpreadsheetApp.openById(id);let sh=ss.getSheetByName(SHEET_NAME);if(!sh)sh=ss.insertSheet(SHEET_NAME);if(sh.getLastRow()===0)sh.appendRow(HEADERS);else assertHeaders_(sh);return "Ready: "+SHEET_NAME;}
function doGet(){return output_({ok:true,workflow:"16-weekly-business-report",status:"ready",sideEffectsPerformed:false});}
function doPost(e){
 const p=PropertiesService.getScriptProperties(),secret=p.getProperty("FLOWFORGE_TOKEN");if(!secret)return output_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
 let b;try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return output_({ok:false,status:"rejected",error:"Invalid JSON"});}
 if(!constantTimeEqual_(String(b.token||""),secret))return output_({ok:false,status:"unauthorized",error:"Unauthorized"});
 const d=b.data;if(!d||typeof d!=="object"||Array.isArray(d))return output_({ok:false,status:"rejected",error:"data must be an object"});
 const requestId=String(b.requestId||d.requestId||d.update_id||"").trim();if(!requestId||requestId.length>200)return output_({ok:false,status:"rejected",error:"requestId is required (max 200 chars)"});
 for(const k of Object.keys(d)){if(typeof d[k]==="string"&&d[k].length>20000)return output_({ok:false,status:"rejected",requestId,error:"Field too long: "+k});}
 
 
 const lock=LockService.getScriptLock();let locked=false;
 try{lock.waitLock(10000);locked=true;const id=p.getProperty("SPREADSHEET_ID");if(!id)return output_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return output_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});assertHeaders_(sh);
 if(sh.getLastRow()>1){const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues();const prior=rows.find(r=>r[HEADERS.indexOf("requestId")]===requestId);if(prior)return output_({ok:true,status:"duplicate",duplicate:true,requestId,sideEffectsSkipped:true});}
 const values=HEADERS.map(k=>k==="createdAt"?new Date().toISOString():k==="requestId"?safe_(requestId):safe_(d[k]));sh.appendRow(values);return output_({ok:true,status:"recorded",duplicate:false,workflow:"16-weekly-business-report",requestId,row:sh.getLastRow(),sideEffectsPerformed:false});
 }catch(err){return output_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function assertHeaders_(sh){const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>h[i]!==v))throw new Error(SHEET_NAME+" headers do not match.");}
function safe_(v){let s=String(v==null?"":typeof v==="object"?JSON.stringify(v):v).trim().slice(0,20000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function constantTimeEqual_(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
function output_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
