/** Meeting reminder queue intake for FlowForge-AI.
 * Script Properties: SPREADSHEET_ID and FLOWFORGE_TOKEN.
 * POST: {"token":"...","requestId":"rem-001","data":{"eventId":"calendar-event-1","email":"customer@example.com","remindAt":"2026-10-20T14:00:00Z","channel":"email"}}
 * This endpoint queues/logs requests only; n8n handles Calendar lookup and Gmail delivery.
 */
const SHEET_NAME="MeetingReminders";
const HEADERS=["createdAt","requestId","eventId","email","remindAt","channel","status","sentAt"];
function setupSheet(){
 const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
 if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");
 const ss=SpreadsheetApp.openById(id);let sh=ss.getSheetByName(SHEET_NAME);
 if(!sh)sh=ss.insertSheet(SHEET_NAME);
 if(sh.getLastRow()===0)sh.appendRow(HEADERS);
 else{const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))throw new Error("MeetingReminders headers do not match.");}
 return "Ready: "+SHEET_NAME;
}
function doGet(){return json_({ok:true,workflow:"08-meeting-reminders",status:"ready"});}
function doPost(e){
 const p=PropertiesService.getScriptProperties(),secret=p.getProperty("FLOWFORGE_TOKEN");
 if(!secret)return json_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
 let b;try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return json_({ok:false,status:"rejected",error:"Invalid JSON"});}
 if(String(b.token||"")!==secret)return json_({ok:false,status:"unauthorized",error:"Unauthorized"});
 const d=b.data;if(!d||typeof d!=="object"||Array.isArray(d))return json_({ok:false,status:"rejected",error:"data must be an object"});
 const requestId=String(b.requestId||d.requestId||d.eventId||"").trim(),eventId=String(d.eventId||"").trim(),email=String(d.email||"").trim().toLowerCase(),remindAt=String(d.remindAt||d.startAt||"").trim(),channel=String(d.channel||"email").trim().toLowerCase(),ms=Date.parse(remindAt);
 if(!requestId||requestId.length>200)return json_({ok:false,status:"rejected",error:"requestId required (max 200 chars)"});
 if(!eventId||eventId.length>300)return json_({ok:false,status:"rejected",requestId,error:"eventId required (max 300 chars)"});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>320)return json_({ok:false,status:"rejected",requestId,error:"Valid email required"});
 if(!Number.isFinite(ms))return json_({ok:false,status:"rejected",requestId,error:"remindAt must be a valid date"});
 if(channel!=="email")return json_({ok:false,status:"rejected",requestId,error:"Only email channel is supported"});
 const lock=LockService.getScriptLock();let locked=false;
 try{
  lock.waitLock(10000);locked=true;
  const id=p.getProperty("SPREADSHEET_ID");if(!id)return json_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});
  const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return json_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});
  const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))return json_({ok:false,status:"configuration_error",error:"Sheet headers do not match"});
  if(sh.getLastRow()>1){const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues();const old=rows.find(r=>r[1]===requestId||(r[2]===eventId&&String(r[3]).toLowerCase()===email));if(old)return json_({ok:true,status:"duplicate",duplicate:true,requestId,eventId,existingStatus:old[6]||"",sideEffectsSkipped:true});}
  const status=ms<=Date.now()?"due":"scheduled";
  sh.appendRow([new Date().toISOString(),requestId,safe_(eventId),safe_(email),new Date(ms).toISOString(),channel,status,""]);
  return json_({ok:true,status,duplicate:false,requestId,eventId,email,remindAt:new Date(ms).toISOString(),deliveryPerformed:false,row:sh.getLastRow()});
 }catch(err){return json_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}
 finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,4000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
