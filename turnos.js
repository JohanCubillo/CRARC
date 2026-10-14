'use strict';
const el = id => document.getElementById(id);
const safe = v => String(v ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDay = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let busy=false, requestVersion=0, viewedDay='';
function note(text) { el('boardStatus').textContent=text; }
function clearBoard() { ['boardLeaders','boardRows','boardCounts'].forEach(id=>el(id).replaceChildren()); }
function renderBoard(active) {
  active=[...active].sort((a,b)=>a.nombre.localeCompare(b.nombre));
  el('boardLeaders').innerHTML=`<span class="board-leader-caption">¿Dudas? Consulta a:</span>${['Cocina','Repartición y limpieza'].map(role=>{
    const leader=active.find(p=>p.encargado && p.rol_encargado===role);
    return `<div><span>${role}</span><strong>${leader?safe(leader.nombre):'Pendiente de asignar'}</strong></div>`;
  }).join('')}`;
  const free=active.filter(p=>p.libre).length;
  el('boardCounts').textContent=`${active.length} ${active.length===1?'persona presente':'personas presentes'}${free?' · '+free+' en día libre':''}`;
  function task(value){const text=value==='Alimentar animales'?'Alimentar animales':value==='Cortar frutas y preparar alimentos'?'Preparar alimentos':value||'Sin asignar';return `<span class="board-task ${value==='Alimentar animales'?'feed':value==='Cortar frutas y preparar alimentos'?'prep':''}">${safe(text)}</span>`;}
  el('boardRows').innerHTML=active.map(p=>`<tr><td class="board-person"><strong>${safe(p.nombre)}</strong>${p.encargado?`<small>★ ${safe(p.rol_encargado||'Encargado')}</small>`:''}</td><td data-label="Mañana">${p.libre?'<span class="board-task free">Día libre</span>':task(p.manana)}</td><td data-label="Tarde">${p.libre?'<span class="board-task free">Día libre</span>':task(p.tarde)}</td></tr>`).join('')||'<tr><td colspan="3" class="empty">No hay personas presentes en esta fecha.</td></tr>';
}
async function refreshBoard() {
  const day=el('boardDay').value;if(!day)return;
  const version=++requestVersion;busy=true;el('boardToday').hidden=day===localDay();
  if(viewedDay!==day){clearBoard();viewedDay=day;}
  el('boardDate').textContent=new Intl.DateTimeFormat('es-CR',{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
  try {
    // Lectura anónima de la copia pública, sin utilizar la sesión administrativa.
    const data=await CRARC_DB.request('rpc/tablero_del_dia',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({p_fecha:day})});
    if(version!==requestVersion)return;
    renderBoard(data.personas);
    note('Se actualiza automáticamente cada minuto · Última actualización: '+new Intl.DateTimeFormat('es-CR',{timeStyle:'short',timeZone:'America/Costa_Rica'}).format(new Date(data.calculado_at)));
  }catch(e){if(version===requestVersion)note('No se pudo actualizar el tablero. Los datos visibles pueden estar desactualizados.');}
  finally{if(version===requestVersion){busy=false;}}
}
function startBoard() {
  let followingToday=true;
  el('boardDay').value=localDay();el('boardDay').onchange=()=>{followingToday=false;refreshBoard();};
  el('boardToday').onclick=()=>{followingToday=true;el('boardDay').value=localDay();refreshBoard();};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBoard();});
  setInterval(()=>{if(!document.hidden && !busy){if(followingToday)el('boardDay').value=localDay();refreshBoard();}},60000);
  refreshBoard();
}
startBoard();
