(function(){
const C=window.GSC_CONFIG,T=C.theme,root=document.documentElement;
root.style.setProperty("--p",T.primary);
let mode="";try{mode=localStorage.getItem("gsc_mode")}catch(e){}
root.dataset.mode=mode||T.defaultMode;
const page=location.pathname.split("/").pop()||"index.html";
window.GSC={
  esc:s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
  toast(msg){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.getElementById("toasts").append(t);setTimeout(()=>t.remove(),3500)},
  demo:()=>!C.integrations.endpoint
};
const on=f=>!f||C.features[f]!==false;
document.addEventListener("DOMContentLoaded",()=>{
  document.title=(document.body.dataset.title?document.body.dataset.title+" | ":"")+C.siteName;
  const links=C.nav.filter(n=>on(n.feature)).map(n=>`<a href="${n.href}" ${n.href===page?'aria-current="page"':""}>${GSC.esc(n.label)}</a>`).join("");
  const banners=(C.maintenance.show?`<div class="banner warn" role="alert">${GSC.esc(C.maintenance.text)}</div>`:"")+
    (C.features.announcements&&C.announcement.show?`<div class="banner">${GSC.esc(C.announcement.text)}</div>`:"")+
    (GSC.demo()?`<div class="banner warn">Demo mode: no Discord endpoint or data service is configured. Reports stay in this browser only and are not shared or secure. See the README.</div>`:"");
  document.body.insertAdjacentHTML("afterbegin",`<a class="skip" href="#main">Skip to content</a><header class="top"><a class="brand" href="index.html"><i></i>${GSC.esc(C.siteName)}</a><nav aria-label="Main">${links}</nav><button id="mode" aria-label="Toggle light or dark mode">Theme</button></header>${banners}`);
  document.body.insertAdjacentHTML("beforeend",`<footer>${GSC.esc(C.footer)}</footer><div id="toasts" aria-live="polite"></div>`);
  document.getElementById("mode").onclick=()=>{const m=root.dataset.mode==="dark"?"light":"dark";root.dataset.mode=m;try{localStorage.setItem("gsc_mode",m)}catch(e){}};
  if(C.integrations.discordEnabled&&C.integrations.endpoint){
    const b=document.createElement("div");b.className="banner";b.setAttribute("role","status");b.textContent="Checking Discord relay…";
    document.querySelector(".top").after(b);
    fetch(C.integrations.endpoint.replace(/\/+$/,"")+"/status",{cache:"no-store"}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{
      b.textContent="Discord relay: "+({operational:"online and working",degraded:"online, but some channels are not working",offline:"not working"}[d.state]||d.state)+".";
      if(d.state!=="operational")b.classList.add("warn")}).catch(()=>{b.textContent="Discord relay: cannot be reached. Check the endpoint in config.js.";b.classList.add("warn")});
  }
});
})();
