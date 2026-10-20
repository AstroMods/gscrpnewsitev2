(function(){
 var $=function(i){return document.getElementById(i)},calm=function(){return document.documentElement.classList.contains("calm")};

 // count-up numbers when scrolled into view
 function fmt(n){return n.toLocaleString("en-US")}
 var nums=[].slice.call(document.querySelectorAll("[data-to]"));
 function run(el){
  var a=+el.dataset.from,b=+el.dataset.to;
  if(calm()){el.textContent=fmt(b);return}
  var t0=null;(function f(t){if(t0===null)t0=t;var p=Math.min((t-t0)/1400,1),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(a+(b-a)*e));if(p<1)requestAnimationFrame(f)})(performance.now());
 }
 nums.forEach(function(n){n.textContent=fmt(+n.dataset.from)});
 if("IntersectionObserver" in window){var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){run(x.target);io.unobserve(x.target)}})},{threshold:.6});nums.forEach(function(n){io.observe(n)})}
 else nums.forEach(run);

 // limit visualizer
 var slots=$("slots"),cnt=$("cnt"),cv=$("cntv"),lim=32,h="";
 for(var i=1;i<=40;i++)h+='<div class="slot" data-n="'+i+'"><span>'+i+'</span></div>';
 slots.innerHTML=h;
 var cells=[].slice.call(slots.children);
 function vis(){
  var c=+cnt.value;cv.textContent=c;
  cells.forEach(function(s,i){var n=i+1,over=n>lim,on=n<=c&&!over;
   s.classList.toggle("on",on);s.classList.toggle("over",n<=c&&over);s.classList.toggle("r",n%2===1);s.classList.toggle("b",n%2===0);
   s.style.animationDelay=on?(-(i%5)*.12)+"s":"0s"});
  var over=Math.max(0,c-lim),msg=$("vmsg");
  msg.className="vmsg "+(over?"bad":"ok");
  msg.textContent=over?(over+" of your "+c+" sirens "+(over===1?"is":"are")+" over the "+lim+" siren limit."):(c+" of "+lim+" siren slots in use. Everything fits.");
 }
 cnt.addEventListener("input",vis);
 document.querySelectorAll(".mchip").forEach(function(b){b.addEventListener("click",function(){lim=+b.dataset.l;document.querySelectorAll(".mchip").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});vis()})});
 vis();

 // siren setting ID checker
 var ta=$("ids"),out=$("idout");
 function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
 function check(){
  var tokens=ta.value.split(/\n|;|,/),ids=[],bad=[];
  tokens.forEach(function(t){t=t.trim();if(!t)return;var m=t.match(/^(\d+)\s*[:\-]?\s*(.*)$/);if(!m){bad.push(t);return}ids.push({n:+m[1],l:m[2].trim()})});
  if(!ids.length&&!bad.length){out.innerHTML='<p class="rmute">Results appear here.</p>';return}
  var map={};ids.forEach(function(x){(map[x.n]=map[x.n]||[]).push(x.l||"unnamed vehicle")});
  var dup=Object.keys(map).filter(function(k){return map[k].length>1}),hi=ids.filter(function(x){return x.n>255&&x.n<=65535}),over=ids.filter(function(x){return x.n>65535}),o="";
  o+='<p class="rline"><b>'+ids.length+'</b> IDs read, <b>'+Object.keys(map).length+'</b> unique.</p>';
  if(dup.length){o+='<div class="rbox bad"><h4>'+dup.length+' conflict'+(dup.length>1?'s':'')+' found</h4><ul>';dup.forEach(function(k){o+='<li><b>ID '+k+'</b> is shared by '+map[k].map(esc).join(', ')+'</li>'});o+='</ul><p>Vehicles that share an ID share the same emergency light setup. Give each one its own ID.</p></div>'}
  else o+='<div class="rbox ok"><h4>No conflicts</h4><p>Every ID in your list is unique.</p></div>';
  if(hi.length)o+='<div class="rbox warn"><h4>'+hi.length+' ID'+(hi.length>1?'s':'')+' above 255</h4><p>The default limit is 255. IDs up to 65,535 need the limit raised, which is what the adjuster does.</p></div>';
  if(over.length)o+='<div class="rbox bad"><h4>'+over.length+' ID'+(over.length>1?'s':'')+' above 65,535</h4><p>These are past the raised limit too: '+over.map(function(x){return x.n}).join(", ")+'.</p></div>';
  if(bad.length)o+='<p class="rmute">Ignored (no number found): '+bad.map(esc).join(", ")+'</p>';
  out.innerHTML=o;
 }
 ta.addEventListener("input",check);
 $("ex").addEventListener("click",function(){ta.value="87 SAHP Buffalo\n87 City Patrol Stanier\n120 Sheriff Granger\n300 Fire Engine\n300 EMS Ambulance\n70000 Typo example";check()});
 $("clr").addEventListener("click",function(){ta.value="";check();ta.focus()});
 check();
})();
