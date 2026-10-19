(function(){
 var q=document.getElementById("rq"),rules=[].slice.call(document.querySelectorAll(".rule")),cats=[].slice.call(document.querySelectorAll(".cat")),
  chips=[].slice.call(document.querySelectorAll(".chip")),count=document.getElementById("rcount"),empty=document.getElementById("rempty"),sev="all";
 function apply(){
  var t=q.value.trim().toLowerCase(),n=0;
  rules.forEach(function(r){var ok=(sev==="all"||r.dataset.sev===sev)&&(!t||r.textContent.toLowerCase().indexOf(t)>-1);r.hidden=!ok;if(ok)n++});
  cats.forEach(function(c){var any=c.querySelector(".rule:not([hidden])");c.hidden=!any;if(any&&(t||sev!=="all"))c.open=true});
  count.textContent=n+" of "+rules.length+" rules shown";empty.hidden=n>0;
 }
 q.addEventListener("input",apply);
 chips.forEach(function(c){c.addEventListener("click",function(){sev=c.dataset.f;chips.forEach(function(x){x.setAttribute("aria-pressed",String(x===c))});apply()})});
 document.getElementById("openall").addEventListener("click",function(){cats.forEach(function(c){c.open=true})});
 document.getElementById("closeall").addEventListener("click",function(){cats.forEach(function(c){c.open=false})});
 var toc=document.getElementById("toc");
 toc.addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;var t=document.getElementById(a.getAttribute("href").slice(1));if(t&&t.tagName==="DETAILS")t.open=true});
 var links=[].slice.call(toc.querySelectorAll("a")),secs=links.map(function(a){return document.getElementById(a.getAttribute("href").slice(1))}),tick=false;
 function spy(){tick=false;var cur=0;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<180)cur=i});links.forEach(function(a,i){a.classList.toggle("on",i===cur)})}
 addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(spy)}},{passive:true});spy();

 // acknowledge
 var ack=document.getElementById("ack"),KEY="gsc-rules-ok";
 function setAck(v){ack.setAttribute("aria-pressed",String(v));ack.querySelector("span").textContent=v?"Rules accepted":"I have read and agree to the rules";document.getElementById("acknext").hidden=!v}
 var s=null;try{s=localStorage.getItem(KEY)}catch(e){}setAck(s==="1");
 ack.addEventListener("click",function(){var v=ack.getAttribute("aria-pressed")!=="true";setAck(v);try{localStorage.setItem(KEY,v?"1":"0")}catch(e){}});

 // rules check
 var Q=[
  {q:"Your character is revived at the hospital after a shootout. What should you do?",o:["Drive back and get revenge right away","Forget what led to it and stay away from the scene for 15 minutes","Tell friends in Discord where the shooters are"],a:1,e:"Under the New Life Rule you forget the events and stay away from the scene."},
  {q:"A stranger insults your character in the city. What is the right response?",o:["Shoot them immediately","Roleplay it and escalate only if the story supports it","Run them over"],a:1,e:"Every crime needs a roleplay reason. Shooting for no reason is RDM."},
  {q:"A streamer shows where police are on a stream. Can your character use that?",o:["Yes, it helps your crime","No, that is metagaming","Yes, if you do not say it aloud"],a:1,e:"Information from outside the roleplay cannot be used by your character."},
  {q:"Can a medic refuse treatment because the patient is a criminal?",o:["Yes, always","Only if the scene is unsafe","Yes, if they are rude"],a:1,e:"Fire and EMS treat everyone. Only an unsafe scene is a reason to wait."},
  {q:"A police officer wants to search your vehicle. What do they need?",o:["Nothing at all","Probable cause or reasonable suspicion stated in character","Only a hunch from Discord"],a:1,e:"Searches need an articulable in-character reason."},
  {q:"You find a bug that duplicates money. What should you do?",o:["Use it quietly","Share it with friends","Report it to staff in a ticket"],a:2,e:"Exploits and duplication are bannable. Report bugs instead."}
 ],box=document.getElementById("quiz"),h="";
 Q.forEach(function(x,i){h+='<fieldset class="qq"><legend>'+(i+1)+'. '+x.q+'</legend>';x.o.forEach(function(o,j){h+='<label><input type="radio" name="q'+i+'" value="'+j+'"> '+o+'</label>'});h+='<p class="qe" hidden></p></fieldset>'});
 h+='<div class="qbar"><button type="button" class="btn main" id="qcheck"><span>Check answers</span></button><p id="qres" role="status"></p></div>';
 box.innerHTML=h;
 document.getElementById("qcheck").addEventListener("click",function(){
  var sc=0,unans=0;
  Q.forEach(function(x,i){var f=box.querySelectorAll(".qq")[i],c=f.querySelector("input:checked"),e=f.querySelector(".qe");
   if(!c){unans++;return}
   var ok=+c.value===x.a;if(ok)sc++;f.classList.toggle("good",ok);f.classList.toggle("bad",!ok);e.hidden=false;e.textContent=(ok?"Correct. ":"Not quite. ")+x.e});
  var r=document.getElementById("qres");
  r.textContent=unans?("Answer all "+Q.length+" questions first ("+unans+" left)."):("You scored "+sc+" out of "+Q.length+". "+(sc>=5?"Great, you are ready to roleplay.":"Review the rules above and try again."));
 });
})();
