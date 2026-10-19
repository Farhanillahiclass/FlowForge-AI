/** FlowForge-AI content draft + approval registry.
 * Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 * POST draft: {"token":"...","action":"create","requestId":"content-001","data":{"briefId":"brief-001","platform":"linkedin","brief":"...","draft":"..."}}
 * POST decision: {"token":"...","action":"decision","requestId":"content-001","data":{"approvalStatus":"approved|rejected","reviewer":"editor@example.com","reviewComment":"..."}}
 * This endpoint records decisions; it does not publish content to social platforms.
 */
const SHEET_NAME="ContentApproval";
const AUDIT_SHEET_NAME="ContentApprovalAudit";
const HEADERS=["createdAt","requestId","briefId","platform","brief","draft","approvalStatus","reviewer","reviewedAt"];
const AUDIT_HEADERS=["timestamp","requestId","action","oldStatus","newStatus","reviewer","comment"];
function setupSheet(){
 const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
 if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");
 const ss=SpreadsheetApp.openById(id);
 ensureHeaders_(ss,SHEET_NAME,HEADERS);ensureHeaders_(ss,AUDIT_SHEET_NAME,AUDIT_HEADERS);
 return "Ready: "+SHEET_NAME+" and "+AUDIT_SHEET_NAME;
}
function ensureHeaders_(ss,name,headers){
 let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);
 if(sh.getLastRow()===0)sh.appendRow(headers);
 else{const h=sh.getRange(1,1,1,headers.length).getDisplayValues()[0];if(headers.some((v,i)=>h[i]!==v))throw new Error(name+" headers do not match.");}
 return sh;
}
function doGet(){return output_({ok:true,workflow:"11-content-creation-approval",status:"ready"});}
function doPost(e){
 const props=PropertiesService.getScriptProperties(),secret=props.getProperty("FLOWFORGE_TOKEN");
 if(!secret)return output_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
 let p;try{p=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return output_({ok:false,status:"rejected",error:"Invalid JSON"});}
 if(!constantTimeEqual_(String(p.token||""),secret))return output_({ok:false,status:"unauthorized",error:"Unauthorized"});
 const action=String(p.action||"create").toLowerCase(),d=p.data;
 if(!d||typeof d!=="object"||Array.isArray(d))return output_({ok:false,status:"rejected",error:"data must be an object"});
 const requestId=String(p.requestId||d.requestId||"").trim();
 if(!requestId||requestId.length>200)return output_({ok:false,status:"rejected",error:"requestId is required (max 200 chars)"});
 const lock=LockService.getScriptLock();let locked=false;
 try{
  lock.waitLock(10000);locked=true;
  const id=props.getProperty("SPREADSHEET_ID");if(!id)return output_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});
  const ss=SpreadsheetApp.openById(id),sh=ss.getSheetByName(SHEET_NAME),audit=ss.getSheetByName(AUDIT_SHEET_NAME);
  if(!sh||!audit)return output_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});
  assertHeaders_(sh,HEADERS);assertHeaders_(audit,AUDIT_HEADERS);
  const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues():[];
  const idx=rows.findIndex(r=>r[1]===requestId);
  if(action==="create"){
   const briefId=String(d.briefId||requestId).trim(),platform=String(d.platform||"").trim().toLowerCase(),brief=String(d.brief||"").trim(),draft=String(d.draft||"").trim();
   if(!brief||brief.length<20||brief.length>10000)return output_({ok:false,status:"rejected",requestId,error:"brief must contain 20–10000 characters"});
   if(!draft||draft.length>20000)return output_({ok:false,status:"rejected",requestId,error:"draft is required (max 20000 characters)"});
   if(!platform||platform.length>100)return output_({ok:false,status:"rejected",requestId,error:"platform is required (max 100 chars)"});
   if(idx>=0)return output_({ok:true,status:"duplicate",duplicate:true,requestId,approvalStatus:rows[idx][6],sideEffectsSkipped:true});
   sh.appendRow([new Date().toISOString(),requestId,safe_(briefId),safe_(platform),safe_(brief),safe_(draft),"pending", "", ""]);
   audit.appendRow([new Date().toISOString(),requestId,"draft-created","", "pending","", ""]);
   return output_({ok:true,status:"pending",duplicate:false,requestId,row:sh.getLastRow(),published:false});
  }
  if(action==="decision"){
   if(idx<0)return output_({ok:false,status:"not_found",requestId,error:"No draft exists for requestId"});
   const next=String(d.approvalStatus||"").trim().toLowerCase(),reviewer=String(d.reviewer||"").trim().toLowerCase(),comment=String(d.reviewComment||"").trim();
   if(!["approved","rejected"].includes(next))return output_({ok:false,status:"rejected",requestId,error:"approvalStatus must be approved or rejected"});
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer)||reviewer.length>320)return output_({ok:false,status:"rejected",requestId,error:"Valid reviewer email is required"});
   const rowNumber=idx+2,old=String(rows[idx][6]||"pending").toLowerCase();
   if(old==="approved"||old==="rejected")return output_({ok:false,status:"conflict",requestId,error:"Decision is already final",existingStatus:old});
   if(old!=="pending")return output_({ok:false,status:"conflict",requestId,error:"Draft is not pending",existingStatus:old});
   const now=new Date().toISOString();
   sh.getRange(rowNumber,7,1,3).setValues([[next,safe_(reviewer),now]]);
   audit.appendRow([now,requestId,"approval-decision",old,next,safe_(reviewer),safe_(comment)]);
   return output_({ok:true,status:next,requestId,reviewer,reviewedAt:now,published:false,publicationRequired:false});
  }
  return output_({ok:false,status:"rejected",requestId,error:"action must be create or decision"});
 }catch(err){return output_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}
 finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function assertHeaders_(sh,headers){const h=sh.getRange(1,1,1,headers.length).getDisplayValues()[0];if(headers.some((v,i)=>h[i]!==v))throw new Error(sh.getName()+" headers do not match.");}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,20000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function constantTimeEqual_(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function output_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
