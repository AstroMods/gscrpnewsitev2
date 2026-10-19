(function(){
 var JOIN_URL="https://discord.gardenstatecollective.com/",CONNECT_URL="https://cfx.re/join/e66dkoa"; // edit these two links to update every button
 document.querySelectorAll("[data-join]").forEach(function(a){a.href=JOIN_URL;a.target="_blank"});
 document.querySelectorAll("[data-connect]").forEach(function(a){a.href=CONNECT_URL;a.target="_blank"});

 var hdr=document.getElementById("top");
 function sc(){hdr.classList.toggle("scrolled",window.scrollY>30)}
 sc();addEventListener("scroll",sc,{passive:true});

 var burger=document.querySelector(".burger"),menu=document.getElementById("menu");
 function setMenu(o){menu.classList.toggle("open",o);burger.setAttribute("aria-expanded",o)}
 burger.addEventListener("click",function(){setMenu(!menu.classList.contains("open"))});
 menu.addEventListener("click",function(e){if(e.target.closest("a"))setMenu(false)});
 addEventListener("keydown",function(e){if(e.key==="Escape")setMenu(false)});

 var tabs=[].slice.call(document.querySelectorAll(".tab")),panels=[].slice.call(document.querySelectorAll(".dept"));
 function pick(i,focus){
  tabs.forEach(function(t,n){t.setAttribute("aria-selected",n===i);t.tabIndex=n===i?0:-1});
  panels.forEach(function(p,n){p.classList.toggle("on",n===i);p.hidden=n!==i});
  if(focus)tabs[i].focus();
 }
 tabs.forEach(function(t,i){
  t.addEventListener("click",function(){pick(i)});
  t.addEventListener("keydown",function(e){
   var k=e.key,n=tabs.length;
   if(k==="ArrowRight")pick((i+1)%n,1);
   else if(k==="ArrowLeft")pick((i+n-1)%n,1);
   else if(k==="Home")pick(0,1);
   else if(k==="End")pick(n-1,1);
  });
 });

 // skyline
 var W=1200,H=150,s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2bd6"/><stop offset="1" stop-color="#2a1170"/></linearGradient><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1590"/><stop offset="1" stop-color="#07020f"/></linearGradient></defs>';
 var seed=7;function r(){seed=(seed*9301+49297)%233280;return seed/233280}
 var x=0;
 while(x<W){
  var mid=Math.abs(x-W/2)/(W/2),w=18+r()*34,h=20+r()*70*(1.2-mid*.7);
  s+='<rect x="'+x.toFixed(1)+'" y="'+(112-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="url(#sk)" opacity="'+(0.55+r()*.4).toFixed(2)+'"/>';
  if(r()>.6)s+='<rect x="'+(x+w/2-1.5).toFixed(1)+'" y="'+(112-h-10).toFixed(1)+'" width="3" height="10" fill="#ff2bd6"/>';
  x+=w+2+r()*6;
 }
 for(var p=60;p<W;p+=170+r()*80){
  s+='<path d="M'+p+' 112V84" stroke="#07020f" stroke-width="3"/>';
  for(var a=0;a<5;a++){var ang=-Math.PI+a*Math.PI/4;s+='<path d="M'+p+' 84q'+(Math.cos(ang)*14)+' '+(Math.sin(ang)*10-6)+' '+(Math.cos(ang)*24)+' '+(Math.sin(ang)*8+6)+'" stroke="#07020f" stroke-width="2.4" fill="none"/>'}
 }
 s+='<rect y="112" width="'+W+'" height="38" fill="url(#wt)"/><rect y="112" width="'+W+'" height="1.5" fill="#ff2bd6"/></svg>';
 document.getElementById("skyline").innerHTML=s;

 // hero parallax + cursor glow (fine pointers only)
 var hero=document.getElementById("home"),bg=document.getElementById("bg"),glow=document.getElementById("glow");
 var fine=matchMedia("(pointer:fine)").matches;
 if(fine){
  hero.addEventListener("pointermove",function(e){
   var b=hero.getBoundingClientRect(),px=(e.clientX-b.left)/b.width-.5,py=(e.clientY-b.top)/b.height-.5;
   bg.style.transform="translate("+(-px*26)+"px,"+(-py*18)+"px) scale(1.03)";
   glow.style.left=(e.clientX-b.left)+"px";glow.style.top=(e.clientY-b.top)+"px";glow.style.opacity=1;
  });
  hero.addEventListener("pointerleave",function(){glow.style.opacity=0;bg.style.transform=""});
 }
 // ===== FX =====
 document.documentElement.classList.add("js");
 var reduce=false,calm=false,sky=document.getElementById("skyline");
 var pg=document.createElement("div");pg.className="progress";document.body.appendChild(pg);
 function prog(){var m=document.documentElement.scrollHeight-innerHeight;pg.style.transform="scaleX("+(m>0?Math.min(scrollY/m,1):0)+")";if(!calm)sky.style.transform="translateY("+Math.min(scrollY*.15,60)+"px)"}
 prog();addEventListener("scroll",prog,{passive:true});
 var rv=[].slice.call(document.querySelectorAll(".wrap>h2,.wrap>.lede,.tabs,.grid,.steps,.joinrow,.faq"));
 rv.forEach(function(el){el.classList.add("rv")});
 if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.12,rootMargin:"0px 0px -6% 0px"});
  rv.forEach(function(el){io.observe(el)});
 }else rv.forEach(function(el){el.classList.add("in")});
 var rot=document.createElement("p");rot.className="rot";rot.innerHTML='Serve as a <b></b><span class="caret"></span>';
 if(document.body.dataset.page==="home")hero.querySelector(".tag").after(rot);
 var tb=rot.querySelector("b"),roles=["state trooper","sheriff's deputy","city officer","firefighter","medic","federal agent"],ri=0,ci=0,del=false;
 if(reduce){tb.textContent=roles[0]}else{(function type(){
  if(calm){tb.textContent=roles[0];ci=roles[0].length;del=true;ri=0;setTimeout(type,600);return}var w=roles[ri];ci+=del?-1:1;tb.textContent=w.slice(0,ci);
  var d=del?35:75;
  if(!del&&ci===w.length){del=true;d=1400}else if(del&&ci===0){del=false;ri=(ri+1)%roles.length;d=350}
  setTimeout(type,d);
 })()}
 document.querySelectorAll(".btn").forEach(function(b){
  b.addEventListener("pointerdown",function(e){
   var r=b.getBoundingClientRect(),s=document.createElement("b");s.className="rip";
   s.style.left=(e.clientX-r.left)+"px";s.style.top=(e.clientY-r.top)+"px";b.appendChild(s);
   setTimeout(function(){s.remove()},700);
  });
 });
 if(!reduce){
  var sr=document.createElement("div");sr.className="siren";hero.insertBefore(sr,hero.firstChild);
  var cv=document.createElement("canvas");cv.className="fx";hero.insertBefore(cv,hero.firstChild);
  var cx=cv.getContext("2d"),P=[],cw=0,ch=0,dpr=Math.min(devicePixelRatio||1,2),vis=true,mx=-999,my=-999,cols=["255,43,214","122,43,255","60,140,255","255,160,50","255,255,255"];
  function mk(init){return{x:Math.random()*cw,y:init?Math.random()*ch:ch+10,r:Math.random()*2+.6,v:Math.random()*.6+.25,s:Math.random()*6.28,c:cols[Math.random()*cols.length|0],a:Math.random()*.55+.3}}
  function size(){cw=hero.clientWidth;ch=hero.clientHeight;cv.width=cw*dpr;cv.height=ch*dpr;cx.setTransform(dpr,0,0,dpr,0,0);P=[];for(var i=0,n=Math.min(Math.round(cw*ch/15000),140);i<n;i++)P.push(mk(true))}
  size();addEventListener("resize",size);
  new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe(hero);
  hero.addEventListener("pointermove",function(e){var b=hero.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top});
  hero.addEventListener("pointerleave",function(){mx=my=-999});
  (function loop(t){
   if(vis&&!calm){
    cx.clearRect(0,0,cw,ch);
    for(var i=0;i<P.length;i++){var p=P[i];
     p.y-=p.v;p.x+=Math.sin(t/900+p.s)*.35;
     var dx=p.x-mx,dy=p.y-my,d=dx*dx+dy*dy;
     if(d<14400){var f=(1-d/14400)*2.2,l=Math.sqrt(d)||1;p.x+=dx/l*f;p.y+=dy/l*f}
     if(p.y<-10)P[i]=mk(false);
     cx.beginPath();cx.fillStyle="rgba("+p.c+","+p.a+")";cx.shadowBlur=12;cx.shadowColor="rgba("+p.c+",1)";cx.arc(p.x,p.y,p.r,0,6.283);cx.fill();
    }
   }
   requestAnimationFrame(loop);
  })(0);
  var mk1=hero.querySelector(".mark");
  setInterval(function(){if(calm)return;mk1.classList.add("gl");setTimeout(function(){mk1.classList.remove("gl")},520)},6500);
 }
 if(fine){
  document.querySelectorAll(".btn").forEach(function(b){
   b.addEventListener("pointermove",function(e){if(calm)return;var r=b.getBoundingClientRect();b.style.setProperty("--mx",((e.clientX-r.left-r.width/2)*.22)+"px");b.style.setProperty("--my",((e.clientY-r.top-r.height/2)*.3)+"px")});
   b.addEventListener("pointerleave",function(){b.style.setProperty("--mx","0px");b.style.setProperty("--my","0px")});
  });
  document.querySelectorAll(".card,.steps li,.shot").forEach(function(c){
   c.classList.add("tilt");
   c.addEventListener("pointermove",function(e){if(calm)return;var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    c.style.setProperty("--ry",((px-.5)*10)+"deg");c.style.setProperty("--rx",((.5-py)*8)+"deg");c.style.setProperty("--gx",px*100+"%");c.style.setProperty("--gy",py*100+"%")});
   c.addEventListener("pointerleave",function(){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")});
  });
  if(!reduce){
   var ring=document.createElement("div"),dot=document.createElement("div");ring.className="cur";dot.className="cur-dot";document.body.append(ring,dot);
   var tx=0,ty=0,rx=0,ry=0;
   addEventListener("pointermove",function(e){tx=e.clientX;ty=e.clientY;dot.style.transform="translate("+tx+"px,"+ty+"px)";ring.classList.add("show");dot.classList.add("show");
    ring.classList.toggle("big",!!e.target.closest("a,button,summary"))});
   document.addEventListener("mouseleave",function(){ring.classList.remove("show");dot.classList.remove("show")});
   (function f(){rx+=(tx-rx)*.18;ry+=(ty-ry)*.18;ring.style.transform="translate("+rx+"px,"+ry+"px)";requestAnimationFrame(f)})();
  }
 }

 // NJ light trace + twinkling city lights
 var njp=document.querySelector(".nj path");
 if(njp){var tr=njp.cloneNode();tr.setAttribute("class","trace");njp.parentNode.appendChild(tr)}
 var ss=sky.querySelector("svg"),NS="http://www.w3.org/2000/svg";
 for(var q=0;q<90;q++){var wn=document.createElementNS(NS,"rect");
  wn.setAttribute("x",(Math.random()*1190).toFixed(0));wn.setAttribute("y",(48+Math.random()*60).toFixed(0));
  wn.setAttribute("width","3");wn.setAttribute("height","4");wn.setAttribute("class","win");
  wn.style.animationDuration=(1.5+Math.random()*3.5).toFixed(2)+"s";wn.style.animationDelay=(-Math.random()*4).toFixed(2)+"s";ss.appendChild(wn)}
 // motion toggle (animations are ON by default)
 var mb=document.createElement("button");mb.type="button";mb.className="motion";document.body.appendChild(mb);
 function setCalm(v,save){calm=v;document.documentElement.classList.toggle("calm",v);mb.textContent=v?"Motion: off":"Motion: on";mb.setAttribute("aria-pressed",String(!v));
  if(save){try{localStorage.setItem("gsc-calm",v?"1":"0")}catch(e){}}}
 var sv=null;try{sv=localStorage.getItem("gsc-calm")}catch(e){}
 setCalm(sv==="1");
 mb.addEventListener("click",function(){setCalm(!calm,true)});

 // clean URLs: smooth-scroll to sections without adding #hash to the address bar
 function clean(){try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
 document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var id=a.getAttribute("href").slice(1),t=id?document.getElementById(id):document.documentElement;
  if(!t)return;
  e.preventDefault();
  t.scrollIntoView({behavior:calm?"auto":"smooth",block:"start"});
  clean();
 });
 if(location.hash){var h0=document.getElementById(location.hash.slice(1));clean();if(h0)setTimeout(function(){h0.scrollIntoView({block:"start"})},60)}
})();
