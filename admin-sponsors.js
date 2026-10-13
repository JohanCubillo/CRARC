'use strict';
window.CRARC_SPONSOR_ADMIN=(function(){
  const el=id=>document.getElementById(id);
  let animals=[],payments=[],busy=false;
  function renderPayments(){
    const filter=el('sinpeFilter').value;
    el('sinpeRows').innerHTML=payments.filter(p=>!filter||p.estado===filter).map(p=>`<tr><td>${esc(p.fecha)}<small>${esc(p.referencia)}</small></td><td>${esc(animals.find(a=>a.id===p.animal_id)?.nombre||p.animal_id)}</td><td>${esc(p.nombre)}<small>${esc(p.email)}</small></td><td>${money(p.monto,'CRC')}</td><td><span class="badge">${esc(p.estado)}</span></td><td><button data-receipt="${p.id}">Ver comprobante</button>${p.estado==='pendiente'?`<button class="primary" data-accept="${p.id}">Aceptar</button><button data-reject="${p.id}">Rechazar</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No hay reportes SINPE para este filtro.</td></tr>';
  }
  async function load(view){
    if(!userId||busy)return;busy=true;
    const owner=userId;
    try{
      animals=await allRows('padrinos');if(userId!==owner)return;
      animals.sort((a,b)=>a.orden-b.orden||a.nombre.localeCompare(b.nombre));
      el('animalRows').innerHTML=animals.map(a=>`<tr><td>${esc(a.nombre)}</td><td>${a.activo?'Activo':'Oculto'}</td><td>${esc(a.paypal)||'Sin enlace PayPal'}</td><td><button data-animal="${esc(a.id)}">Configurar</button></td></tr>`).join('')||'<tr><td colspan="4" class="empty">No hay animales. Ejecuta apadrinamientos.sql.</td></tr>';
      if(view==='sinpe'){
        payments=await allRows('apadrinamientos_sinpe');if(userId!==owner)return;
        payments.sort((a,b)=>b.created_at.localeCompare(a.created_at));renderPayments();
      }
      el(view==='sinpe'?'sinpeStatus':'animalsStatus').textContent='Datos actualizados.';
    }catch(e){el(view==='sinpe'?'sinpeStatus':'animalsStatus').textContent='No se pudieron cargar los datos. Ejecuta apadrinamientos.sql en Supabase. '+e.message;}
    finally{busy=false;}
  }
  function openAnimal(id){
    const f=el('animalForm');f.reset();f.elements.id.value='';f.elements.id.readOnly=false;
    const a=animals.find(a=>a.id===id);
    if(a){for(const key of ['id','nombre','foto','paypal','especie','historia','orden'])f.elements[key].value=a[key]??'';f.elements.activo.checked=a.activo;f.elements.montos.value=a.montos.join(', ');f.elements.id.readOnly=true;}
    else{f.elements.activo.checked=true;f.elements.montos.value='10, 25, 50';}
    el('animalDialog').showModal();
  }
  function init(){
    el('newAnimal').onclick=()=>openAnimal();el('refreshAnimals').onclick=()=>load('animales');el('refreshSinpe').onclick=()=>load('sinpe');el('sinpeFilter').onchange=renderPayments;
    el('animalRows').onclick=e=>{const b=e.target.closest('[data-animal]');if(b)openAnimal(b.dataset.animal);};
    el('animalForm').onsubmit=async e=>{
      e.preventDefault();const f=e.target,data=Object.fromEntries(new FormData(f));
      data.activo=f.elements.activo.checked;data.orden=Number(data.orden);data.montos=data.montos.split(',').map(n=>Number(n.trim()));
      if(!data.montos.length||data.montos.some(n=>!Number.isInteger(n)||n<=0)){fail(new Error('Los montos deben ser enteros positivos separados por comas.'));return;}
      if(data.paypal && !CRARC_SPONSOR_PAYMENTS.paypalLink(data.paypal,0)){fail(new Error('Usa un enlace HTTPS de paypal.com o paypal.me.'));return;}
      const btn=f.querySelector('button.primary');btn.disabled=true;
      try{unwrap(await db.from('padrinos').upsert(data,{onConflict:'id'}));await load('animales');el('animalDialog').close();status('Configuración del animal guardada.');}catch(err){fail(err);}finally{btn.disabled=false;}
    };
    el('sinpeRows').onclick=async e=>{
      const b=e.target.closest('button');if(!b)return;
      const id=b.dataset.receipt||b.dataset.accept||b.dataset.reject,p=payments.find(p=>p.id===id);if(!p)return;
      b.disabled=true;
      try{
        if(b.dataset.receipt){
          const data=unwrap(await db.storage.from('comprobantes-sinpe').createSignedUrl(p.comprobante,300));
          el('receiptLink').href=data.signedUrl;el('receiptDialog').showModal();
        }else{
          const accept=!!b.dataset.accept;
          if(!confirm(accept?'¿Confirmas que verificaste en el banco el monto y la referencia? Se registrará un ingreso en colones.':'¿Rechazar este reporte SINPE?'))return;
          unwrap(await db.rpc('revisar_sinpe',{p_id:id,p_aceptar:accept}));await load('sinpe');await reload();status(accept?'SINPE aceptado e ingreso registrado.':'SINPE rechazado.');
        }
      }catch(err){fail(err);}finally{b.disabled=false;}
    };
  }
  function clear(){animals=[];payments=[];['animalRows','sinpeRows'].forEach(id=>el(id).replaceChildren());el('receiptLink').removeAttribute('href');}
  return {init,load,clear};
})();
