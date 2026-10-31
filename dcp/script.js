var COMMUNITY = "Our Community"; // change to your community's name
var EFFECTIVE = new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
document.querySelectorAll(".cn").forEach(function(e){e.textContent=COMMUNITY});
document.getElementById("eff").textContent=EFFECTIVE;
document.title="Duel Clan Policy – "+COMMUNITY;
var secs=[].slice.call(document.querySelectorAll("section"));
var toc=document.getElementById("toc");
secs.forEach(function(s,i){
  var a=document.createElement("a");a.href="#"+s.id;a.textContent=(i+1)+". "+s.querySelector("h2").textContent;toc.appendChild(a);
  s.querySelector("h2").addEventListener("click",function(){s.classList.toggle("closed")});
});
var links=[].slice.call(toc.querySelectorAll("a"));
function spy(){var y=window.scrollY+120,cur=0;secs.forEach(function(s,i){if(s.offsetTop<=y)cur=i});links.forEach(function(l,i){l.classList.toggle("on",i===cur)})}
addEventListener("scroll",spy);spy();
document.getElementById("q").addEventListener("input",function(e){
  var t=e.target.value.toLowerCase().trim(),shown=0;
  secs.forEach(function(s){
    var items=[].slice.call(s.querySelectorAll(".rules li")),hit=false;
    items.forEach(function(li){var m=!t||li.textContent.toLowerCase().indexOf(t)>-1;li.classList.toggle("hide",!m);if(m)hit=true});
    var h=!t||hit||s.querySelector("h2").textContent.toLowerCase().indexOf(t)>-1;
    if(t&&!hit&&h)items.forEach(function(li){li.classList.remove("hide")});
    s.style.display=h?"":"none";if(h){shown++;if(t)s.classList.remove("closed")}
  });
  document.getElementById("none").style.display=shown?"none":"block";
});
var allClosed=false;
document.getElementById("tgl").addEventListener("click",function(){
  allClosed=!allClosed;secs.forEach(function(s){s.classList.toggle("closed",allClosed)});this.textContent=allClosed?"Expand all":"Collapse all";
});
document.getElementById("theme").addEventListener("click",function(){
  var r=document.documentElement,dark=getComputedStyle(r).getPropertyValue("--bg").trim()==="#0f121a";
  r.setAttribute("data-theme",dark?"light":"dark");
});
document.getElementById("ack").addEventListener("change",function(e){
  document.getElementById("ackMsg").textContent=e.target.checked?"Thank you. Acknowledged on "+new Date().toLocaleString()+".":"";
});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.06});
secs.forEach(function(s){s.classList.add("rv");io.observe(s)});
[].slice.call(document.querySelectorAll(".rules li")).forEach(function(li,i){li.style.setProperty("--d",(i%8)*70+"ms")});
var prog=document.getElementById("prog");
function bar(){var h=document.documentElement.scrollHeight-innerHeight;prog.style.width=(h>0?scrollY/h*100:0)+"%"}
addEventListener("scroll",bar);bar();
