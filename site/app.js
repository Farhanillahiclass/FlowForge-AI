(() => {
  "use strict";
  const owner = "Farhanillahiclass";
  const repo = "FlowForge-AI";
  const workflows = [
    {n:1,slug:"01-lead-capture-crm",name:"Lead Capture & CRM",category:"Sales & CRM",icon:"↗",desc:"Validate incoming lead data, save a clean record, and route the next sales step.",keywords:"sales crm leads spreadsheet capture"},
    {n:2,slug:"02-lead-scoring-routing",name:"Lead Scoring & Routing",category:"Sales & CRM",icon:"◎",desc:"Calculate a configurable lead score and route hot, warm, and cold prospects.",keywords:"sales scoring priority routing qualification"},
    {n:3,slug:"03-email-follow-up-sequence",name:"Email Follow-up Sequence",category:"Sales & CRM",icon:"✉",desc:"Organize consent-aware follow-up tasks and delivery steps for sales leads.",keywords:"email sales followup sequence consent"},
    {n:4,slug:"04-inbox-triage-assistant",name:"Inbox Triage Assistant",category:"Productivity & Support",icon:"⌕",desc:"Classify incoming messages and route urgent items to the right person.",keywords:"inbox email triage productivity priority"},
    {n:5,slug:"05-customer-support-desk",name:"Customer Support Desk",category:"Productivity & Support",icon:"◈",desc:"Validate support requests, assign priority, and coordinate team notifications.",keywords:"support tickets customer service helpdesk"},
    {n:6,slug:"06-faq-human-handoff",name:"FAQ & Human Handoff",category:"Productivity & Support",icon:"?",desc:"Match approved FAQs and send uncertain or sensitive questions to a person.",keywords:"faq support chatbot escalation human"},
    {n:7,slug:"07-meeting-booking-system",name:"Meeting Booking System",category:"Productivity & Support",icon:"▦",desc:"Coordinate booking requests with calendar availability and confirmation steps.",keywords:"meeting booking calendar scheduling appointment"},
    {n:8,slug:"08-meeting-reminders",name:"Meeting Reminders",category:"Productivity & Support",icon:"◷",desc:"Find meetings due for reminders, notify participants, and log outcomes.",keywords:"meeting reminders calendar notification schedule"},
    {n:9,slug:"09-client-onboarding",name:"Client Onboarding",category:"Operations & Reliability",icon:"⌁",desc:"Coordinate the checklist and follow-up tasks for new client onboarding.",keywords:"client onboarding operations checklist"},
    {n:10,slug:"10-invoice-payment-reminders",name:"Invoice & Payment Reminders",category:"Operations & Reliability",icon:"＄",desc:"Apply reminder rules to overdue invoices and record delivery outcomes.",keywords:"invoice finance payments reminders accounting"},
    {n:11,slug:"11-content-creation-approval",name:"Content Creation & Approval",category:"Content & Marketing",icon:"✎",desc:"Turn a brief into a content draft and keep review ahead of publication.",keywords:"content copywriting approval marketing ai"},
    {n:12,slug:"12-instagram-publishing-pipeline",name:"Instagram Publishing Pipeline",category:"Content & Marketing",icon:"◎",desc:"Validate social content, require approval, and coordinate Instagram publishing.",keywords:"instagram social media publish marketing meta"},
    {n:13,slug:"13-youtube-publishing-assistant",name:"YouTube Publishing Assistant",category:"Content & Marketing",icon:"▷",desc:"Validate video metadata and coordinate upload and processing steps.",keywords:"youtube video upload creator media"},
    {n:14,slug:"14-content-repurposing",name:"Content Repurposing",category:"Content & Marketing",icon:"⤴",desc:"Adapt a source asset into platform-specific drafts for review.",keywords:"repurpose content social media writing"},
    {n:15,slug:"15-newsletter-campaign-builder",name:"Newsletter Campaign Builder",category:"Content & Marketing",icon:"▤",desc:"Prepare campaigns for consented audiences with suppression and logging.",keywords:"newsletter email campaign marketing subscribers"},
    {n:16,slug:"16-weekly-business-report",name:"Weekly Business Reporting",category:"Operations & Reliability",icon:"▥",desc:"Aggregate business metrics into a recurring report and archive it.",keywords:"analytics reporting metrics dashboard business"},
    {n:17,slug:"17-feedback-routing",name:"Feedback & Escalation",category:"Operations & Reliability",icon:"↗",desc:"Store customer feedback and privately route low-score cases for follow-up.",keywords:"feedback customer experience escalation rating"},
    {n:18,slug:"18-workflow-error-monitor",name:"Workflow Error Monitor",category:"Operations & Reliability",icon:"⌁",desc:"Normalize execution failures, log error events, and alert an operator.",keywords:"error monitoring reliability logs alerts"},
    {n:19,slug:"19-api-health-monitor",name:"API Health Monitor",category:"Operations & Reliability",icon:"⌘",desc:"Check configured endpoints and report failure or recovery events.",keywords:"api health uptime monitoring status"},
    {n:20,slug:"20-telegram-business-assistant",name:"Telegram Business Assistant",category:"Productivity & Support",icon:"➤",desc:"Parse supported Telegram commands and route approved business actions.",keywords:"telegram messaging bot commands assistant"}
  ];
  const grid = document.querySelector("#workflow-grid");
  const search = document.querySelector("#workflow-search");
  const sort = document.querySelector("#sort-select");
  const filters = document.querySelector("#category-filters");
  const count = document.querySelector("#results-count");
  const empty = document.querySelector("#empty-state");
  const clear = document.querySelector("#clear-filters");
  let category = "All";
  const iconExternal = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>';
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function links(item){
    const base = "https://github.com/" + owner + "/" + repo + "/blob/main/workflows/" + item.slug + "/";
    return {json:base+"workflow.json",readme:base+"README.md"};
  }
  function card(item,index){
    const url=links(item);
    return '<article class="workflow-card" data-family="'+esc(item.category)+'" style="animation-delay:'+Math.min(index*22,220)+'ms">'+
      '<div class="card-top"><span class="workflow-number">FLOW / '+String(item.n).padStart(2,"0")+'</span><span class="category-label">'+esc(item.category)+'</span></div>'+
      '<div class="card-icon" aria-hidden="true">'+esc(item.icon)+'</div>'+
      '<h3>'+esc(item.name)+'</h3><p>'+esc(item.desc)+'</p>'+
      '<div class="card-footer"><a class="card-action" href="'+url.json+'" target="_blank" rel="noreferrer">'+iconExternal+' JSON export</a><span class="action-divider"></span><a class="card-action secondary" href="'+url.readme+'" target="_blank" rel="noreferrer">Setup guide '+iconExternal+'</a></div>'+
      '<div class="card-utility"><button class="copy-json-link" type="button" data-copy-url="'+url.json+'" aria-label="Copy JSON link for '+esc(item.name)+'">Copy JSON link <span aria-hidden="true">⧉</span></button><span class="card-safety"><span aria-hidden="true">●</span> Configure before activation</span></div></article>';
  }
  function render(){
    const q=search.value.trim().toLowerCase();
    let shown=workflows.filter(w=>(category==="All"||w.category===category)&&(!q||(w.name+" "+w.desc+" "+w.category+" "+w.keywords).toLowerCase().includes(q)));
    if(sort.value==="az")shown.sort((a,b)=>a.name.localeCompare(b.name));else shown.sort((a,b)=>a.n-b.n);
    grid.innerHTML=shown.map(card).join("");
    grid.hidden=shown.length===0;
    empty.hidden=shown.length!==0;
    count.textContent="Showing "+shown.length+" of "+workflows.length+" workflows";
    clear.hidden=category==="All"&&!q;
    document.querySelector("#total-count").textContent=String(workflows.length).padStart(2,"0");
    filters.querySelector('[data-category="All"] span').textContent=workflows.length;
    filters.querySelectorAll("[data-category]").forEach(btn=>{
      const cat=btn.dataset.category;
      btn.setAttribute("aria-pressed",String(cat===category));
      btn.classList.toggle("is-active",cat===category);
      if(cat!=="All"){
        const n=workflows.filter(w=>w.category===cat).length;
        let badge=btn.querySelector("span");
        if(!badge){badge=document.createElement("span");btn.append(badge);}
        badge.textContent=n;
      }
    });
  }
  grid.addEventListener("click",async e=>{
    const button=e.target.closest("[data-copy-url]");
    if(!button)return;
    const url=button.dataset.copyUrl;
    try{
      await navigator.clipboard.writeText(url);
      button.innerHTML='Copied link <span aria-hidden="true">✓</span>';
      button.classList.add("is-copied");
      const toast=document.querySelector("#gallery-toast");
      if(toast){toast.textContent="Canonical workflow JSON link copied";toast.classList.add("is-visible");}
      window.setTimeout(()=>{button.innerHTML='Copy JSON link <span aria-hidden="true">⧉</span>';button.classList.remove("is-copied");if(toast)toast.classList.remove("is-visible");},2200);
    }catch(error){
      window.prompt("Copy this canonical workflow JSON link:",url);
    }
  });
  filters.addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;category=btn.dataset.category;render();});
  search.addEventListener("input",render);
  sort.addEventListener("change",render);
  clear.addEventListener("click",()=>{category="All";search.value="";render();search.focus();});
  document.querySelector("#reset-search").addEventListener("click",()=>{category="All";search.value="";render();search.focus();});
  document.addEventListener("keydown",e=>{if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();search.focus();}if(e.key==="Escape"&&document.activeElement===search){search.value="";render();}});
  render();
})();