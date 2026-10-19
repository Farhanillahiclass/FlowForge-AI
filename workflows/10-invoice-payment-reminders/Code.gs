/** Invoice reminder request intake. Script Properties: SPREADSHEET_ID, FLOWFORGE_TOKEN.
 * Logs a request only; it does not send email or verify payment in external accounting software.
 */
const SHEET_NAME="InvoiceReminders";
const HEADERS=["createdAt","requestId","invoiceId","clientEmail","amount","currency","dueAt","status","lastReminderAt"];
function setupSheet(){
 const p=PropertiesService.getScriptProperties(),id=p.getProperty("SPREADSHEET_ID");if(!id)throw new Error("Set SPREADSHEET_ID in Script Properties.");
 const ss=SpreadsheetApp.openById(id);let sh=ss.getSheetByName(SHEET_NAME);if(!sh)sh=ss.insertSheet(SHEET_NAME);
 if(sh.getLastRow()===0)sh.appendRow(HEADERS);else{const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))throw new Error("InvoiceReminders headers do not match.");}
 return "Ready: "+SHEET_NAME;
}
function doGet(){return output_({ok:true,workflow:"10-invoice-payment-reminders",status:"ready"});}
function doPost(e){
 const p=PropertiesService.getScriptProperties(),secret=p.getProperty("FLOWFORGE_TOKEN");if(!secret)return output_({ok:false,status:"configuration_error",error:"FLOWFORGE_TOKEN is not configured"});
 let b;try{b=JSON.parse(e&&e.postData&&e.postData.contents||"{}");}catch(err){return output_({ok:false,status:"rejected",error:"Invalid JSON"});}
 if(!constantTimeEqual_(String(b.token||""),secret))return output_({ok:false,status:"unauthorized",error:"Unauthorized"});
 const d=b.data;if(!d||typeof d!=="object"||Array.isArray(d))return output_({ok:false,status:"rejected",error:"data must be an object"});
 const requestId=String(b.requestId||d.requestId||d.eventId||"").trim(),invoiceId=String(d.invoiceId||d.id||"").trim(),email=String(d.clientEmail||d.email||d.billingEmail||"").trim().toLowerCase(),amountRaw=String(d.amount==null?"":d.amount).trim(),amount=Number(amountRaw),currency=String(d.currency||"").trim().toUpperCase(),dueRaw=String(d.dueAt||d.dueDate||"").trim(),due=Date.parse(dueRaw),status=String(d.status||"").trim().toLowerCase(),last=String(d.lastReminderAt||"").trim();
 if(!requestId||requestId.length>200)return output_({ok:false,status:"rejected",error:"requestId required (max 200 chars)"});
 if(!invoiceId||invoiceId.length>200)return output_({ok:false,status:"rejected",requestId,error:"invoiceId required (max 200 chars)"});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>320)return output_({ok:false,status:"rejected",requestId,error:"Valid client email required"});
 if(!amountRaw||!Number.isFinite(amount)||amount<0)return output_({ok:false,status:"rejected",requestId,error:"amount must be a non-negative number"});
 if(!/^[A-Z]{3}$/.test(currency))return output_({ok:false,status:"rejected",requestId,error:"currency must be a 3-letter code"});
 if(!Number.isFinite(due))return output_({ok:false,status:"rejected",requestId,error:"dueAt/dueDate must be a valid date"});
 if(!["unpaid","paid","void","cancelled"].includes(status))return output_({ok:false,status:"rejected",requestId,error:"status must be unpaid, paid, void, or cancelled"});
 if(last&&!Number.isFinite(Date.parse(last)))return output_({ok:false,status:"rejected",requestId,error:"lastReminderAt must be a valid date or blank"});
 if(status!=="unpaid")return output_({ok:true,status:"not_eligible",requestId,invoiceId,reason:"invoice status is not unpaid",emailSent:false});
 const lock=LockService.getScriptLock();let locked=false;
 try{
  lock.waitLock(10000);locked=true;const id=p.getProperty("SPREADSHEET_ID");if(!id)return output_({ok:false,status:"configuration_error",error:"SPREADSHEET_ID is not configured"});
  const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);if(!sh||sh.getLastRow()===0)return output_({ok:false,status:"configuration_error",error:"Run setupSheet() first"});
  const h=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];if(HEADERS.some((v,i)=>v!==h[i]))return output_({ok:false,status:"configuration_error",error:"InvoiceReminders headers do not match"});
  if(sh.getLastRow()>1){const rows=sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues();const old=rows.find(r=>r[1]===requestId||(r[2]===invoiceId&&r[3].toLowerCase()===email&&r[7]==="requested"));if(old)return output_({ok:true,status:"duplicate",duplicate:true,requestId,invoiceId,existingStatus:old[7],sideEffectsSkipped:true});}
  sh.appendRow([new Date().toISOString(),requestId,safe_(invoiceId),safe_(email),amount,currency,new Date(due).toISOString(),status,safe_(last)]);
  return output_({ok:true,status:"requested",duplicate:false,requestId,invoiceId,emailSent:false,row:sh.getLastRow()});
 }catch(err){return output_({ok:false,status:"failed",error:String(err&&err.message||err).slice(0,250)});}
 finally{if(locked){try{lock.releaseLock();}catch(err){}}}
}
function safe_(v){let s=String(v==null?"":v).trim().slice(0,4000);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;return s;}
function constantTimeEqual_(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
function output_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);}
