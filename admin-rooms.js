'use strict';
let rooms=[], roomsReady=false;
async function loadRooms(){
  try { rooms=await allRows('habitaciones'); roomsReady=true; $('roomStatus').textContent=''; renderRooms(); }
  catch(e){rooms=[];roomsReady=false;$('roomStatus').textContent='Para activar habitaciones, ejecuta habitaciones.sql en Supabase. '+e.message;}
}
function renderRooms(){
  const arrival=$('roomArrival').value,departure=$('roomDeparture').value,people=Number($('roomPeople').value)||1;
  if(!arrival || departure<=arrival){$('roomRows').innerHTML='<tr><td colspan="5">Elige una salida posterior a la llegada.</td></tr>';return;}
  $('roomRows').innerHTML=rooms.map(r=>{const occupied=CRARC_ROOMS_DATA.peak(stays,r,arrival,departure),free=Math.max(0,r.capacidad-occupied);return `<tr><td><strong>${esc(r.nombre)}</strong></td><td>${r.capacidad}</td><td>${occupied}</td><td>${r.habilitada?(free>=people?`${free} cupos disponibles`:`${free} cupos · insuficientes`):'No disponible'}</td><td><button data-edit-room="${r.id}">Editar</button></td></tr>`;}).join('') || '<tr><td colspan="5">Crea tu primera habitación.</td></tr>';
}
function refreshStayRooms(){
  const f=$('stayForm'),select=f.elements.habitacion_id,existing=stays.find(s=>s.id===f.elements.id.value),selected=select.value||existing?.habitacion_id||'';
  const valid=f.elements.llegada.value && f.elements.salida.value>f.elements.llegada.value;
  select.innerHTML='<option value="">Selecciona una habitación</option>'+rooms.map(r=>{
    const free=valid?Math.max(0,r.capacidad-CRARC_ROOMS_DATA.peak(stays,r,f.elements.llegada.value,f.elements.salida.value,existing?.id)):r.capacidad;
    return `<option value="${r.id}" ${((!r.habilitada && r.id!==existing?.habitacion_id) || free<1)?'disabled':''}>${esc(r.nombre)} · ${r.habilitada?`${free} cupos${valid?' para estas fechas':''}`:'No disponible'}</option>`;
  }).join('');
  if(!selected && existing && !existing.habitacion_id){select.insertAdjacentHTML('beforeend',`<option value="legacy">Actual: ${esc(existing.habitacion)} · pendiente de vincular</option>`);select.value='legacy';}
  else select.value=selected;
  $('stayRoomHint').textContent=roomsReady?'Cada persona ocupa un cupo. La salida libera el cupo ese mismo día.':'Primero activa habitaciones.sql y crea los cuartos en Habitaciones.';
}
function initRooms(){
  $('roomArrival').value=today();const next=new Date(dateUTC(today()).getTime()+86400000);$('roomDeparture').value=next.toISOString().slice(0,10);
  ['roomArrival','roomDeparture','roomPeople'].forEach(id=>$(id).oninput=renderRooms);
  $('newRoom').onclick=()=>openRoom();$('roomRows').onclick=e=>{const b=e.target.closest('[data-edit-room]');if(b)openRoom(b.dataset.editRoom);};
  $('roomForm').onsubmit=e=>{e.preventDefault();const f=e.target,id=f.elements.id.value,data={nombre:f.elements.nombre.value.trim(),capacidad:Number(f.elements.capacidad.value),habilitada:f.elements.habilitada.checked};saveForm(f,async()=>{unwrap(await(id?db.from('habitaciones').update(data).eq('id',id):db.from('habitaciones').insert(data)));});};
  ['llegada','salida'].forEach(n=>$('stayForm').elements[n].addEventListener('change',refreshStayRooms));
}
function openRoom(id){const f=$('roomForm');f.reset();f.elements.id.value=id||'';const r=rooms.find(r=>r.id===id);if(r){f.elements.nombre.value=r.nombre;f.elements.capacidad.value=r.capacidad;f.elements.habilitada.checked=r.habilitada;}$('roomDialog').showModal();}
