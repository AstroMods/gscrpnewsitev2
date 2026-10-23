(function(){
const C=window.GSC_CONFIG,E=s=>GSC.esc(s);let rows=[],sort={k:"submittedAt",d:-1},page=1,TPL=[];
const demo=()=>[["investigation","Open","High","Alex R."],["warning","Resolved","Low","Sam T."],["staff-movement","Closed","Medium","Jordan K."],["ban-appeal","In review","Medium","Casey L."],["loa","Open","Low","Riley P."],["promotion-request","In review","Medium","Morgan D."]].map((x,i)=>{const t=TPL.find(t=>t.id===x[0]);return{ref:`DEMO-000${i+1}`,templateId:x[0],title:t.title,status:x[1],priority:x[2],submittedAt:new Date(Date.now()-i*864e5).toISOString(),demo:true,data:{submitter:x[3],note:"Sample demo record"},labels:{submitter:"Submitted by",note:"Note"}}});
const save=()=>GSC_STORE.save(rows.filter(r=>!r.demo));
function view(){const q=document.getElementById("q").value.toLowerCase(),t=document.getElementById("ft").value,s=document.getElementById("fs").value;
 const v=rows.filter(r=>(!t||r.templateId===t)&&(!s||r.status===s)&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
 v.sort((a,b)=>(a[sort.k]>b[sort.k]?1:-1)*sort.d);return v}
function render(){const v=view(),ps=C.pagination.pageSize,pages=Math.max(1,Math.ceil(v.length/ps));page=Math.min(page,pages);
 document.getElementById("stats").innerHTML=[["Total",rows.length],["Open",rows.filter(r=>r.status==="Open").length],["In review",rows.filter(r=>r.status==="In review").length],["High or critical",rows.filter(r=>["Critical","High"].includes(r.priority)).length]].map(([a,b])=>`<div class="stat"><b>${b}</b><span>${a}</span></div>`).join("");
 document.getElementById("tb").innerHTML=v.length?v.slice((page-1)*ps,page*ps).map(r=>`<tr tabindex="0" data-ref="${E(r.ref)}"><td>${E(r.ref)}${r.demo?' <span class="pill">demo</span>':""}</td><td>${E(r.title)}</td><td><span class="pill">${E(r.status)}</span></td><td>${E(r.priority)}</td><td>${new Date(r.submittedAt).toLocaleDateString()}</td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">No reports match. <a href="submit-report.html">Submit a report</a> or clear the filters.</div></td></tr>`;
 document.getElementById("pg").textContent=`Page ${page} of ${pages}`;document.getElementById("prev").disabled=page<=1;document.getElementById("next").disabled=page>=pages;
 document.querySelectorAll("th[data-k]").forEach(h=>{h.removeAttribute("aria-sort");if(h.dataset.k===sort.k)h.setAttribute("aria-sort",sort.d>0?"ascending":"descending")})}
function detail(ref){const r=rows.find(x=>x.ref===ref),d=document.getElementById("detail");
 d.innerHTML=`<h2>${E(r.title)}</h2><p class="hint">${E(r.ref)}${r.demo?" (demo record)":""}</p><dl>${Object.entries(r.data).filter(([k,v])=>v).map(([k,v])=>`<dt>${E(r.labels[k]||k)}</dt><dd>${E(v)}</dd>`).join("")}</dl>
 <label for="st">Status</label><select id="st">${C.statuses.map(s=>`<option ${s===r.status?"selected":""}>${s}</option>`).join("")}</select>
 <label for="as">Assigned to</label><input id="as" value="${E(r.assignee||"")}"><label for="nt">Internal notes</label><textarea id="nt">${E(r.notes||"")}</textarea>
 <label for="rs">Resolution summary</label><textarea id="rs">${E(r.resolution||"")}</textarea>
 <p class="hint">Changes are saved in this browser only. Shared staff permissions need an external data service.</p>
 <div class="actions"><button class="primary" id="sv">Save changes</button><button onclick="print()">Print</button><button id="cl">Close</button></div>`;
 d.showModal();document.getElementById("cl").onclick=()=>d.close();
 document.getElementById("sv").onclick=()=>{r.status=d.querySelector("#st").value;r.assignee=d.querySelector("#as").value;r.notes=d.querySelector("#nt").value;r.resolution=d.querySelector("#rs").value;save();d.close();render();GSC.toast("Changes saved")}}
function dl(name,type,txt){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
document.addEventListener("DOMContentLoaded",async()=>{
 if(!document.getElementById("tb"))return;
 try{await GSC_loadTemplates().then(t=>TPL=t)}catch(e){}
 if(!TPL.length){document.getElementById("tb").innerHTML=`<tr><td colspan="5"><div class="empty">Could not load report templates.</div></td></tr>`;return}
 rows=[...GSC_STORE.load(),...(GSC.demo()?demo():[])];
 document.getElementById("ft").innerHTML=`<option value="">All types</option>`+TPL.map(t=>`<option value="${t.id}">${E(t.title)}</option>`).join("");
 document.getElementById("fs").innerHTML=`<option value="">All statuses</option>`+C.statuses.map(s=>`<option>${s}</option>`).join("");
 ["q","ft","fs"].forEach(i=>document.getElementById(i).oninput=()=>{page=1;render()});
 document.querySelectorAll("th[data-k]").forEach(h=>h.querySelector("button").onclick=()=>{sort={k:h.dataset.k,d:sort.k===h.dataset.k?-sort.d:1};render()});
 document.getElementById("prev").onclick=()=>{page--;render()};document.getElementById("next").onclick=()=>{page++;render()};
 const tb=document.getElementById("tb");tb.onclick=e=>{const tr=e.target.closest("tr[data-ref]");if(tr)detail(tr.dataset.ref)};
 tb.onkeydown=e=>{if(e.key==="Enter"){const tr=e.target.closest("tr[data-ref]");if(tr)detail(tr.dataset.ref)}};
 document.getElementById("json").onclick=()=>dl("gsc-reports.json","application/json",JSON.stringify(view(),null,2));
 document.getElementById("csv").onclick=()=>{const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;dl("gsc-reports.csv","text/csv",["Reference,Type,Status,Priority,Submitted,Submitter"].concat(view().map(r=>[r.ref,r.title,r.status,r.priority,r.submittedAt,r.data.submitter].map(q).join(","))).join("\n"))};
 render()});
})();
