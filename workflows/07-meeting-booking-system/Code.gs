/** Meeting booking request intake for FlowForge-AI.
 * Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 * POST: {"token":"...","requestId":"book-001","data":{"name":"Test","email":"test@example.com","start":"2026-10-20T15:00:00+05:00","end":"2026-10-20T15:30:00+05:00","timezone":"Asia/Karachi","topic":"Discovery call"}}
 * Logs booking requests only. This Apps Script does not check Google Calendar availability or create events.
 */
const SHEET_NAME = "Bookings";
const HEADERS = ["createdAt","requestId","bookingId","name","email","startAt","endAt","timezone","status"];
function setupSheet(){
  const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss=SpreadsheetApp.openById(id);let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh)sh=ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0)sh.appendRow(HEADERS);
  else{const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))throw new Error("Bookings headers do not match.");}
  return "Ready: "+SHEET_NAME;
}
function doGet(){return json_({ok:true,workflow:"07-meeting-booking-system",status:"ready"});}
function doPost(e){
  const p=PropertiesService.getScriptProperties(),secret=p.getProperty("FLOWFORGE_TOKEN");
  if(!secret)return json_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
  let b;try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return json_({ok:false,status:"rejected",error:"Invalid JSON"});}
  if(String(b.token||"")!==secret)return json_({ok:false,status:"unauthorized",error:"Unauthorized"});
  const d=b.data;if(!d||typeof d!=="object"||Array.isArray(d))return json_({ok:false,status:"rejected",error:"data must be an object"});
  const requestId=String(b.requestId||d.requestId||d.eventId||"").trim(),name=String(d.name||"").trim(),email=String(d.email||"").trim().toLowerCase();
  const startRaw=String(d.start||d.startAt||"").trim(),endRaw=String(d.end||d.endAt||"").trim(),start=Date.parse(startRaw),end=Date.parse(endRaw),timezone=String(d.timezone||"UTC").trim(),topic=String(d.topic||"Discovery call").trim();
  if(!requestId||requestId.length>200)return json_({ok:false,status:"rejected",error:"requestId required (max 200 chars)"});
  if(!name||name.length>200)return json_({ok:false,status:"rejected",requestId,error:"name required (max 200 chars)"});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>320)return json_({ok:false,status:"rejected",requestId,error:"Valid email required"});
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||start<=Date.now())return json_({ok:false,status:"rejected",requestId,error:"Provide a future start and an end time later than start"});
  if(!/[zZ]|[+-]\d{2}:?\d{2}$/.test(startRaw)||!/[zZ]|[+-]\d{2}:?\d{2}$/.test(endRaw))return json_({ok:false,status:"rejected",requestId,error:"Use ISO-8601 timestamps with explicit timezone offsets"});
  if(!timezone||timezone.length>100||topic.length>200)return json_({ok:false,status:"rejected",requestId,error:"Timezone or topic is invalid"});
  const bookingId="BOOK-"+requestId.replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,180),lock=LockService.getScriptLock();let locked=false;
  try{
    lock.waitLock(10000);locked=true;
    const id=p.getProperty("SPREADSHEET_ID");if(!id)return json_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});
    const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return json_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});
    const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))return json_({ok:false,status:"configuration_error",error:"Sheet headers do not match"});
    if(sh.getLastRow()>1){const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues();const old=rows.find(r=>r[1]===requestId||r[2]===bookingId);if(old)return json_({ok:true,status:"duplicate",duplicate:true,requestId,bookingId,existingStatus:old[8]||"",sideEffectsSkipped:true});}
    sh.appendRow([new Date().toISOString(),requestId,bookingId,safe_(name),safe_(email),new Date(start).toISOString(),new Date(end).toISOString(),safe_(timezone),"requested"]);
    return json_({ok:true,status:"requested",duplicate:false,requestId,bookingId,startAt:new Date(start).toISOString(),endAt:new Date(end).toISOString(),timezone,calendarEventCreated:false,row:sh.getLastRow()});
  }catch(err){return json_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}
  finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,4000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
