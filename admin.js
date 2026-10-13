'use strict';
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateUTC = value => new Date(`${value}T12:00:00Z`);
const nights = s => Math.round((dateUTC(s.salida) - dateUTC(s.llegada)) / 86400000);
const weekdays = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const money = (value, currency) => new Intl.NumberFormat('es-CR', {style:'currency',currency}).format(value);
const titles = {resumen:'Resumen financiero',personas:'Personas y estadías',tareas:'Organización del día',finanzas:'Ingresos y gastos',formularios:'Formularios recibidos'};
let contacts=[], contactsLoading=false;
function renderContacts() {
  const query=$('contactSearch').value.toLowerCase(), interest=$('contactInterest').value;
  $('contactRows').innerHTML=contacts.filter(c=>`${c.nombre} ${c.email} ${c.whatsapp}`.toLowerCase().includes(query) && (!interest || c.interes===interest)).map(c=>{
    const timestamp=new Date(c.created_at);
    const received=Number.isNaN(timestamp.getTime()) ? '' : new Intl.DateTimeFormat('es-CR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Costa_Rica'}).format(timestamp);
    return `<tr><td>${esc(received)}</td><td><strong>${esc(c.nombre)}</strong></td><td>${esc(c.email)}<small>${esc(c.whatsapp)}</small></td><td>${esc(c.interes)}</td><td><details><summary>Ver detalles</summary><p>Personas: ${esc(c.personas)}<br>Dieta: ${esc(c.dieta)}<br>Alergias: ${esc(c.alergias)}<br>Idioma: ${esc(c.idioma)}<br>Página: ${esc(c.pagina)}</p></details></td></tr>`;
  }).join('') || '<tr><td colspan="5" class="empty">No hay consultas para este filtro.</td></tr>';
}
async function loadContacts() {
  if (!userId || contactsLoading) return;
  contactsLoading=true; const owner=userId; $('refreshContacts').disabled=true; $('contactStatus').textContent='Cargando consultas…';
  try {
    const data=await allRows('contactos'); if (userId!==owner) return;
    contacts=data.sort((a,b)=>b.created_at.localeCompare(a.created_at));
    const interest=$('contactInterest').value;
    $('contactInterest').innerHTML='<option value="">Todos</option>'+[...new Set(contacts.map(c=>c.interes))].filter(Boolean).sort().map(i=>`<option value="${esc(i)}">${esc(i)}</option>`).join('');
    $('contactInterest').value=interest; renderContacts(); $('contactStatus').textContent=`${contacts.length} consultas recibidas.`;
  } catch(e) {
    $('contactStatus').textContent='No se pudieron consultar los formularios. Ejecuta formularios-admin.sql en Supabase y vuelve a actualizar. '+e.message;
  } finally { contactsLoading=false; $('refreshContacts').disabled=false; }
}
let db, stays = [], movements = [], shifts = [], userId = null, loading = false;
let leaders = [];
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : 'success'; }
function fail(error) { status(error.message || 'No se pudo completar la operación.', true); }
function unwrap(result) { if (result.error) throw result.error; return result.data; }
async function allRows(table) {
  const rows = [];
  for (let offset = 0;; offset += 1000) {
    const page = unwrap(await db.from(table).select('*').order('id').range(offset, offset + 999));
    rows.push(...page); if (page.length < 1000) return rows;
  }
}
async function reload() {
  if (!userId || loading) return;
  loading = true;
  try {
    const data = await Promise.all([allRows('estadias'),allRows('movimientos'),allRows('turnos')]);
    [stays,movements,shifts] = data;
    const leadership = await db.from('encargados').select('*');
    leaders = leadership.error ? [] : leadership.data;
    $('leadersStatus').textContent = leadership.error ? 'Ejecuta encargados.sql en Supabase para activar la elección de encargados.' : '';
    stays.sort((a,b) => a.llegada.localeCompare(b.llegada));
    movements.sort((a,b) => b.fecha.localeCompare(a.fecha));
    render();
    await publishPublicBoard();
  } finally { loading = false; }
}
function present(s, day) { return s.llegada <= day && day < s.salida; }
async function publishPublicBoard() {
  $('publicationStatus').textContent = 'El tablero calcula las tareas automáticamente. No necesitas publicar cada día. Activa turnos-automaticos.sql en Supabase si aún no lo hiciste.';
}
let planCache = {stays:null, shifts:null, day:null, items:[]};
function assigned(s, day) {
  if (planCache.stays !== stays || planCache.shifts !== shifts || planCache.day !== day) {
    planCache = {stays, shifts, day, items:CRARC_PLAN.plan(stays,shifts,day)};
  }
  return planCache.items.find(t => t.estadia_id === s.id) || {
    estadia_id:s.id, fecha:day, libre:s.dia_libre !== null && s.dia_libre === dateUTC(day).getUTCDay(),
    manana:s.tarea_manana, tarde:s.tarea_tarde
  };
}
function paid(id) {
  return ['USD','CRC'].map(c => {
    const amount = movements.filter(m => m.tipo === 'ingreso' && m.estadia_id === id && m.moneda === c).reduce((n,m) => n + Number(m.monto),0);
    return amount ? money(amount,c) : '';
  }).filter(Boolean).join(' · ') || 'Sin pagos registrados';
}
function renderStays() {
  const query = $('search').value.toLowerCase(), filter = $('stayFilter').value, day = today();
  const rows = stays.filter(s => `${s.nombre} ${s.habitacion}`.toLowerCase().includes(query) &&
    (filter === 'all' || filter === 'active' && present(s,day) || filter === 'future' && s.llegada > day || filter === 'past' && s.salida <= day));
  $('stayRows').innerHTML = rows.map(s => `<tr><td><strong>${esc(s.nombre)}</strong><small>${esc(s.email)}</small></td><td>${esc(s.habitacion)}</td><td>${esc(s.llegada)} → ${esc(s.salida)}<small>${nights(s)} noches · salida no incluida</small></td><td>${s.dia_libre === null ? 'Sin día fijo' : weekdays[s.dia_libre]}</td><td>${esc(paid(s.id))}</td><td><button data-edit-stay="${s.id}">Editar</button><button data-pay="${s.id}">Pago</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No hay personas para este filtro. Agrega la primera estadía.</td></tr>';
}
function renderMovements() {
  const from = $('from').value, to = $('to').value, type = $('typeFilter').value;
  $('movementRows').innerHTML = movements.filter(m => (!from || m.fecha >= from) && (!to || m.fecha <= to) && (type === 'all' || m.tipo === type)).map(m => {
    const person = stays.find(s => s.id === m.estadia_id);
    return `<tr><td>${esc(m.fecha)}</td><td>${esc(m.concepto)}<small>${esc(person?.nombre || '')}</small></td><td>${esc(m.categoria)}</td><td><span class="badge ${m.tipo}">${m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</span></td><td>${money(m.monto,m.moneda)}</td><td><button data-edit-movement="${m.id}">Editar</button><button data-delete-movement="${m.id}">Eliminar</button></td></tr>`;
  }).join('') || '<tr><td colspan="6" class="empty">No hay movimientos en este período.</td></tr>';
}
function renderTasks() {
  const day = $('day').value; if (!day) return;
  const plan = CRARC_PLAN.plan(stays,shifts,day);
  const leadership = [...leaders].filter(l => l.fecha <= day).sort((a,b) => b.fecha.localeCompare(a.fecha))[0];
  for (const [id,task,key] of [['feedLeader',CRARC_PLAN.FEED,'alimentacion'],['prepLeader',CRARC_PLAN.PREP,'preparacion']]) {
    const candidates = stays.filter(s => plan.some(t => t.estadia_id === s.id && !t.libre));
    $(id).innerHTML = '<option value="">'+(candidates.length ? 'Selecciona un encargado' : 'Sin personas disponibles')+'</option>' + candidates.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
    $(id).disabled = !candidates.length; $(id).required = true;
    $(id).value = leadership?.[key] || '';
  }
  $('taskCards').innerHTML = stays.filter(s => present(s,day)).map(s => {
    const t = assigned(s,day);
    const options = selected => [CRARC_PLAN.FEED,CRARC_PLAN.PREP].map(task => `<option ${task===selected?'selected':''}>${task}</option>`).join('');
    return `<form class="card task-form" data-person="${s.id}"><h2>${esc(s.nombre)}</h2><p>${esc(s.habitacion)} · ${t.saved ? 'Guardado' : 'Reparto automático'}</p><label>Estado<select name="libre"><option value="false" ${!t.libre ? 'selected' : ''}>Disponible</option><option value="true" ${t.libre ? 'selected' : ''}>Día libre</option></select></label><label>Mañana<select name="manana" ${t.libre ? 'disabled' : ''}>${options(t.manana)}</select></label><label>Tarde<select name="tarde" ${t.libre ? 'disabled' : ''}>${options(t.tarde)}</select></label><p class="hint">Al cambiar una tarea, la otra se asigna automáticamente.</p><button class="primary">Guardar día</button></form>`;
  }).join('') || '<div class="card empty">No hay personas hospedadas en esta fecha.</div>';
}
function totals(rows, type) { return rows.filter(m => m.tipo === type).reduce((n,m) => n + Number(m.monto),0); }
function renderSummary() {
  const month = $('month').value, currency = $('chartCurrency').value; if (!month) return;
  const rows = movements.filter(m => m.moneda === currency && m.fecha.startsWith(month));
  const income = totals(rows,'ingreso'), expense = totals(rows,'gasto');
  const active = stays.filter(s => present(s,today()));
  $('stats').innerHTML = [['Ingresos recibidos',money(income,currency),'Mes seleccionado'],['Gastos registrados',money(expense,currency),'Mes seleccionado'],['Balance',money(income-expense,currency),'Ingresos menos gastos'],['Personas hoy',active.length,'Estadías en curso']].map(([label,value,note]) => `<div class="stat"><small>${label}</small><b>${value}</b><small>${note}</small></div>`).join('');
  const base = dateUTC(`${month}-01`), months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(base); date.setUTCMonth(date.getUTCMonth()-i);
    const key = date.toISOString().slice(0,7), r = movements.filter(m => m.moneda === currency && m.fecha.startsWith(key));
    months.push({key,income:totals(r,'ingreso'),expense:totals(r,'gasto')});
  }
  const max = Math.max(1,...months.flatMap(m => [m.income,m.expense]));
  $('chart').setAttribute('aria-label', months.map(m => `${m.key}: ingresos ${money(m.income,currency)}, gastos ${money(m.expense,currency)}`).join('; '));
  $('chart').innerHTML = months.map(m => `<div class="chart-group"><div class="bars"><div class="bar" style="height:${m.income/max*100}%" title="Ingresos ${money(m.income,currency)}"></div><div class="bar expense" style="height:${m.expense/max*100}%" title="Gastos ${money(m.expense,currency)}"></div></div><div class="chart-label">${m.key}</div></div>`).join('');
  const cats = new Map(); rows.filter(m => m.tipo === 'gasto').forEach(m => cats.set(m.categoria,(cats.get(m.categoria)||0)+Number(m.monto)));
  $('categories').innerHTML = [...cats].sort((a,b) => b[1]-a[1]).map(([c,n]) => `<div class="category"><div><span>${esc(c)}</span><b>${money(n,currency)}</b></div><progress max="${expense}" value="${n}" aria-label="${esc(c)}"></progress></div>`).join('') || '<p class="empty">Aún no hay gastos registrados en este mes.</p>';
  $('todaySummary').innerHTML = active.length ? active.map(s => `<p><strong>${esc(s.nombre)}</strong> · ${esc(s.habitacion)} · ${assigned(s,today()).libre ? 'Día libre' : esc(assigned(s,today()).tarde)}</p>`).join('') : '<p>No hay estadías en curso hoy.</p>';
}
function render() { renderStays(); renderMovements(); renderTasks(); renderSummary(); }
function openStay(id) {
  const f = $('stayForm'); f.reset(); f.elements.id.value = '';
  const s = stays.find(s => s.id === id);
  if (s) Object.entries(s).forEach(([k,v]) => { if (f.elements[k]) f.elements[k].value = v ?? ''; });
  else f.elements.llegada.value = today();
  f.elements.tarea_manana.value = CRARC_PLAN.opposite(f.elements.tarea_tarde.value);
  $('stayHeading').textContent = s ? 'Editar estadía' : 'Agregar persona'; $('stayDialog').showModal();
}
function openMovement(id, personId) {
  const f = $('movementForm'); f.reset(); f.elements.id.value = ''; f.elements.fecha.value = today();
  f.elements.estadia_id.innerHTML = '<option value="">Sin persona asociada</option>' + stays.map(s => `<option value="${s.id}">${esc(s.nombre)} · ${esc(s.llegada)}</option>`).join('');
  const m = movements.find(m => m.id === id);
  if (m) Object.entries(m).forEach(([k,v]) => { if (f.elements[k]) f.elements[k].value = v ?? ''; });
  if (personId) { f.elements.estadia_id.value = personId; f.elements.concepto.value = 'Pago de estadía'; }
  $('paymentPerson').hidden = f.elements.tipo.value === 'gasto'; $('movementDialog').showModal();
}
async function saveForm(form, operation) {
  const btn = form.querySelector('button.primary') || form.querySelector('button'); btn.disabled = true;
  try { await operation(); await reload(); form.closest('dialog')?.close(); status('Guardado correctamente.'); } catch(e) { fail(e); } finally { btn.disabled = false; }
}
function hideWorkspace() {
  contacts=[]; $('contactRows').replaceChildren(); $('contactStatus').textContent='';
  userId = null; stays = []; movements = []; shifts = [];
  $('workspace').hidden = true; $('login').hidden = false; $('logout').hidden = true;
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  ['stats','chart','categories','todaySummary','stayRows','movementRows','taskCards'].forEach(id => $(id).replaceChildren());
}
async function authorize(session) {
  hideWorkspace(); if (!session) return;
  const access = unwrap(await db.from('administradores').select('user_id').eq('user_id',session.user.id).maybeSingle());
  if (!access) throw new Error('Este usuario no tiene acceso al panel. Autorízalo en la tabla administradores.');
  userId = session.user.id; await reload();
  $('workspace').hidden = false; $('login').hidden = true; $('logout').hidden = false; $('title').textContent = titles.resumen;
}
async function init() {
  $('month').value = today().slice(0,7); $('day').value = today();
  if (!window.supabase) { fail(new Error('No se pudo cargar el acceso a Supabase. Revisa tu conexión y recarga.')); return; }
  db = window.supabase.createClient(CRARC_DB.url,CRARC_DB.key);
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, btn = f.querySelector('button'); btn.disabled = true; status('Iniciando sesión…');
    try { const data = unwrap(await db.auth.signInWithPassword({email:f.elements.email.value,password:f.elements.password.value})); f.elements.password.value = ''; await authorize(data.session); status('Sesión iniciada.'); } catch(err) { fail(err); } finally { btn.disabled = false; }
  });
  $('logout').onclick = async () => { try { unwrap(await db.auth.signOut()); hideWorkspace(); status('Sesión cerrada.'); } catch(e) { fail(e); } };
  db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') hideWorkspace(); });
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
    document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== b.dataset.view);
    document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('active',x === b)); $('title').textContent = titles[b.dataset.view];
    if (b.dataset.view==='formularios') loadContacts();
  });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  $('newStay').onclick = () => openStay(); $('newMovement').onclick = () => openMovement();
  $('refreshContacts').onclick=loadContacts;
  ['contactSearch','contactInterest'].forEach(id=>$(id).addEventListener('input',renderContacts));
  const stayForm = $('stayForm');
  stayForm.elements.tarea_tarde.onchange = () => { stayForm.elements.tarea_manana.value = CRARC_PLAN.opposite(stayForm.elements.tarea_tarde.value); };
  stayForm.elements.tarea_manana.onchange = () => { stayForm.elements.tarea_tarde.value = CRARC_PLAN.opposite(stayForm.elements.tarea_manana.value); };
  $('leadersForm').onsubmit = e => {
    e.preventDefault(); const day = $('day').value;
    const data = {fecha:day,alimentacion:$('feedLeader').value || null,preparacion:$('prepLeader').value || null};
    if (!day) return;
    const candidate = CRARC_PUBLIC_BOARD.snapshot(stays,shifts,day,data);
    if (!candidate.valid) { fail(new Error('Elige dos personas distintas y disponibles: una de cocina y otra de repartición y limpieza.')); return; }
    saveForm(e.target,async () => { unwrap(await db.from('encargados').upsert(data,{onConflict:'fecha'})); });
  };
  $('publishBoard').onclick = async () => {
    $('publishBoard').disabled = true;
    try { await reload(); } catch(e) { fail(e); } finally { $('publishBoard').disabled = false; }
  };
  ['search','stayFilter'].forEach(id => $(id).addEventListener('input',renderStays));
  ['from','to','typeFilter'].forEach(id => $(id).addEventListener('input',renderMovements));
  ['month','chartCurrency'].forEach(id => $(id).addEventListener('input',renderSummary)); $('day').onchange = renderTasks;
  $('movementForm').elements.tipo.onchange = e => { $('paymentPerson').hidden = e.target.value === 'gasto'; };
  $('stayForm').onsubmit = e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f)), id = data.id; delete data.id;
    data.dia_libre = data.dia_libre === '' ? null : Number(data.dia_libre);
    data.tarea_manana = CRARC_PLAN.opposite(data.tarea_tarde);
    if (data.salida <= data.llegada) { fail(new Error('La salida debe ser posterior a la llegada.')); return; }
    saveForm(f, async () => { unwrap(await (id ? db.from('estadias').update(data).eq('id',id) : db.from('estadias').insert(data))); });
  };
  $('movementForm').onsubmit = e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f)), id = data.id; delete data.id;
    data.monto = Number(data.monto); data.estadia_id = data.tipo === 'ingreso' && data.estadia_id ? data.estadia_id : null;
    saveForm(f, async () => { unwrap(await (id ? db.from('movimientos').update(data).eq('id',id) : db.from('movimientos').insert(data))); });
  };
  $('stayRows').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.editStay) openStay(b.dataset.editStay); if (b.dataset.pay) openMovement(null,b.dataset.pay); };
  $('movementRows').onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.editMovement) openMovement(b.dataset.editMovement);
    if (b.dataset.deleteMovement && confirm('¿Eliminar este movimiento? El balance se actualizará.')) {
      b.disabled = true; try { unwrap(await db.from('movimientos').delete().eq('id',b.dataset.deleteMovement)); await reload(); status('Movimiento eliminado.'); } catch(err) { fail(err); b.disabled = false; }
    }
  };
  $('taskCards').onchange = e => {
    const f=e.target.form;
    if (e.target.name === 'libre') ['manana','tarde'].forEach(n => f.elements[n].disabled = e.target.value === 'true');
    if (e.target.name === 'manana') f.elements.tarde.value=CRARC_PLAN.opposite(e.target.value);
    if (e.target.name === 'tarde') f.elements.manana.value=CRARC_PLAN.opposite(e.target.value);
  };
  $('taskCards').onsubmit = e => {
    e.preventDefault(); const f = e.target;
    const libre=f.elements.libre.value === 'true';
    const data = {estadia_id:f.dataset.person,fecha:$('day').value,libre,manana:libre?'':CRARC_PLAN.opposite(f.elements.tarde.value),tarde:libre?'':f.elements.tarde.value};
    saveForm(f, async () => { unwrap(await db.from('turnos').upsert(data,{onConflict:'estadia_id,fecha'})); });
  };
  $('distribute').onclick = async () => {
    const day = $('day').value; if (!day) return;
    const available = stays.filter(s => present(s,day) && !assigned(s,day).libre).sort((a,b) => a.id.localeCompare(b.id));
    if (!available.length) { status('No hay personas disponibles para repartir tareas.'); return; }
    if (shifts.some(t => t.fecha === day && !t.libre) && !confirm('¿Reemplazar las tareas de la tarde de esta fecha?')) return;
    const data = CRARC_PLAN.plan(stays,shifts,day,true).filter(t => !t.libre).map(({saved,...t}) => t);
    $('distribute').disabled = true;
    try { unwrap(await db.from('turnos').upsert(data,{onConflict:'estadia_id,fecha'})); await reload(); status('Tareas repartidas y guardadas.'); } catch(e) { fail(e); } finally { $('distribute').disabled = false; }
  };
  try { const {session} = unwrap(await db.auth.getSession()); await authorize(session); } catch(e) { fail(e); }
}
init();
