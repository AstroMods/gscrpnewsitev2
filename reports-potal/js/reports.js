(function(){
const C=window.GSC_CONFIG,E=s=>GSC.esc(s);let TPL=[],cur=null;
const KEY="gsc_demo_reports";
window.GSC_STORE={load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}},save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){GSC.toast("Could not save in this browser.")}}};
window.GSC_loadTemplates=()=>fetch(C.reports.templatesUrl).then(r=>{if(!r.ok)throw 0;return r.json()}).then(j=>TPL=j.templates);
function ref(){const d=new Date(),p=n=>String(n).padStart(2,"0");return`GSC-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
function field(f){const id="f_"+f.name,rq=f.required?" req":"",ph=f.placeholder?` placeholder="${E(f.placeholder)}"`:"";let h=`<div><label class="${rq}" for="${id}">${E(f.label)}</label>`;
 if(f.type==="select")h+=`<select id="${id}" name="${f.name}"><option value="">Select…</option>${f.options.map(o=>`<option>${E(o)}</option>`).join("")}</select>`;
 else if(f.type==="multiselect")h=`<fieldset style="border:0;padding:0;margin:0"><legend class="lbl${rq}">${E(f.label)}</legend><div class="checks" id="${id}">${f.options.map(o=>`<label><input type="checkbox" name="${f.name}" value="${E(o)}">${E(o)}</label>`).join("")}</div></fieldset>`;
 else if(f.type==="textarea")h+=`<textarea id="${id}" name="${f.name}"${ph}></textarea>`;
 else h+=`<input id="${id}" name="${f.name}" type="${f.type}"${ph}>`;
 return h+`<div class="err" id="e_${f.name}" role="alert"></div></div>`}
function build(t){cur=t;const box=document.getElementById("form-area");
 box.innerHTML=`<h2>${E(t.title)}</h2><p class="hint">${E(t.description)} Fields marked * are required.</p><form id="rf" novalidate>
 <div class="row"><div><label class="req" for="f_submitter">Your name or Discord tag</label><input id="f_submitter" name="submitter"><div class="err" id="e_submitter" role="alert"></div></div>
 <div><label for="f_priority">Priority</label><select id="f_priority" name="priority">${C.priorities.map(p=>`<option ${p==="Medium"?"selected":""}>${p}</option>`).join("")}</select></div></div>
 <div class="row"><div><label for="f_date">Incident date</label><input id="f_date" name="incidentDate" type="date"></div><div><label for="f_time">Incident time</label><input id="f_time" name="incidentTime" type="time"></div></div>
 ${t.fields.map(field).join("")}
 <label for="f_evidence">Evidence links (one per line)</label><textarea id="f_evidence" name="evidence" placeholder="https://…"></textarea><div class="err" id="e_evidence" role="alert"></div>
 <div class="actions"><button class="primary" type="submit">Review and submit</button><button type="reset">Clear form</button></div></form>`;
 document.getElementById("rf").onsubmit=e=>{e.preventDefault();review()}}
function collect(){const fd=new FormData(document.getElementById("rf")),o={};
 for(const k of new Set(fd.keys())){const v=fd.getAll(k);o[k]=v.length>1?v.join(", "):v[0]}return o}
function validate(d){let ok=true;const set=(n,m)=>{const el=document.getElementById("e_"+n);if(el)el.textContent=m||"";const i=document.querySelector(`[name=${n}]`);if(i)i.setAttribute("aria-invalid",!!m);if(m)ok=false};
 set("submitter",d.submitter?.trim()?"":"Enter your name or Discord tag.");
 cur.fields.forEach(f=>{const v=(d[f.name]||"").trim();set(f.name,f.required&&!v?`${f.label} is required.`:"")});
 let bad=false;(d.evidence||"").split("\n").forEach(l=>{if(l.trim()&&!/^https?:\/\/\S+$/.test(l.trim()))bad=true});
 set("evidence",bad?"Evidence must be full links starting with http:// or https://.":"");
 if(!ok)document.querySelector("[aria-invalid=true]")?.focus();return ok}
function label(k){const f=cur.fields.find(x=>x.name===k);return f?f.label:({submitter:"Submitted by",priority:"Priority",incidentDate:"Incident date",incidentTime:"Incident time",evidence:"Evidence"}[k]||k)}
function review(){const d=collect();if(!validate(d))return;
 const dg=document.getElementById("confirm");
 dg.innerHTML=`<h2>Confirm submission</h2><p class="hint">Check the details. You cannot edit a report after sending.</p><dl><dt>Type</dt><dd>${E(cur.title)}</dd>${Object.entries(d).filter(([k,v])=>v).map(([k,v])=>`<dt>${E(label(k))}</dt><dd>${E(v)}</dd>`).join("")}</dl><div class="actions"><button class="primary" id="go">Send report</button><button id="no">Go back</button></div>`;
 dg.showModal();document.getElementById("no").onclick=()=>dg.close();document.getElementById("go").onclick=()=>{dg.close();submit(d)}}
async function submit(d){const r={ref:ref(),templateId:cur.id,title:cur.title,status:"Open",priority:d.priority,submittedAt:new Date().toISOString(),data:d,labels:Object.fromEntries(Object.keys(d).map(k=>[k,label(k)]))};
 let sent=false,msg="";
 if(C.integrations.discordEnabled&&C.integrations.endpoint){try{const res=await fetch(C.integrations.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:r.ref,templateId:r.templateId,priority:r.priority,submittedAt:r.submittedAt,data:d,site:location.href})});if(!res.ok){let why="";try{why=(await res.json()).error||""}catch(_){}throw new Error("HTTP "+res.status+(why?": "+why:""))}sent=true}catch(e){msg="Discord delivery failed ("+(String(e.message).startsWith("HTTP")?e.message:"could not reach the relay. Check the endpoint in config.js")+"). The report was saved in this browser only."}}
 const all=GSC_STORE.load();all.unshift(r);GSC_STORE.save(all);
 document.getElementById("form-area").innerHTML=`<h2>Report submitted</h2><p>Reference number: <strong>${r.ref}</strong></p><p class="hint">${sent?"Sent to the Discord channel for this report type.":(msg||"Demo mode: saved in this browser only. Nothing was sent to Discord.")}</p><div class="actions"><button class="primary" onclick="print()">Print summary</button><a class="btn" href="dashboard.html">View in dashboard</a><a class="btn" href="submit-report.html">Submit another</a></div>`;
 GSC.toast("Report submitted")}
document.addEventListener("DOMContentLoaded",async()=>{
 const grid=document.getElementById("types");if(!grid)return;
 try{await GSC_loadTemplates()}catch(e){grid.innerHTML=`<div class="empty">Could not load report templates. Check that data/report-templates.json exists.</div>`;return}
 const form=document.getElementById("form-area");
 grid.innerHTML=TPL.map(t=>`<a class="tile" href="${form?"#"+t.id:"submit-report.html#"+t.id}" style="--c:${t.color}" data-id="${t.id}"><h3>${E(t.title)}</h3><p>${E(t.description)}</p></a>`).join("");
 if(!form)return;
 const open=id=>{const t=TPL.find(x=>x.id===id);if(t){build(t);form.scrollIntoView({behavior:"smooth"})}};
 grid.onclick=e=>{const a=e.target.closest("a");if(a){e.preventDefault();history.replaceState(null,"","#"+a.dataset.id);open(a.dataset.id)}};
 if(location.hash)open(location.hash.slice(1))});
})();
