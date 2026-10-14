(()=>{
 'use strict';if(!window.CRARC_DB)return;
 const launch=document.createElement('button');launch.className='cr-chat-launch';launch.innerHTML='<img class="cr-chat-avatar" src="images/queso-asistente.png?v=2" alt=""><span>Habla con Queso</span>';launch.setAttribute('aria-label','Abrir chat con Queso, asistente de CRARC');launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','crChat');
 const panel=document.createElement('section');panel.className='cr-chat';panel.id='crChat';panel.hidden=true;panel.setAttribute('aria-label','Queso, asistente de CRARC');
 panel.innerHTML=`<div class="cr-chat-top"><div class="cr-chat-identity"><img class="cr-chat-avatar" src="images/queso-asistente.png?v=2" alt="Queso"><div><strong>Queso</strong><small>Tu asistente de CRARC</small></div></div><button type="button" aria-label="Cerrar chat">×</button></div><div class="cr-chat-log" role="log" aria-live="polite"></div><p class="cr-chat-status" role="status"></p><details><summary>Consultar habitaciones</summary><form class="cr-chat-rooms"><label>Llegada<input name="arrival" type="date" required></label><label>Salida<input name="departure" type="date" required></label><label>Personas<input name="people" type="number" min="1" max="1000" value="1" required></label><button>Consultar cupos</button></form></details><p class="cr-chat-note">Asistente de IA · Las reservas se confirman con el equipo. <a href="conocenos.html#contacto">Contactar</a></p><form class="cr-chat-send"><input name="message" aria-label="Tu pregunta" maxlength="1200" placeholder="Escribe tu pregunta…" required><button>Enviar</button></form>`;
 document.body.append(launch,panel);
 const log=panel.querySelector('.cr-chat-log'),status=panel.querySelector('.cr-chat-status'),form=panel.querySelector('.cr-chat-send'),history=[];let busy=false;
 function add(text,user=false){const p=document.createElement('p');p.className='cr-chat-msg'+(user?' cr-chat-user':'');p.textContent=text;log.append(p);log.scrollTop=log.scrollHeight;}
 add('¡Hola! Soy Queso, tu asistente de CRARC. Puedo orientarte sobre visitas, voluntariado y apadrinamientos. Para ver cupos por fecha, abre “Consultar habitaciones”.');
 function close(){panel.hidden=true;launch.hidden=false;launch.setAttribute('aria-expanded','false');launch.focus();}
 launch.onclick=()=>{panel.hidden=false;launch.hidden=true;launch.setAttribute('aria-expanded','true');form.elements.message.focus();};panel.querySelector('.cr-chat-top button').onclick=close;
 panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 async function send(message,dates){
   if(busy)return;busy=true;add(message,true);status.textContent='Queso está consultando…';panel.querySelectorAll('form button').forEach(b=>b.disabled=true);
   try{
     const messages=[...history,{role:'user',content:message}].slice(-11);
     const response=await fetch(CRARC_DB.url+'/functions/v1/chatbot',{method:'POST',headers:{'Content-Type':'application/json',apikey:CRARC_DB.key},body:JSON.stringify({messages,...dates}),signal:AbortSignal.timeout(35000)});
     let data;try{data=await response.json();}catch{throw new Error('El asistente todavía no está disponible. Usa Contactar.');}
     if(!response.ok)throw new Error(data.error||'El asistente todavía no está disponible. Usa Contactar.');
     add(data.answer);if(Array.isArray(data.rooms)){data.rooms.forEach(r=>add(`${r.nombre}: ${r.cupos} cupos de ${r.capacidad}. ${r.disponible?'Disponible para el grupo.':'No disponible para todo el grupo.'}`));if(!data.rooms.length)add('No hay habitaciones configuradas. Consulta con el equipo.');}
     history.push({role:'user',content:message},{role:'assistant',content:data.answer.slice(0,1200)});while(history.length>10)history.shift();status.textContent='';
   }catch(e){status.textContent=e.name==='TimeoutError'?'La consulta tardó demasiado. Intenta nuevamente.':e instanceof TypeError?'No pudimos conectar con el asistente. Usa Contactar mientras el equipo activa el servicio.':e.message;}
   finally{busy=false;panel.querySelectorAll('form button').forEach(b=>b.disabled=false);}
 }
 form.onsubmit=e=>{e.preventDefault();if(busy)return;const text=form.elements.message.value.trim();if(!text)return;form.reset();send(text);};
 panel.querySelector('.cr-chat-rooms').onsubmit=e=>{e.preventDefault();const f=e.target,arrival=f.elements.arrival.value,departure=f.elements.departure.value,people=Number(f.elements.people.value);if(departure<=arrival){status.textContent='La salida debe ser posterior a la llegada.';return;}send(`Consultar habitaciones para ${people} personas, del ${arrival} al ${departure}.`,{arrival,departure,people});};
})();
