/** FlowForge-AI Google Sheets Gateway — Muhammad Farhan
 * Add to Apps Script attached to a Google Sheet.
 * Script Properties required: SPREADSHEET_ID and FLOWFORGE_TOKEN.
 * Create tabs Leads, Support, Feedback with setupSheetTabs().
 * Deploy as web app; n8n sends JSON {kind:"lead"|"support"|"feedback", requestId:"stable-id", data:{...}}.
 *
 * SECURITY: Apps Script web app event objects do not reliably expose arbitrary
 * HTTP headers. This sample supports a token in the query parameter as a
 * compatibility fallback; query tokens can leak into logs. For sensitive or
 * production use, put an authenticated gateway in front of Apps Script or
 * implement an organisation-approved identity design. Do not use public
 * anonymous access for confidential client data.
 */
function setupSheetTabs() {
  const p=PropertiesService.getScriptProperties();
  const id=p.getProperty('SPREADSHEET_ID');
  if(!id) throw new Error('Set SPREADSHEET_ID in Script Properties.');
  const ss=SpreadsheetApp.openById(id);
  const schemas={
    Leads:['createdAt','name','email','company','source','message','status','requestId'],
    Support:['createdAt','ticketId','name','email','category','priority','message','status','requestId'],
    Feedback:['createdAt','name','email','rating','feedback','status','requestId']
  };
  Object.entries(schemas).forEach(([name,headers])=>{
    let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name);
    if(sh.getLastRow()===0) sh.appendRow(headers);
  });
  return 'Sheet tabs ready';
}
function doGet(){
  return json_({ok:true,service:'FlowForge-AI Sheets Gateway',version:'1.0'});
}
function doPost(e){
  const p=PropertiesService.getScriptProperties();
  const expected=p.getProperty('FLOWFORGE_TOKEN');
  if(!expected) return json_({ok:false,error:'Server token is not configured'});
  let payload;
  try {
    const queryToken=(e&&e.parameter&&e.parameter.token)||'';
    if(queryToken!==expected) return json_({ok:false,error:'Unauthorized'});
    payload=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  } catch(err) { return json_({ok:false,error:'Invalid request'}); }
  const kind=String(payload.kind||'').toLowerCase();
  const tab={lead:'Leads',support:'Support',feedback:'Feedback'}[kind];
  if(!tab) return json_({ok:false,error:'kind must be lead, support or feedback'});
  const id=p.getProperty('SPREADSHEET_ID');
  if(!id) return json_({ok:false,error:'SPREADSHEET_ID is not configured'});
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh=SpreadsheetApp.openById(id).getSheetByName(tab);
    if(!sh) return json_({ok:false,error:'Run setupSheetTabs first'});
    const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
    const d=payload.data||{}, requestId=String(payload.requestId||Utilities.getUuid());
    const idCol=headers.indexOf('requestId')+1;
    if(idCol>0&&sh.getLastRow()>1){
      const ids=sh.getRange(2,idCol,sh.getLastRow()-1,1).getDisplayValues().flat();
      if(ids.includes(requestId)) return json_({ok:true,duplicate:true,requestId});
    }
    const values={
      createdAt:new Date().toISOString(),name:safe_(d.name),email:safe_(d.email),
      company:safe_(d.company),source:safe_(d.source),message:safe_(d.message),
      status:safe_(d.status||'new'),requestId,
      ticketId:safe_(d.ticketId||('TKT-'+Date.now())),category:safe_(d.category),
      priority:safe_(d.priority||'normal'),rating:Number(d.rating)||'',feedback:safe_(d.feedback)
    };
    sh.appendRow(headers.map(h=>values[h]===undefined?'':values[h]));
    return json_({ok:true,duplicate:false,kind,requestId,row:sh.getLastRow()});
  } catch(err) {
    return json_({ok:false,error:String(err.message||err).slice(0,200)});
  } finally { lock.releaseLock(); }
}
function safe_(v){
  const s=String(v==null?'':v).trim().slice(0,4000);
  return /^[=+@]/.test(s)||/^-[^0-9]/.test(s)?"'"+s:s;
}
function json_(o){
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
