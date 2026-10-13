'use strict';
const el = id => document.getElementById(id);
const safe = v => String(v ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDay = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let busy=false, requestVersion=0, viewedDay='';
function note(text) { el('boardStatus').textContent=text; }
function clearBoard() { ['boardLeaders','boardGroups','boardRows','boardCounts'].forEach(id=>el(id).replaceChildren()); }
function renderBoard(active) {
  active=[...active].sort((a,b)=>a.nombre.localeCompare(b.nombre));
  el('boardLeaders').innerHTML = `<h2>¿Tienes dudas? Consulta a los encargados</h2><div class="two">${['Cocina','Repartición y limpieza'].map(role => {
    const leader = active.find(p => p.encargado && p.rol_encargado === role);
    return `<div class="stat"><small>Encargado de ${role.toLowerCase()}</small><b>${leader ? safe(leader.nombre) : 'Pendiente de asignar'}</b></div>`;
  }).join('')}</div>`;
  const feeding=active.filter(p=>!p.libre && p.tarde==='Alimentar animales');
  const prep=active.filter(p=>!p.libre && p.tarde==='Cortar frutas y preparar alimentos');
  const free=active.filter(p=>p.libre);
  const other=active.filter(p=>!p.libre && !['Alimentar animales','Cortar frutas y preparar alimentos'].includes(p.tarde));
  el('boardCounts').innerHTML=[['Presentes',active.length],['Alimentar animales',feeding.length],['Preparar alimentos',prep.length],['Día libre',free.length]].map(([label,n])=>`<div class="stat"><small>${label}</small><b>${n}</b></div>`).join('');
  const groups=[['Alimentar animales','',feeding],['Cortar frutas y preparar alimentos','prep',prep],['Día libre','free',free]];
  if(other.length)groups.push(['Otras tareas','',other]);
  el('boardGroups').innerHTML=groups.map(([title,css,list])=>`<article class="card board-group ${css}"><h2>${title}</h2><span class="group-count">${list.length} personas</span>${list.sort((a,b)=>Number(!!b.encargado)-Number(!!a.encargado)).map(p=>`<div class="person-tile"><strong>${safe(p.nombre)}</strong>${p.encargado?`<small class="leader-badge">★ Encargado de ${safe(p.rol_encargado || 'día')}</small>`:''}${!p.libre?`<small>Mañana: ${safe(p.manana)}</small>`:''}</div>`).join('')||'<p class="empty">Sin personas en este grupo.</p>'}</article>`).join('');
  el('boardRows').innerHTML=active.map(p=>`<tr><td><strong>${safe(p.nombre)}</strong>${p.encargado?'<small>★ Encargado</small>':''}</td><td>${p.libre?'Día libre':safe(p.manana)}</td><td>${p.libre?'Día libre':safe(p.tarde)}</td><td>${p.saved?'Guardada':'Automática'}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No hay personas presentes en esta fecha.</td></tr>';
}
async function refreshBoard() {
  const day=el('boardDay').value;if(!day)return;
  const version=++requestVersion;busy=true;el('boardRefresh').disabled=true;
  if(viewedDay!==day){clearBoard();viewedDay=day;}
  el('boardDate').textContent=new Intl.DateTimeFormat('es-CR',{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  try {
    // Lectura anónima de la copia pública, sin utilizar la sesión administrativa.
    const data=await CRARC_DB.request('rpc/tablero_del_dia',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({p_fecha:day})});
    if(version!==requestVersion)return;
    renderBoard(data.personas);
    note('Actualización automática: '+new Intl.DateTimeFormat('es-CR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Costa_Rica'}).format(new Date(data.calculado_at)));
  }catch(e){if(version===requestVersion)note('No se pudo actualizar el tablero. Los datos visibles pueden estar desactualizados.');}
  finally{if(version===requestVersion){busy=false;el('boardRefresh').disabled=false;}}
}
function startBoard() {
  let followingToday=true;
  el('boardDay').value=localDay();el('boardDay').onchange=()=>{followingToday=false;refreshBoard();};
  el('boardToday').onclick=()=>{followingToday=true;el('boardDay').value=localDay();refreshBoard();};
  el('boardRefresh').onclick=refreshBoard;
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBoard();});
  setInterval(()=>{if(!document.hidden && !busy){if(followingToday)el('boardDay').value=localDay();refreshBoard();}},60000);
  refreshBoard();
}
startBoard();
