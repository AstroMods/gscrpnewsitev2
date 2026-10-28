/* Edit departments here. Each department also needs a folder: departments/<k>/index.html */
const DOC = id => ({ edit:`https://docs.google.com/document/d/${id}/edit?usp=sharing`, embed:`https://docs.google.com/document/d/${id}/preview` });
const D = [
  {k:'fbi',  abbr:'FBI',  name:'Federal Bureau of Investigation', type:'law',  color:'#4d8bff', disc:'https://discord.gardenstatecollective.com/fbi',  doc:'1Ya7WdJjuxdkPI61Y143Bkx_SaBhXTghA68xQHG7WAqY', blurb:'Federal investigations, task forces and high-profile case work across the state.'},
  {k:'sasp', abbr:'SASP', name:'San Andreas State Police',        type:'law',  color:'#22e4ff', disc:'https://discord.gardenstatecollective.com/sasp', doc:'1qtVaJJwo2ChlrE-EOygUr_1shs6dPkIuKH_HPpv0uSY', blurb:'Statewide highway patrol, traffic enforcement and rapid response.'},
  {k:'bcso', abbr:'BCSO', name:"Blaine County Sheriff's Office",  type:'law',  color:'#ffb020', disc:'https://discord.gardenstatecollective.com/bcso', doc:'1AEBVUhYGA2TJ2c-7I_G8-GlrsUikdV-n0HNAHf1IgeM', blurb:'County law enforcement, patrol, corrections and rural operations.'},
  {k:'safr', abbr:'SAFR', name:'San Andreas Fire & Rescue',       type:'fire', color:'#ff4b3e', disc:'https://discord.gardenstatecollective.com/safr', doc:'1oKpw3M0PVgr36M3RV8Jxik-AAAxSe9NsI8aRXsycX34', blurb:'Fire suppression, EMS, rescue and medical response.'},
  {k:'sams', abbr:'SAMS', name:'San Andreas Marshals Service',    type:'law',  color:'#ff2e93', disc:'https://discord.gardenstatecollective.com/sams', doc:'1vSMtjEmqYr9cD8JXlC5JPgMdzmHh4r1-BHHiye76BP4', blurb:'Court security, fugitive apprehension and prisoner transport.'},
  {k:'mpd',  abbr:'MPD',  name:'Municipal Police Department',     type:'law',  color:'#8b5cff', disc:null, doc:'1mORtMVuP48fCMitYcskfX-Vmq6MsQp7lEf3lgTvIXYk', blurb:'City policing, community response and local investigations.'},
  {k:'sadot',abbr:'SADOT',name:'San Andreas Dept. of Transportation', type:'civil', color:'#3dff9a', disc:null, doc:'18E-jfoTK4YOnBSK9U9PcV4J6ugdqf3pNf9pWLq8GTc8', blurb:'Roads, tow, traffic incident management and infrastructure.'}
];
const HUB = 'https://discord.gardenstatecollective.com/hub';
D.forEach(d=>Object.assign(d,DOC(d.doc)));
D.forEach(d=>d.path='departments/'+d.k+'/');
