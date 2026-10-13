'use strict';
const el = id => document.getElementById(id);
const safe = v => String(v ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDay = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let client, people = [], savedShifts = [], authorized = false, busy = false;
function note(text) { el('boardStatus').textContent = text; }
function check(r) { if(r.error) throw r.error; return r.data; }
async function rows(table) { const result = []; for(let start=0;;start+=1000) { const page = check(await client.from(table).select('*').order('id').range(start,start+999)); result.push(...page); if(page.length<1000) return result; } }
function clearBoard() { authorized=false; people=[]; savedShifts=[]; el('boardContent').hidden=true; el('boardLogin').hidden=false; ['boardGroups','boardRows','boardCounts'].forEach(id=>el(id).replaceChildren()); }
function renderBoard() {
  const day=el('boardDay').value; if(!day) return;
  const plan=CRARC_PLAN.plan(people,savedShifts,day);
  const active=people.filter(p=>p.llegada<=day && day<p.salida).sort((a,b)=>a.nombre.localeCompare(b.nombre));
  const task=p=>plan.find(t=>t.estadia_id===p.id);
  const feeding=active.filter(p=>!task(p).libre && task(p).tarde===CRARC_PLAN.FEED);
  const prep=active.filter(p=>!task(p).libre && task(p).tarde===CRARC_PLAN.PREP);
  const free=active.filter(p=>task(p).libre);
  const other=active.filter(p=>!task(p).libre && ![CRARC_PLAN.FEED,CRARC_PLAN.PREP].includes(task(p).tarde));
  el('boardCounts').innerHTML=[['Presentes',active.length],['Alimentar animales',feeding.length],['Preparar alimentos',prep.length],['Día libre',free.length]].map(([label,n])=>`<div class="stat"><small>${label}</small><b>${n}</b></div>`).join('');
  const groups=[['Alimentar animales','',feeding],['Cortar frutas y preparar alimentos','prep',prep],['Día libre','free',free]];
  if(other.length) groups.push(['Otras tareas guardadas','',other]);
  el('boardGroups').innerHTML=groups.map(([title,css,list])=>`<article class="card board-group ${css}"><h2>${title}</h2><span class="group-count">${list.length} personas</span>${list.map(p=>`<div class="person-tile"><strong>${safe(p.nombre)}</strong><small>Habitación ${safe(p.habitacion)}</small>${!task(p).libre?`<small>Mañana: ${safe(task(p).manana)}</small>`:''}</div>`).join('')||'<p class="empty">Sin personas en este grupo.</p>'}</article>`).join('');
  el('boardRows').innerHTML=active.map(p=>`<tr><td><strong>${safe(p.nombre)}</strong></td><td>${safe(p.habitacion)}</td><td>${task(p).libre?'Día libre':safe(task(p).manana)}</td><td>${task(p).libre?'Día libre':safe(task(p).tarde)}</td><td>${task(p).saved?'Guardada':'Automática'}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">No hay personas presentes en esta fecha.</td></tr>';
}
async function refreshBoard() {
  if(!authorized || busy) return; busy=true; el('boardRefresh').disabled=true;
  try { [people,savedShifts]=await Promise.all([rows('estadias'),rows('turnos')]); if(!authorized)return; renderBoard(); note('Actualizado.'); }
  catch(e) { note(`No se pudo actualizar: ${e.message}. Los datos anteriores pueden estar desactualizados.`); }
  finally { busy=false; el('boardRefresh').disabled=false; }
}
async function access(session) {
  clearBoard(); if(!session)return;
  const admin=check(await client.from('administradores').select('user_id').eq('user_id',session.user.id).maybeSingle());
  if(!admin)throw new Error('Este usuario no tiene acceso al tablero.');
  authorized=true; el('boardLogin').hidden=true; el('boardContent').hidden=false; await refreshBoard();
}
async function startBoard() {
  el('boardDay').value=localDay();
  if(!window.supabase){note('No se pudo cargar Supabase. Revisa la conexión y recarga.');return;}
  client=window.supabase.createClient(CRARC_DB.url,CRARC_DB.key);
  el('boardDay').onchange=renderBoard;
  el('boardToday').onclick=()=>{el('boardDay').value=localDay();renderBoard();};
  el('boardRefresh').onclick=refreshBoard; el('boardPrint').onclick=()=>window.print();
  el('boardLogout').onclick=async()=>{try{check(await client.auth.signOut());clearBoard();note('Sesión cerrada.');}catch(e){note(e.message);}};
  client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')clearBoard();});
  el('boardLoginForm').onsubmit=async e=>{e.preventDefault();const f=e.target,b=f.querySelector('button');b.disabled=true;try{const data=check(await client.auth.signInWithPassword({email:f.elements.email.value,password:f.elements.password.value}));f.elements.password.value='';await access(data.session);}catch(err){note(err.message);}finally{b.disabled=false;}};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBoard();});
  try{await access(check(await client.auth.getSession()).session);}catch(e){note(e.message);}
}
startBoard();
