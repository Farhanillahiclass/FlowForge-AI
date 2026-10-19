/** Instagram publishing request registry. This endpoint queues requests only; it never publishes to Instagram.
 * Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 */
const SHEET_NAME="InstagramQueue";
const HEADERS=["createdAt","requestId","contentId","caption","mediaUrl","approvalStatus","publishStatus","publishedAt","error"];
function setupSheet(){const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");const ss=SpreadsheetApp.openById(id);let sh=ss.getSheetByName(SHEET_NAME);if(!sh)sh=ss.insertSheet(SHEET_NAME);if(sh.getLastRow()===0)sh.appendRow(HEADERS);else assertHeaders_(sh);return "Ready: "+SHEET_NAME;}
function doGet(){return output_({ok:true,workflow:"12-instagram-publishing-pipeline",status:"ready",publishingPerformed:false});}
function doPost(e){
 const p=PropertiesService.getScriptProperties(),secret=p.getProperty("FLOWFORGE_TOKEN");if(!secret)return output_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
 let b;try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return output_({ok:false,status:"rejected",error:"Invalid JSON"});}
 if(!constantTimeEqual_(String(b.token||""),secret))return output_({ok:false,status:"unauthorized",error:"Unauthorized"});
 const d=b.data;if(!d||typeof d!=="object"||Array.isArray(d))return output_({ok:false,status:"rejected",error:"data must be an object"});
 const requestId=String(b.requestId||d.requestId||"").trim(),contentId=String(d.contentId||requestId).trim(),caption=String(d.caption||"").trim(),mediaUrl=String(d.mediaUrl||d.imageUrl||"").trim(),approval=String(d.approvalStatus||"pending").trim().toLowerCase(),status=String(d.publishStatus||"queued").trim().toLowerCase();
 if(!requestId||requestId.length>200)return output_({ok:false,status:"rejected",error:"requestId is required (max 200 chars)"});
 if(!caption||caption.length>2200)return output_({ok:false,status:"rejected",requestId,error:"caption must contain 1–2200 characters"});
 if(!/^https:\/\//i.test(mediaUrl)||mediaUrl.length>2000)return output_({ok:false,status:"rejected",requestId,error:"mediaUrl must be a public HTTPS URL"});
 if(!["pending","approved","rejected"].includes(approval))return output_({ok:false,status:"rejected",requestId,error:"approvalStatus must be pending, approved, or rejected"});
 if(!["queued","processing","published","failed"].includes(status))return output_({ok:false,status:"rejected",requestId,error:"publishStatus must be queued, processing, published, or failed"});
 const lock=LockService.getScriptLock();let locked=false;
 try{lock.waitLock(10000);locked=true;const id=p.getProperty("SPREADSHEET_ID");if(!id)return output_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return output_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});assertHeaders_(sh);
  if(sh.getLastRow()>1){const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues();const old=rows.find(r=>r[1]===requestId);if(old)return output_({ok:true,status:"duplicate",duplicate:true,requestId,existingPublishStatus:old[6],sideEffectsSkipped:true});}
  sh.appendRow([new Date().toISOString(),safe_(requestId),safe_(contentId),safe_(caption),safe_(mediaUrl),approval,status,"",""]);return output_({ok:true,status:"queued",duplicate:false,requestId,contentId,approvalStatus:approval,publishStatus:status,publishingPerformed:false,row:sh.getLastRow()});
 }catch(err){return output_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function assertHeaders_(sh){const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>h[i]!==v))throw new Error("InstagramQueue headers do not match.");}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,4000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function constantTimeEqual_(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
function output_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
