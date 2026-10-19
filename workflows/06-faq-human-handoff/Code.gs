/** FAQ/human-handoff intake. Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 * POST JSON: {"token":"...","requestId":"faq-001","data":{"question":"What is pricing?","email":"customer@example.com"}}
 * Logs the decision; does not send email.
 */
const SHEET_NAME = "FaqHandoff";
const HEADERS = ["createdAt","requestId","question","matchedFaq","confidence","handoffRequired","status"];
function setupSheet() {
  const id=PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if(!id) throw new Error("Set SPREADSHEET_ID in Script Properties.");
  const ss=SpreadsheetApp.openById(id); let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh) sh=ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0) sh.appendRow(HEADERS);
  else { const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0]; if(HEADERS.some((v,i)=>v!==h[i])) throw new Error("FaqHandoff headers do not match."); }
  return "Ready: "+SHEET_NAME;
}
function doGet(){return json_({ok:true,workflow:"06-faq-human-handoff",status:"ready"});}
function doPost(e){
  const p=PropertiesService.getScriptProperties(), secret=p.getProperty("FLOWFORGE_TOKEN");
  if(!secret)return json_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
  let b; try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return json_({ok:false,status:"rejected",error:"Invalid JSON"});}
  if(String(b.token||"")!==secret)return json_({ok:false,status:"unauthorized",error:"Unauthorized"});
  const d=b.data; if(!d||typeof d!=="object"||Array.isArray(d))return json_({ok:false,status:"rejected",error:"data must be an object"});
  const requestId=String(b.requestId||d.requestId||d.eventId||"").trim(), question=String(d.question||d.message||"").trim(), email=String(d.email||"").trim().toLowerCase();
  if(!requestId||requestId.length>200)return json_({ok:false,status:"rejected",error:"requestId required (max 200 chars)"});
  if(!question||question.length>10000)return json_({ok:false,status:"rejected",requestId,error:"question required (max 10000 chars)"});
  const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), m=matchFaq_(question), handoff=!m||!validEmail;
  const result={ok:true,status:handoff?"human_review_required":"faq_match",requestId,matchedFaq:m?m.key:"",answer:m?m.answer:"A support specialist will follow up.",confidence:m?0.8:0,handoffRequired:handoff,emailValid:validEmail,notification:"not_sent_by_apps_script"};
  const lock=LockService.getScriptLock();let locked=false;
  try{
    lock.waitLock(10000);locked=true;
    const id=p.getProperty("SPREADSHEET_ID");if(!id)return json_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});
    const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return json_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});
    const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))return json_({ok:false,status:"configuration_error",error:"Sheet headers do not match"});
    if(sh.getLastRow()>1){const ids=sh.getRange(2,2,sh.getLastRow()-1,1).getDisplayValues().flat();if(ids.includes(requestId))return json_({ok:true,status:"duplicate",duplicate:true,requestId,sideEffectsSkipped:true});}
    sh.appendRow([new Date().toISOString(),requestId,safe_(question),m?m.key:"",m?0.8:0,handoff,result.status]);result.row=sh.getLastRow();result.duplicate=false;return json_(result);
  }catch(err){return json_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}
  finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function matchFaq_(question){
  const q=String(question).toLowerCase(), faqs=[
    {key:"pricing",keys:["pricing","price","cost"],answer:"Our team can share current pricing after learning your requirements."},
    {key:"hours",keys:["hours","timing","open"],answer:"Please share your timezone so our team can confirm availability."},
    {key:"refund",keys:["refund","return"],answer:"A support specialist will review your request."}
  ];
  return faqs.find(f=>f.keys.some(k=>q.includes(k)))||null;
}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,10000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
