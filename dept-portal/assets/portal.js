const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const BASE=document.body.dataset.base||'';
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label={law:'Law Enforcement',fire:'Fire / EMS',civil:'Civil'};
const page=d=>BASE+d.path;
const discBtn=(d,cls='btn pri')=>d.disc?`<a class="${cls}" href="${d.disc}" target="_blank" rel="noopener">Join Discord ↗</a>`:`<a class="btn" href="${HUB}" target="_blank" rel="noopener">Via Hub Discord ↗</a>`;

/* ---------- home ---------- */
function home(){
  let filter='all';
  const old=location.hash.match(/^#doc-(\w+)/);
  if(old){const d=D.find(x=>x.k===old[1]);if(d){location.replace(page(d));return}}
  function render(){
    const q=$('#q').value.trim().toLowerCase();
    const list=D.filter(d=>(filter==='all'||d.type===filter)&&(d.abbr+d.name+d.blurb).toLowerCase().includes(q));
    $('#grid').innerHTML=list.length?list.map(d=>`
    <article class="card" style="--accent:${d.color}">
      <div class="top"><div class="logo">${d.abbr.slice(0,5)}</div><div><small>${label[d.type]}</small><h3>${esc(d.name)}</h3></div></div>
      <p>${esc(d.blurb)}</p>
      <div class="row"><a class="btn pri" href="${page(d)}">Open page →</a>${discBtn(d,'btn')}</div>
    </article>`).join(''):'<div class="empty">No departments match your search.</div>';
    $$('.card').forEach(c=>{
      c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px');
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg)`});
      c.addEventListener('pointerleave',()=>c.style.transform='');
    });
  }
  $('#q').addEventListener('input',render);
  $$('.chip').forEach(b=>b.onclick=()=>{$$('.chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');filter=b.dataset.f;render()});
  $('#docs').innerHTML=D.map(d=>`<a class="doc" href="${page(d)}" style="--accent:${d.color}"><i>${esc(d.abbr.slice(0,3))}</i><span>${esc(d.abbr)} Handbook<em>${esc(d.name)}</em></span></a>`).join('');
  $$('[data-n]').forEach(el=>{const n=+el.dataset.n;let i=0;const t=setInterval(()=>{el.textContent=++i;if(i>=n)clearInterval(t)},120)});
  const secs=['departments','hub','documents'].map(id=>document.getElementById(id));
  addEventListener('scroll',()=>{const y=scrollY+120;let on='';secs.forEach(s=>{if(s.offsetTop<=y)on=s.id});$$('#links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+on))},{passive:true});
  render();
}

/* ---------- department page ---------- */
function dept(){
  const i=D.findIndex(d=>d.k===document.body.dataset.dept),d=D[i];
  if(!d){$('#app').innerHTML='<p class="wrap" style="padding:80px 0">Department not found. <a href="'+BASE+'#departments" style="color:var(--cyan)">Back to the portal</a></p>';return}
  const prev=D[(i+D.length-1)%D.length],next=D[(i+1)%D.length];
  document.title=`${d.abbr} | ${d.name} | Garden State Collective`;
  $('#app').innerHTML=`
  <div class="wrap dpage" style="--accent:${d.color}">
    <div class="crumbs"><a href="${BASE||'./'}">Portal</a><span>/</span><a href="${BASE}#departments">Departments</a><span>/</span>${esc(d.abbr)}</div>
    <header class="dhero"><div class="logo big">${esc(d.abbr.slice(0,5))}</div>
      <div><small>${label[d.type]}</small><h1 class="glow">${esc(d.name)}</h1><p>${esc(d.blurb)}</p>
      <div class="row">${discBtn(d)}<a class="btn" href="${d.edit}" target="_blank" rel="noopener">Open handbook ↗</a><a class="btn" href="${HUB}" target="_blank" rel="noopener">Department Hub</a></div></div></header>
    <div class="facts"><div class="fact"><span>Category</span><b>${label[d.type]}</b></div>
      <div class="fact"><span>Discord</span><b>${d.disc?'Dedicated server':'Via Department Hub'}</b></div>
      <div class="fact"><span>Handbook</span><b>Live Google Doc</b></div></div>
    <div class="viewer" id="viewer">
      <div class="vbar"><strong>${esc(d.abbr)} Handbook</strong><span class="tag">Live document</span>
        <div class="row"><button class="btn" id="copy">Copy page link</button><button class="btn" id="full">Fullscreen</button><a class="btn pri" href="${d.edit}" target="_blank" rel="noopener">Open in Docs ↗</a></div></div>
      <div class="frame"><div class="load" id="load"><div><div class="spin"></div>Loading document…</div></div>
        <iframe id="frame" title="${esc(d.abbr)} handbook" src="${d.embed}" referrerpolicy="no-referrer" allow="fullscreen"></iframe></div>
    </div>
    <p class="note">If the document shows an access error, its sharing must be set to “Anyone with the link can view”.</p>
    <nav class="pn"><a href="${page(prev)}" style="--accent:${prev.color}"><small>← Previous</small><b>${esc(prev.abbr)} · ${esc(prev.name)}</b></a>
      <a class="r" href="${page(next)}" style="--accent:${next.color}"><small>Next →</small><b>${esc(next.abbr)} · ${esc(next.name)}</b></a></nav>
    <h2>All departments</h2>
    <div class="docs">${D.map(x=>`<a class="doc" href="${page(x)}" style="--accent:${x.color}"><i>${esc(x.abbr.slice(0,3))}</i><span>${esc(x.abbr)}<em>${esc(x.name)}</em></span></a>`).join('')}</div>
  </div>`;
  $('#frame').addEventListener('load',()=>$('#load').classList.add('off'));
  $('#copy').onclick=()=>navigator.clipboard.writeText(location.href.split('#')[0]).then(()=>toast('Link copied'),()=>toast('Copy failed'));
  $('#full').onclick=()=>{const v=$('#viewer');v.classList.toggle('full');$('#full').textContent=v.classList.contains('full')?'Exit fullscreen':'Fullscreen'};
  addEventListener('keydown',e=>{if(e.key==='Escape'){$('#viewer').classList.remove('full');$('#full').textContent='Fullscreen'}});
}

/* ---------- shared ---------- */
$('#burger').onclick=()=>$('#links').classList.toggle('open');
$$('#links a').forEach(a=>a.onclick=()=>$('#links').classList.remove('open'));
$('#yr').textContent=new Date().getFullYear();

/* command palette */
const items=[
  {t:'Portal home',s:'Page',x:'home',a:()=>location.href=BASE||'./'},
  ...D.flatMap(d=>[{t:`${d.abbr} department page`,s:'Page',x:d.name,a:()=>location.href=page(d)},
    {t:`${d.abbr} Discord`,s:d.disc?'Discord':'Hub Discord',x:d.name,a:()=>window.open(d.disc||HUB,'_blank','noopener')},
    {t:`${d.abbr} Handbook`,s:'Google Doc',x:d.name,a:()=>window.open(d.edit,'_blank','noopener')}]),
  {t:'Department Hub Discord',s:'Discord',x:'hub',a:()=>window.open(HUB,'_blank','noopener')},
  {t:'Main Discord',s:'Discord',x:'main',a:()=>window.open('https://discord.gardenstatecollective.com/','_blank','noopener')}
];
let sel=0,res=[];
function pal(){const q=$('#pin').value.toLowerCase();res=items.filter(i=>(i.t+i.x+i.s).toLowerCase().includes(q));sel=0;
  $('#plist').innerHTML=res.map((r,i)=>`<div class="pit ${i?'':'sel'}" data-i="${i}"><span>${esc(r.t)}</span><small>${r.s}</small></div>`).join('')||'<div class="pit"><small>No results</small></div>'}
const paint=()=>{$$('.pit').forEach((e,i)=>e.classList.toggle('sel',i===sel));$('.pit.sel')?.scrollIntoView({block:'nearest'})};
const openPal=()=>{$('#pal').classList.add('open');$('#pin').value='';pal();$('#pin').focus()},closePal=()=>$('#pal').classList.remove('open');
const run=i=>{const r=res[i];if(r){closePal();r.a()}};
$('#openPal').onclick=openPal;$('#pin').addEventListener('input',pal);
$('#plist').addEventListener('click',e=>{const p=e.target.closest('.pit');if(p&&p.dataset.i)run(+p.dataset.i)});
$('#pal').addEventListener('click',e=>{if(e.target.id==='pal')closePal()});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal();return}
  if(e.key==='Escape')closePal();
  if($('#pal').classList.contains('open')){
    if(e.key==='ArrowDown'){sel=Math.min(sel+1,res.length-1);paint();e.preventDefault()}
    if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);paint();e.preventDefault()}
    if(e.key==='Enter')run(sel);}
});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));

/* neon skyline */

(function(){
  const c=$('#sky'),x=c.getContext('2d');let W,H,b=[],st=[];
  function init(){W=c.width=innerWidth;H=c.height=innerHeight;
    st=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H*.6,r:Math.random()*1.3+.2,p:Math.random()*6}));
    b=[];let px=0;while(px<W){const w=34+Math.random()*58,h=60+Math.random()*(H*.32);
      b.push({x:px,w,h,c:['#ff2e93','#22e4ff','#8b5cff','#ff8a1f'][Math.random()*4|0],win:Array.from({length:Math.floor(w*h/420)},()=>Math.random())});px+=w+4}}
  function draw(t){
    x.clearRect(0,0,W,H);
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05060f');g.addColorStop(.7,'#150a2a');g.addColorStop(1,'#3a0f3d');x.fillStyle=g;x.fillRect(0,0,W,H);
    st.forEach(s=>{x.globalAlpha=.4+.6*Math.abs(Math.sin(t/1400+s.p));x.fillStyle='#fff';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()});x.globalAlpha=1;
    const sg=x.createRadialGradient(W*.78,H*.78,10,W*.78,H*.78,H*.5);sg.addColorStop(0,'rgba(255,138,31,.55)');sg.addColorStop(1,'transparent');x.fillStyle=sg;x.fillRect(0,0,W,H);
    b.forEach(o=>{const y=H-o.h;x.fillStyle='#0a0c1c';x.fillRect(o.x,y,o.w,o.h);
      x.strokeStyle=o.c;x.shadowColor=o.c;x.shadowBlur=10;x.globalAlpha=.55;x.lineWidth=1.2;x.strokeRect(o.x+.5,y+.5,o.w-1,o.h);x.shadowBlur=0;
      o.win.forEach((v,i)=>{const cols=Math.max(2,o.w/10|0),cx=i%cols,cy=i/cols|0;const on=v>.55&&Math.sin(t/2500+i+o.x)>-.7;
        if(on){x.globalAlpha=.55;x.fillStyle=v>.9?o.c:'#ffd88a';x.fillRect(o.x+5+cx*(o.w-10)/cols,y+8+cy*11,3,4)}});x.globalAlpha=1});
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches)requestAnimationFrame(draw)}
  addEventListener('resize',init);init();requestAnimationFrame(draw);
})();


document.body.dataset.page==='home'?home():dept();
